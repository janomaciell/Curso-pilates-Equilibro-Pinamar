from rest_framework import serializers
from .models import Transaction, ClaseAccess
from apps.clases.serializers import ClaseListSerializer

class TransactionSerializer(serializers.ModelSerializer):
    clase_title = serializers.CharField(source='clase.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Transaction
        fields = ('id', 'user_email', 'clase', 'clase_title', 'mp_payment_id', 
                 'amount', 'status', 'payment_method', 'created_at', 'approved_at')
        read_only_fields = ('id', 'user', 'mp_payment_id', 'status', 'created_at', 'approved_at')


class ClaseAccessSerializer(serializers.ModelSerializer):
    clase = ClaseListSerializer(read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = ClaseAccess
        fields = ('id', 'clase', 'is_active', 'purchased_at', 'progress')

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
    clase_id = serializers.IntegerField()