from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permiso para que solo el propietario pueda editar"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user


class IsClaseOwner(permissions.BasePermission):
    """Permiso para verificar si el usuario tiene acceso al clase"""
    
    def has_object_permission(self, request, view, obj):
        from apps.payments.models import ClaseAccess
        
        # Permitir si es admin
        if request.user.is_staff:
            return True
        
        # Verificar si tiene acceso al clase
        return ClaseAccess.objects.filter(
            user=request.user,
            clase=obj,
            is_active=True
        ).exists()