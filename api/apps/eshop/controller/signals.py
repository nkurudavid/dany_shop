from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import transaction
from django.core.mail import send_mail
from django.db.models import F

from apps.eshop.models import Product, StockMovement, Order, OrderItem
from apps.eshop.constants import MovementType, OrderStatus


# ===========================
# Track old product quantity
# ===========================
@receiver(pre_save, sender=Product)
def track_old_quantity(sender, instance, **kwargs):
    """Store old quantity before saving to detect manual changes in admin."""
    if instance.pk:
        try:
            # Use only() to fetch only the quantity field
            old_product = Product.objects.only('quantity').get(pk=instance.pk)
            instance._old_quantity = old_product.quantity
        except Product.DoesNotExist:
            instance._old_quantity = 0
    else:
        instance._old_quantity = 0


# ===========================
# Create stock movement on product changes
# ===========================
@receiver(post_save, sender=Product)
def create_movement_for_product_change(sender, instance, created, **kwargs):
    """Create stock movement when product is added or quantity changes manually."""
    
    # Skip if this save came from a StockMovement update
    if getattr(instance, '_skip_signal', False):
        return
    
    if created:
        # New product with initial stock
        if instance.quantity > 0:
            movement = StockMovement(
                product=instance,
                movement_type=MovementType.STOCK_IN,
                quantity=instance.quantity,
                total_price=instance.price * instance.quantity,
                notes="Initial stock on product creation",
            )
            movement._skip_stock_update = True  # Don't update stock again
            movement.save()
        return

    # Manual quantity changes (only if quantity actually changed)
    old_qty = getattr(instance, "_old_quantity", None)
    if old_qty is None or old_qty == instance.quantity:
        return

    if instance.quantity > old_qty:
        diff = instance.quantity - old_qty
        movement = StockMovement(
            product=instance,
            movement_type=MovementType.STOCK_IN,
            quantity=diff,
            total_price=instance.price * diff,
            notes="Manual stock increase in admin",
        )
        movement._skip_stock_update = True  # Don't update stock again
        movement.save()
        
    elif instance.quantity < old_qty:
        diff = old_qty - instance.quantity
        movement = StockMovement(
            product=instance,
            movement_type=MovementType.STOCK_OUT,
            quantity=diff,
            total_price=instance.price * diff,
            notes="Manual stock decrease in admin",
        )
        movement._skip_stock_update = True  # Don't update stock again
        movement.save()


# ===========================
# Track old order status
# ===========================
@receiver(pre_save, sender=Order)
def store_old_order_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_status = Order.objects.only('status').get(pk=instance.pk).status
        except Order.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


# ===========================
# Update stock when order is completed/paid
# ===========================
@receiver(post_save, sender=Order)
def handle_order_stock(sender, instance, created, **kwargs):
    """Reduce product stock when order is paid or completed."""
    old_status = getattr(instance, "_old_status", None)

    # Only process if status changed to PAID or COMPLETED
    if instance.status in [OrderStatus.PAID, OrderStatus.COMPLETED] and old_status != instance.status:
        with transaction.atomic():
            for item in instance.order_items.select_related('product'):
                product = item.product

                # Update stock using F() expression to avoid race conditions
                Product.objects.filter(pk=product.pk).update(
                    quantity=F('quantity') - item.quantity
                )
                
                # Refresh product to get updated quantity
                product.refresh_from_db()
                
                # Ensure quantity doesn't go negative
                if product.quantity < 0:
                    Product.objects.filter(pk=product.pk).update(quantity=0)
                    product.quantity = 0

                # Record stock movement
                movement = StockMovement(
                    product=product,
                    movement_type=MovementType.STOCK_OUT,
                    quantity=item.quantity,
                    total_price=item.quantity * product.price,
                    notes=f"Order #{instance.order_number} processed",
                )
                movement._skip_stock_update = True  # Stock already updated above
                movement.save()
                
                # Send low stock alert if needed
                if product.quantity < 10 and product.quantity > 0:
                    send_low_stock_email(product)


# ===========================
# Low stock email alert
# ===========================
def send_low_stock_email(product):
    """Send email alert when product stock is low."""
    try:
        send_mail(
            subject=f"⚠️ Low Stock Alert: {product.product_name}",
            message=f"The product '{product.product_name}' is low on stock.\n\n"
                    f"Current quantity: {product.quantity}\n"
                    f"Product ID: {product.id}\n\n"
                    f"Please restock soon.\n\n"
                    f"This is an automated notification.",
            from_email="noreply@yourshop.com",
            recipient_list=["admin@yourshop.com"],
            fail_silently=True,  # Don't crash if email fails
        )
    except Exception as e:
        # Log the error but don't crash
        print(f"Failed to send low stock email: {e}")