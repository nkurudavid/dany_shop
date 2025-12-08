from django.db import models



class OrderStatus(models.TextChoices):
    PENDING = "Pending", "Pending"
    PROCESSING = "Processing", "Processing"
    SHIPPED = "Shipped", "Shipped"
    DELIVERED = "Delivered", "Delivered"
    SUCCESS = "Success", "Success"
    CANCELED = "Canceled", "Canceled"


    
class MovementType(models.TextChoices):
    STOCK_IN = "Stock In", "Stock In"
    STOCK_OUT = "Stock Out", "Stock Out"



class UnitChoices(models.TextChoices):
    GRAM = "g", "Grams"
    KILOGRAM = "kg", "Kilograms"
    PIECE = "pc", "Pieces"
    BOX = "box", "Box"