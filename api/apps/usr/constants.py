from django.db import models

class UserRole(models.TextChoices):
    CUSTOMER = "customer", "Customer"
    SELLER = "seller", "Seller"
    STORE_MANAGER = "store_manager", "Store Manager"
    ADMIN = "admin", "Admin"

class UserGender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    OTHER = "other", "Other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say", "Prefer not to say"
