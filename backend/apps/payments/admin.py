from django.contrib import admin
from .models import Transaction, ClaseAccess

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('mp_payment_id', 'user', 'clase', 'amount', 'status', 'created_at', 'approved_at')
    list_filter = ('status', 'created_at', 'approved_at')
    search_fields = ('mp_payment_id', 'user__email', 'clase__title')
    readonly_fields = ('created_at', 'updated_at', 'approved_at', 'raw_data')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('user', 'clase', 'amount', 'status')
        }),
        ('Mercado Pago', {
            'fields': ('mp_payment_id', 'mp_preference_id', 'mp_merchant_order_id', 'payment_method', 'payment_type')
        }),
        ('Metadata', {
            'fields': ('ip_address', 'raw_data')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at', 'approved_at')
        }),
    )
    
    actions = ['approve_transactions']
    
    def approve_transactions(self, request, queryset):
        for transaction in queryset:
            if transaction.status == 'pending':
                transaction.approve()
        self.message_user(request, f"{queryset.count()} transacciones aprobadas")
    approve_transactions.short_description = "Aprobar transacciones seleccionadas"

@admin.register(ClaseAccess)
class ClaseAccessAdmin(admin.ModelAdmin):
    list_display = ('user', 'clase', 'is_active', 'purchased_at', 'expires_at')
    list_filter = ('is_active', 'purchased_at')
    search_fields = ('user__email', 'clase__title')
    readonly_fields = ('created_at', 'updated_at', 'purchased_at')