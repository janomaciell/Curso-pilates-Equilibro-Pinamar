from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import json
import logging
import re
import uuid
from .models import Transaction, ClaseAccess, TransactionClase
from .mercadopago import MercadoPagoService
from apps.users.models import User
from apps.clases.models import Clase

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def mercadopago_webhook(request):
    """Webhook para notificaciones de Mercado Pago"""
    try:
        mp_service = MercadoPagoService()
        if not mp_service.verify_webhook_signature(request):
            logger.warning("Webhook con firma inválida rechazado")
            return JsonResponse({"status": "error", "message": "Firma inválida"}, status=401)

        data = json.loads(request.body)
        logger.info(f"Webhook recibido: {data}")

        if data.get("type") != "payment":
            return JsonResponse({"status": "ignored"}, status=200)

        payment_id = data.get("data", {}).get("id")
        if not payment_id:
            return JsonResponse({"status": "error", "message": "No payment_id"}, status=400)

        payment_info = mp_service.get_payment_info(payment_id)

        # ------------------------------------------------------------------
        # Resolver la transacción a partir de metadata / external_reference
        # ------------------------------------------------------------------
        external_reference = payment_info.get("external_reference", "") or ""
        metadata = payment_info.get("metadata", {}) or {}

        meta_user_id = metadata.get("user_id")
        meta_cart_ref = metadata.get("cart_reference")   # nuevo formato
        meta_clase_id = metadata.get("clase_id")         # legacy

        # Parsear external_reference — dos formatos posibles:
        # Nuevo:   "user_{user_id}_cart_{cart_uuid}"
        # Legacy:  "user_{user_id}_clase_{clase_id}"
        ref_user_id = None
        ref_cart_ref = None
        ref_clase_id = None

        if external_reference:
            ext = str(external_reference).strip()
            # Nuevo formato
            m_cart = re.match(r"user_(\d+)_cart_([0-9a-f-]+)", ext)
            # Legacy
            m_clase = re.match(r"user_(\d+)_clase_(\d+)", ext)

            if m_cart:
                ref_user_id = int(m_cart.group(1))
                ref_cart_ref = m_cart.group(2)
            elif m_clase:
                ref_user_id = int(m_clase.group(1))
                ref_clase_id = int(m_clase.group(2))

        user_id = meta_user_id or ref_user_id
        cart_reference = meta_cart_ref or ref_cart_ref
        clase_id = meta_clase_id or ref_clase_id   # solo para legacy

        if not user_id:
            logger.error(
                f"Webhook pago {payment_id}: no se pudo resolver user_id "
                f"(metadata={metadata}, external_reference={external_reference})"
            )
            return JsonResponse(
                {"status": "error", "message": "No se pudo resolver usuario del pago"},
                status=400,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist as e:
            logger.error(f"Webhook pago {payment_id}: usuario no encontrado - {e}")
            return JsonResponse(
                {"status": "error", "message": "Usuario no encontrado"},
                status=400,
            )

        # ------------------------------------------------------------------
        # Buscar/crear la transacción (idempotente)
        # ------------------------------------------------------------------
        pref_id = payment_info.get("preference_id") or ""
        transaction = None

        # 0) Si ya existe una transacción con este payment_id
        transaction = Transaction.objects.filter(mp_payment_id=str(payment_id)).first()

        # 1) Buscar por cart_reference (nuevo formato)
        if not transaction and cart_reference:
            try:
                cart_uuid = uuid.UUID(cart_reference)
                transaction = Transaction.objects.filter(
                    cart_reference=cart_uuid,
                    user=user,
                ).order_by("-created_at").first()
            except (ValueError, AttributeError):
                pass

        # 2) Buscar por preference_id (compatibilidad)
        if not transaction and pref_id:
            transaction = (
                Transaction.objects.filter(
                    mp_preference_id=pref_id,
                    user=user,
                )
                .order_by("-created_at")
                .first()
            )

        # 3) Buscar por clase_id legacy
        if not transaction and clase_id:
            try:
                clase_obj = Clase.objects.get(id=clase_id)
                transaction = (
                    Transaction.objects.filter(
                        user=user,
                        clase=clase_obj,
                        status="pending",
                    )
                    .order_by("-created_at")
                    .first()
                )
            except Clase.DoesNotExist:
                pass

        # 4) Crear transacción nueva si no se encontró (no debería pasar)
        if not transaction:
            logger.warning(f"Webhook pago {payment_id}: no se encontró transacción, creando nueva")
            transaction = Transaction(
                user=user,
                mp_preference_id=pref_id,
                amount=payment_info.get("transaction_amount", 0),
                status="pending",
            )
            # Agregar clase legacy si aplica
            if clase_id:
                try:
                    transaction.clase = Clase.objects.get(id=clase_id)
                except Clase.DoesNotExist:
                    pass

        # Asociar payment_id
        transaction.mp_payment_id = str(payment_id)

        # Actualizar campos
        mp_status = payment_info.get("status")
        transaction.status = map_mp_status(mp_status)
        transaction.payment_method = payment_info.get("payment_method_id", "")
        transaction.payment_type = payment_info.get("payment_type_id", "")
        transaction.mp_merchant_order_id = str(payment_info.get("order", {}).get("id", ""))
        transaction.raw_data = payment_info

        # Si está aprobado, dar acceso (30 días) a todas las clases del carrito
        if transaction.status == 'approved':
            transaction.approve()
            logger.info(f"Pago {payment_id} aprobado - Acceso otorgado (30 días)")

        transaction.save()

        return JsonResponse({"status": "success"}, status=200)

    except Exception as e:
        logger.error(f"Error en webhook: {str(e)}", exc_info=True)
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


def map_mp_status(mp_status):
    """Mapear estados de Mercado Pago a estados internos"""
    status_map = {
        "approved": "approved",
        "pending": "pending",
        "in_process": "pending",
        "rejected": "rejected",
        "cancelled": "cancelled",
        "refunded": "refunded",
    }
    return status_map.get(mp_status, "pending")