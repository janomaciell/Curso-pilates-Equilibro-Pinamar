from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from .models import Transaction, ClaseAccess, TransactionClase
from .serializers import (
    TransactionSerializer,
    ClaseAccessSerializer,
    CreatePaymentSerializer
)
from .mercadopago import MercadoPagoService
from apps.clases.models import Clase
import logging

logger = logging.getLogger(__name__)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para transacciones"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-created_at')


class ClaseAccessViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para accesos a clases (Mis Clases)"""
    serializer_class = ClaseAccessSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ClaseAccess.objects.filter(
            user=self.request.user,
            is_active=True
        ).select_related('clase').order_by('-purchased_at')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_clases(request):
    """Lista de clases compradas por el usuario (Mis Clases).
    
    Solo retorna accesos activos y NO expirados.
    """
    now = timezone.now()
    accesses = ClaseAccess.objects.filter(
        user=request.user,
        is_active=True,
    ).select_related('clase').order_by('-purchased_at')

    # Desactivar accesos expirados silenciosamente
    expired_ids = []
    valid_accesses = []
    for access in accesses:
        if access.expires_at and now > access.expires_at:
            expired_ids.append(access.id)
        else:
            valid_accesses.append(access)

    if expired_ids:
        ClaseAccess.objects.filter(id__in=expired_ids).update(is_active=False)
        logger.info(f"[ClaseAccess] Desactivados {len(expired_ids)} accesos expirados para user {request.user.id}")

    serializer = ClaseAccessSerializer(valid_accesses, many=True)
    return Response(serializer.data)


def get_frontend_url():
    """Obtener la URL base del frontend."""
    url = getattr(settings, 'FRONTEND_URL', None)
    if url and url.strip():
        return url.strip().rstrip('/')
    return 'http://localhost:5173'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """Crear preferencia de pago en Mercado Pago (carrito multi-clase).
    
    Espera: { "clase_ids": [1, 2, 3] }
    """
    print("create_payment payload:", request.data)
    serializer = CreatePaymentSerializer(data=request.data)

    if not serializer.is_valid():
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    clase_ids = serializer.validated_data['clase_ids']
    user = request.user

    # Obtener las clases activas
    clases = list(Clase.objects.filter(id__in=clase_ids, is_active=True))
    found_ids = {c.id for c in clases}
    missing = set(clase_ids) - found_ids
    if missing:
        return Response(
            {'error': f'Clases no encontradas o inactivas: {list(missing)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar si ya tiene acceso a alguna (activa y no expirada)
    now = timezone.now()
    already_owned = ClaseAccess.objects.filter(
        user=user,
        clase__in=clases,
        is_active=True,
    ).filter(
        # Sin expiración O aún vigente
        expires_at__isnull=True
    ) | ClaseAccess.objects.filter(
        user=user,
        clase__in=clases,
        is_active=True,
        expires_at__gt=now,
    )
    already_owned = already_owned.select_related('clase')

    if already_owned.exists():
        titles = ', '.join(a.clase.title for a in already_owned)
        return Response(
            {'error': f'Ya tenés acceso vigente a: {titles}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        mp_service = MercadoPagoService()

        frontend_url = get_frontend_url()
        return_url = f"{frontend_url}/payment-success"

        backend_url = (getattr(settings, 'BACKEND_URL', None) or '').strip()
        if backend_url:
            notification_url = f"{backend_url.rstrip('/')}/api/payments/webhook/"
        else:
            notification_url = request.build_absolute_uri('/api/payments/webhook/')

        # Crear transacción primero para obtener el UUID
        total_amount = sum(c.price for c in clases)
        transaction = Transaction.objects.create(
            user=user,
            clase=clases[0] if len(clases) == 1 else None,  # legacy compat
            amount=total_amount,
            status='pending',
            ip_address=get_client_ip(request)
        )

        # Vincular clases al carrito
        for c in clases:
            TransactionClase.objects.create(
                transaction=transaction,
                clase=c,
                unit_price=c.price
            )

        logger.info(f"[MP] Creating cart payment for user {user.id}, clases={clase_ids}, cart={transaction.cart_reference}")

        preference = mp_service.create_preference(
            clases=clases,
            user=user,
            return_url=return_url,
            notification_url=notification_url,
            cart_reference=transaction.cart_reference,
        )

        # Guardar el preference_id
        transaction.mp_preference_id = preference['preference_id']
        transaction.save(update_fields=['mp_preference_id'])

        init_point = preference.get('init_point', '')
        sandbox_init_point = (preference.get('sandbox_init_point') or '').strip() or init_point
        use_sandbox = getattr(settings, 'MERCADOPAGO_SANDBOX', True)
        checkout_url = sandbox_init_point if use_sandbox else init_point

        logger.info(f"[MP] Transaction created: {transaction.id} - preference: {preference['preference_id']} (sandbox={use_sandbox})")

        return Response({
            'preference_id': preference['preference_id'],
            'init_point': checkout_url,
            'sandbox_init_point': sandbox_init_point,
            'sandbox': use_sandbox,
            'transaction_id': transaction.id,
            'cart_reference': str(transaction.cart_reference),
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"create_payment: error al crear pago: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Error al crear el pago: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_id):
    """Verificar estado de un pago por payment_id"""
    try:
        transaction = Transaction.objects.get(
            mp_payment_id=payment_id,
            user=request.user
        )
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)
    except Transaction.DoesNotExist:
        return Response(
            {'error': 'Transacción no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_preference_status(request, preference_id):
    """Consultar manualmente el estado de un pago por preference_id.
    
    Este endpoint hace polling a MercadoPago para encontrar pagos asociados
    a una preferencia, útil cuando el webhook aún no llegó.
    """
    try:
        transaction = Transaction.objects.get(
            mp_preference_id=preference_id,
            user=request.user
        )

        logger.info(f"[Polling] Checking preference: {preference_id}")

        mp_service = MercadoPagoService()

        try:
            if transaction.mp_payment_id:
                logger.info(f"[Polling] Consulting payment_id: {transaction.mp_payment_id}")
                payment_info = mp_service.get_payment_info(transaction.mp_payment_id)

                mp_status = payment_info.get('status')
                new_status = map_mp_status(mp_status)

                logger.info(f"[Polling] Payment status: MP={mp_status}, internal={new_status}")

                old_status = transaction.status
                transaction.status = new_status
                transaction.payment_method = payment_info.get('payment_method_id', '')
                transaction.payment_type = payment_info.get('payment_type_id', '')

                if new_status == 'approved' and old_status != 'approved':
                    transaction.approve()
                    logger.info(f"[Polling] ✓ Payment {transaction.mp_payment_id} APPROVED!")

                transaction.save()

            else:
                # Buscar por external_reference (cart_reference)
                cart_ref = str(transaction.cart_reference)
                external_reference = f"user_{transaction.user.id}_cart_{cart_ref}"
                logger.info(f"[Polling] Searching for payment: external_reference={external_reference}")

                payment_data = mp_service.search_payments_by_external_reference(external_reference)

                # Fallback: buscar por el formato legacy clase
                if not payment_data and transaction.clase:
                    ext_ref_legacy = f"user_{transaction.user.id}_clase_{transaction.clase.id}"
                    logger.info(f"[Polling] Fallback legacy search: {ext_ref_legacy}")
                    payment_data = mp_service.search_payments_by_external_reference(ext_ref_legacy)

                if payment_data:
                    pid = str(payment_data.get("id", ""))
                    other = Transaction.objects.filter(mp_payment_id=pid).first()
                    if other and other.mp_preference_id != preference_id:
                        logger.info(f"[Polling] Payment already linked to other preference, ignoring")
                        payment_data = None

                if payment_data:
                    payment_id_val = str(payment_data.get("id", ""))
                    mp_status = payment_data.get("status")

                    logger.info(f"[Polling] ✓ Payment FOUND: {payment_id_val}, status: {mp_status}")

                    other = Transaction.objects.filter(mp_payment_id=payment_id_val).exclude(pk=transaction.pk).first()
                    if other:
                        logger.info(f"[Polling] Payment {payment_id_val} already linked to transaction {other.pk}, returning that one")
                        transaction = other
                        serializer = TransactionSerializer(transaction)
                        return Response(serializer.data)

                    transaction.mp_payment_id = payment_id_val
                    transaction.status = map_mp_status(mp_status)
                    transaction.payment_method = payment_data.get("payment_method_id", "")
                    transaction.payment_type = payment_data.get("payment_type_id", "")

                    if transaction.status == "approved":
                        transaction.approve()
                        logger.info(f"[Polling] ✓ Payment {payment_id_val} APPROVED via polling!")

                    transaction.save()
                else:
                    logger.info(f"[Polling] No payment found yet (user probably still filling form)")

        except Exception as e:
            logger.error(f"[Polling] Error querying MP: {str(e)}", exc_info=True)

        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)

    except Transaction.DoesNotExist:
        logger.warning(f"[Polling] Transaction not found: {preference_id}")
        return Response(
            {'error': 'Transacción no encontrada', 'status': 'not_found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"[Polling] Unexpected error: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e), 'status': 'error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


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


def get_client_ip(request):
    """Obtener IP del cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip