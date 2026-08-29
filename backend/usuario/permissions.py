from rest_framework import permissions

class IsInvestigador(permissions.BasePermission):
    """
    Permiso personalizado que solo permite acceso a usuarios con rol de Investigador.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_investigador())

class IsParticipante(permissions.BasePermission):
    """
    Permiso personalizado que solo permite acceso a usuarios con rol de Participante.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_participante())

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin())
