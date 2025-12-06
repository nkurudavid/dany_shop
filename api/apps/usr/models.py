from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.usr.user_manager import UserManager
from apps.usr.constants import UserGender, UserRole


class User(AbstractUser):
    first_name = models.CharField(verbose_name="First Name", max_length=50, blank=False)
    last_name = models.CharField(verbose_name="Last Name", max_length=50, blank=False)
    email = models.EmailField(verbose_name="Email", max_length=255, unique=True, blank=False)
    gender = models.CharField(max_length=30, choices=UserGender.choices, verbose_name="Gender")
    role = models.CharField(max_length=30, choices=UserRole.choices, verbose_name="Role")

    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    is_staff = models.BooleanField(default=False, verbose_name="Is Staff")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    username = None

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["role", "first_name", "last_name"]
    
    objects = UserManager()
    
    # update django about user model
    class Meta(AbstractUser.Meta):
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return "{} {} - {}".format(self.first_name, self.last_name, self.role)




class UserProfile(models.Model):
    user = models.OneToOneField(get_user_model(), verbose_name="User", on_delete=models.CASCADE, related_name="profile")
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    sector = models.CharField(max_length=100, blank=True, null=True)
    street = models.CharField(max_length=255, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.get_full_name()}"
