from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Esta classe é para permitir  ao dono da tarefa editar, mas permite leitura para usuários compartilhados.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.owner == request.user or request.user in obj.shared_with.all()
        return obj.owner == request.user