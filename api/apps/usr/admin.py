from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from apps.usr.models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "gender", "is_active", "is_staff", "created_at",)
    list_display_links = ("email",)
    list_filter = ("role", "gender", "is_active", "is_staff", "created_at")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)
    
    fieldsets = (
        ("Login Credentials", {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "gender")}),
        ("Role & Permissions", {
            "classes": ("collapse",),
            "fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
        ("Important Dates", {"fields": ("last_login", "created_at")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("first_name", "last_name", "gender", "role", "email", "password1", "password2"),
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing user >> email becomes read-only
            return self.readonly_fields + ("email",)
        return self.readonly_fields
