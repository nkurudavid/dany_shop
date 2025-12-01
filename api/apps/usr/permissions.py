from rest_framework.permissions import BasePermission
from apps.usr.constants import UserRole



class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.CUSTOMER

class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.SELLER

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.STORE_MANAGER


class IsNotAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and not request.user.is_superuser