from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
from apps.users.models import User
from apps.clases.models import Clase


ACCESS_DURATION_DAYS = 30


class Transaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
        ('cancelled', 'Cancelado'),
        ('refunded', 'Reembolsado'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')

    # Relación legacy 1:1 — se mantiene null para compatibilidad con transacciones viejas.
    # Las nuevas transacciones usan la relación M2M `clases` a través de TransactionClase.
    clase = models.ForeignKey(
        Clase, on_delete=models.CASCADE, related_name='transactions',
        null=True, blank=True
    )

    # Clases del carrito (puede ser una o varias)
    clases = models.ManyToManyField(
        Clase, through='TransactionClase',
        related_name='cart_transactions', blank=True
    )
    # Identificador único del carrito (se usa como external_reference en MP)
    cart_reference = models.UUIDField(
        'Referencia del carrito', default=uuid.uuid4,
        null=True, blank=True
    )

    # Mercado Pago data
    mp_payment_id = models.CharField(
        'ID de pago MP', max_length=100, unique=True, blank=True, null=True
    )
    mp_preference_id = models.CharField('ID de preferencia MP', max_length=100, blank=True)
    mp_merchant_order_id = models.CharField('ID de orden MP', max_length=100, blank=True)

    amount = models.DecimalField('Monto', max_digits=10, decimal_places=2)
    status = models.CharField('Estado', max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField('Método de pago', max_length=50, blank=True)
    payment_type = models.CharField('Tipo de pago', max_length=50, blank=True)

    # Metadata
    raw_data = models.JSONField('Datos crudos', default=dict, blank=True)
    ip_address = models.GenericIPAddressField('IP', null=True, blank=True)

    created_at = models.DateTimeField('Fecha de creación', auto_now_add=True)
    updated_at = models.DateTimeField('Última actualización', auto_now=True)
    approved_at = models.DateTimeField('Fecha de aprobación', null=True, blank=True)

    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transacción'
        verbose_name_plural = 'Transacciones'
        ordering = ['-created_at']

    def __str__(self):
        return f"Transaction {self.mp_payment_id or self.mp_preference_id} - {self.user.email} - {self.status}"

    def approve(self):
        """Aprobar transacción y dar acceso a todos los cursos del carrito por 30 días.

        FIX: no hace self.save() aquí. El caller debe guardar después.
        """
        self.status = 'approved'
        self.approved_at = timezone.now()
        expires = timezone.now() + timedelta(days=ACCESS_DURATION_DAYS)

        # Clases via M2M (carrito nuevo)
        cart_clases = list(self.clases.all())

        # Clase legacy (transacciones viejas 1:1)
        if self.clase and self.clase not in cart_clases:
            cart_clases.append(self.clase)

        for clase in cart_clases:
            ClaseAccess.objects.update_or_create(
                user=self.user,
                clase=clase,
                defaults={
                    'is_active': True,
                    'purchased_at': timezone.now(),
                    'expires_at': expires,
                    'transaction': self,
                }
            )


class TransactionClase(models.Model):
    """Tabla intermedia Transaction ↔ Clase (carrito)."""
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    clase = models.ForeignKey(Clase, on_delete=models.CASCADE)
    unit_price = models.DecimalField('Precio unitario', max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'transaction_clases'
        unique_together = ['transaction', 'clase']
        verbose_name = 'Clase de transacción'
        verbose_name_plural = 'Clases de transacción'

    def __str__(self):
        return f"{self.transaction} → {self.clase.title}"


class ClaseAccess(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clase_accesses')
    clase = models.ForeignKey(Clase, on_delete=models.CASCADE, related_name='user_accesses')
    transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True)

    is_active = models.BooleanField('Activo', default=True)
    purchased_at = models.DateTimeField('Fecha de compra', auto_now_add=True)
    expires_at = models.DateTimeField('Fecha de expiración', null=True, blank=True)

    created_at = models.DateTimeField('Fecha de creación', auto_now_add=True)
    updated_at = models.DateTimeField('Última actualización', auto_now=True)

    class Meta:
        db_table = 'clase_accesses'
        verbose_name = 'Acceso a clase'
        verbose_name_plural = 'Accesos a clases'
        unique_together = ['user', 'clase']
        ordering = ['-purchased_at']

    def __str__(self):
        return f"{self.user.email} - {self.clase.title}"

    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    @property
    def days_remaining(self):
        """Días restantes de acceso. None si no tiene expiración."""
        if not self.expires_at:
            return None
        delta = self.expires_at - timezone.now()
        return max(0, delta.days)