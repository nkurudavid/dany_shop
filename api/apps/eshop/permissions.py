from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.usr.constants import UserRole


# ============================
#   COMMON CHECKS
# ============================
def is_seller(user):
    return user.role in [UserRole.SELLER, UserRole.STORE_MANAGER]


def is_customer(user):
    return user.role == UserRole.CUSTOMER


def is_admin(user):
    return user.role == UserRole.ADMIN


# ============================
#   PERMISSIONS
# ============================

class IsSeller(BasePermission):
    """
    Allows access only to sellers or store managers.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and is_seller(request.user)


class IsCustomer(BasePermission):
    """
    Allows access only to customers.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and is_customer(request.user)


class IsAdminOrSeller(BasePermission):
    """
    Admin has full access.
    Sellers and Store Managers have restricted access depending on view logic.
    Useful for product management, orders processing, inventory, etc.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (is_admin(request.user) or is_seller(request.user))
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Customers can modify ONLY their own objects.
    Example use cases:
        - Wishlist
        - Reviews
        - Customer Orders
    Others can only read.
    """
    def has_object_permission(self, request, view, obj):
        # SAFE (GET, HEAD, OPTIONS) → allow everyone
        if request.method in SAFE_METHODS:
            return True

        # For modifying, must be the owner
        return (
            request.user.is_authenticated and 
            hasattr(obj, "user") and 
            obj.user == request.user
        )
