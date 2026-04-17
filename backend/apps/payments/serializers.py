from rest_framework import serializers
from .models import Transaction, ClaseAccess, TransactionClase
from apps.clases.serializers import ClaseListSerializer


class TransactionClaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionClase
        fields = ('clase', 'unit_price')


class TransactionSerializer(serializers.ModelSerializer):
    clase_title = serializers.CharField(source='clase.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    clases_data = TransactionClaseSerializer(
        source='transactionclase_set', many=True, read_only=True
    )

    class Meta:
        model = Transaction
        fields = (
            'id', 'user_email', 'clase', 'clase_title',
            'clases_data', 'cart_reference',
            'mp_payment_id', 'amount', 'status',
            'payment_method', 'created_at', 'approved_at'
        )
        read_only_fields = (
            'id', 'user', 'mp_payment_id', 'status',
            'cart_reference', 'created_at', 'approved_at'
        )


class ClaseAccessSerializer(serializers.ModelSerializer):
    clase = ClaseListSerializer(read_only=True)
    progress = serializers.SerializerMethodField()
    expires_at = serializers.DateTimeField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = ClaseAccess
        fields = (
            'id', 'clase', 'is_active',
            'purchased_at', 'expires_at', 'days_remaining', 'is_expired',
            'progress'
        )

    def get_progress(self, obj):
        from apps.clases.models import LessonProgress
        total_lessons = obj.clase.total_lessons
        if total_lessons == 0:
            return 0
        completed_lessons = LessonProgress.objects.filter(
            user=obj.user,
            lesson__module__clase=obj.clase,
            completed=True
        ).count()
        return int((completed_lessons / total_lessons) * 100)


class CreatePaymentSerializer(serializers.Serializer):
    """Aceptar una o varias clases (carrito)."""
    clase_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        max_length=20,
    )

    def validate_clase_ids(self, value):
        # Eliminar duplicados manteniendo orden
        seen = set()
        unique = []
        for v in value:
            if v not in seen:
                seen.add(v)
                unique.append(v)
        return unique