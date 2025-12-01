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
