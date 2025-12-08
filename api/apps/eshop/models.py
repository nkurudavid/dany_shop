from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.safestring import mark_safe

from apps.eshop.constants import UnitChoices, MovementType, OrderStatus



class ProductCategory(models.Model):
    category_name = models.CharField(verbose_name="Category Name", max_length=100, unique=True, db_index=True)
    description = models.TextField(verbose_name="Description", blank=True, null=True)

    class Meta:
        verbose_name = "Product Category"
        verbose_name_plural = "Product Categories"
        ordering = ['category_name']

    def __str__(self):
        return self.category_name



class Product(models.Model):
    category = models.ForeignKey(ProductCategory, verbose_name="Category", related_name='products', on_delete=models.CASCADE)
    product_name = models.CharField(verbose_name="Product Name", max_length=100, unique=True, db_index=True)
    description = models.TextField(verbose_name="Description", blank=True, null=True)
    price = models.DecimalField(verbose_name="Price", max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0.00)])
    quantity = models.IntegerField(verbose_name="Quantity", default=0, validators=[MinValueValidator(0)])
    unit = models.CharField(verbose_name="Unit", max_length=5, choices=UnitChoices.choices, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ['-created_at']

    def __str__(self):
        return self.product_name

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return reviews.aggregate(models.Avg('rating'))['rating__avg']
        return None

    @property
    def in_stock(self):
        return self.quantity > 0




class ProductImage(models.Model):
    product = models.ForeignKey(Product, verbose_name="Product", related_name="product_images", on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    image_data = models.BinaryField(verbose_name="Image Data", default=b"")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.product.product_name} - {self.file_name}"

    def image_preview(self):
        """
        Preview for Django admin — shows the stored image.
        """
        if not self.image_data:
            return "No Image"

        # Convert binary to base64 for inline display
        import base64
        data = base64.b64encode(self.image_data).decode("utf-8")
        return mark_safe(f'<img src="data:{self.mime_type};base64,{data}" width="80" />')

    image_preview.short_description = "Preview"
    image_preview.allow_tags = True




class StockMovement(models.Model):
    product = models.ForeignKey(Product, verbose_name="Product", related_name="stock_movements", on_delete=models.CASCADE)
    movement_type = models.CharField(verbose_name="Movement Type", choices=MovementType.choices, max_length=15)
    quantity = models.IntegerField(verbose_name="Quantity", validators=[MinValueValidator(1)])
    total_price = models.DecimalField(verbose_name="Total Price", max_digits=10, decimal_places=2, default=0.00)
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(verbose_name="Notes", blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_date']
        verbose_name = "Stock Movement"
        verbose_name_plural = "Stock Movements"

    def __str__(self):
        return f"{self.product.product_name} - {self.movement_type} - {self.quantity}"

    def save(self, *args, **kwargs):
        if self.pk is None:
            if self.movement_type == self.MovementType.STOCK_IN:
                self.product.quantity += self.quantity
            elif self.movement_type == self.MovementType.STOCK_OUT:
                self.product.quantity = max(0, self.product.quantity - self.quantity)
            self.product.save()
        super().save(*args, **kwargs)




class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="User", related_name="wishlist_items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, verbose_name="Product", related_name="wishlist_items", on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ('user', 'product')
        verbose_name = "Wishlist Item"
        verbose_name_plural = "Wishlist Items"
        ordering = ['-added_date']

    def __str__(self):
        return f"{self.user} - {self.product.product_name}"




class Order(models.Model):
    client = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="Client", related_name="orders", on_delete=models.CASCADE)
    order_number = models.CharField(verbose_name="Order Number", max_length=100, unique=True, db_index=True)
    status = models.CharField(verbose_name="Status", max_length=15, choices=OrderStatus.choices, default=OrderStatus.PENDING, db_index=True)
    shipping_address = models.TextField(verbose_name="Shipping Address", blank=True, null=True)
    order_note = models.TextField(verbose_name="Order Note", blank=True, null=True)
    total_amount = models.DecimalField(verbose_name="Total Amount", max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(verbose_name="Payment Method", max_length=50)
    payment_id = models.CharField(verbose_name="Payment ID", max_length=100, blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_date']
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"{self.order_number} - {self.client}"

    def calculate_total(self):
        total = sum(item.quantity * item.price for item in self.order_items.all())
        self.total_amount = total
        return total




class OrderItem(models.Model):
    order = models.ForeignKey(Order, verbose_name="Order", related_name="order_items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, verbose_name="Product", on_delete=models.CASCADE)
    quantity = models.IntegerField(verbose_name="Quantity", default=1, validators=[MinValueValidator(1)])
    price = models.DecimalField(verbose_name="Price", max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.order.order_number} - {self.product.product_name}"

    @property
    def subtotal(self):
        return self.quantity * self.price




class Payment(models.Model):
    order = models.OneToOneField(Order, verbose_name="Order", related_name="payment", on_delete=models.CASCADE)
    amount = models.DecimalField(verbose_name="Amount", max_digits=10, decimal_places=2)
    payment_method = models.CharField(verbose_name="Payment Method", max_length=50)
    payment_id = models.CharField(verbose_name="Payment ID", max_length=100, blank=True, null=True, db_index=True)
    status = models.BooleanField(verbose_name="Payment Successful", default=False, db_index=True)
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_date']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"{self.order.order_number} - {'Paid' if self.status else 'Pending'}"




class Review(models.Model):
    product = models.ForeignKey(Product, verbose_name="Product", related_name="reviews", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name="User", on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(verbose_name="Rating", default=5, validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(verbose_name="Comment", blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_date']
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.product.product_name} - {self.user.username} ({self.rating}/5)"
