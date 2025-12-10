import base64
from django.contrib import admin
from django.utils.html import format_html
from django.db import models
from django.db.models import Sum, Count, Avg, F
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.template.response import TemplateResponse
from django.urls import path

from apps.eshop.admin_forms import ProductImageAdminForm, ProductImageForm
from apps.eshop.models import (
    ProductCategory, Product, ProductImage, StockMovement,
    Wishlist, Order, OrderItem, Payment, Review
)


# ===========================
# Inline Admin Classes
# ===========================
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    form = ProductImageForm
    extra = 1
    readonly_fields = ['file_name', 'mime_type', 'image_preview']
    # fields = ['upload_image', 'file_name', 'mime_type', 'image_preview']
    fields = ['upload', 'file_name', 'mime_type', 'image_preview']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal_display']
    fields = ['product', 'quantity', 'price', 'subtotal_display']
    
    def subtotal_display(self, obj):
        if obj.pk:
            return format_html('<strong>Frw {:,.2f}</strong>', obj.subtotal)
        return '-'
    subtotal_display.short_description = 'Subtotal'


class StockMovementInline(admin.TabularInline):
    model = StockMovement
    extra = 0
    readonly_fields = ['created_date', 'processed_by']
    fields = ['movement_type', 'quantity', 'total_price', 'processed_by', 'created_date']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


# ===========================
# Custom Admin Site
# ===========================
class CustomAdminSite(admin.AdminSite):
    site_header = "E-Shop Administration"
    site_title = "E-Shop Admin Portal"
    index_title = "Welcome to E-Shop Administration"
    
    def index(self, request, extra_context=None):
        total_products = Product.objects.count()
        total_quantity = Product.objects.aggregate(models.Sum("quantity"))["quantity__sum"] or 0

        total_value = Product.objects.annotate(
            total=models.F("quantity") * models.F("price")
        ).aggregate(models.Sum("total"))["total__sum"] or 0

        out_of_stock = Product.objects.filter(quantity=0).count()
        low_stock = Product.objects.filter(quantity__lt=10, quantity__gt=0).count()

        context = {
            **self.each_context(request),
            "total_products": total_products,
            "total_quantity": total_quantity,
            "total_value": total_value,
            "out_of_stock": out_of_stock,
            "low_stock": low_stock,
        }

        return TemplateResponse(request, "admin/custom_dashboard.html", context)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("inventory-report/", self.admin_view(self.inventory_report_view)),
        ]
        return custom_urls + urls
    
    def inventory_report_view(self, request):
        """View for inventory report"""
        products = Product.objects.all().annotate(
            stock_value=F("quantity") * F("price")
        ).order_by('-stock_value')

        total_value = products.aggregate(
            total=Sum(F('quantity') * F('price'))
        )['total'] or 0

        context = {
            **self.each_context(request),
            "products": products,
            "total_value": total_value,
        }
        return TemplateResponse(request, "admin/inventory_report.html", context)
    
    def each_context(self, request):
        context = super().each_context(request)
        low_stock = Product.objects.filter(quantity__lt=10, quantity__gt=0).count()

        if low_stock > 0:
            context["low_stock_warning"] = f"{low_stock} products are running low on stock!"

        return context


# Create custom admin site instance
custom_admin_site = CustomAdminSite(name="custom_admin")


# ===========================
# Product Category Admin
# ===========================
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['category_name', 'product_count', 'description_preview']
    search_fields = ['category_name', 'description']
    list_per_page = 20
    
    def product_count(self, obj):
        count = obj.products.count()
        url = reverse('admin:eshop_product_changelist') + f'?category__id__exact={obj.id}'
        return format_html('<a href="{}">{} products</a>', url, count)
    product_count.short_description = 'Products'
    
    def description_preview(self, obj):
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_preview.short_description = 'Description'


# ===========================
# Product Admin
# ===========================
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'product_name', 'category', 'price_display', 'quantity',
        'unit', 'stock_status', 'average_rating_display', 'created_at'
    ]
    list_filter = ['category', 'unit', 'created_at']
    search_fields = ['product_name', 'description', 'category__category_name']
    readonly_fields = ['created_at', 'average_rating_display', 'total_reviews', 'stock_value']
    date_hierarchy = 'created_at'
    list_per_page = 20
    inlines = [ProductImageInline, StockMovementInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'product_name', 'description')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'quantity', 'unit', 'stock_value')
        }),
        ('Statistics', {
            'fields': ('average_rating_display', 'total_reviews', 'created_at'),
            'classes': ('collapse',)
        }),
    )

    def price_display(self, obj):
        formatted_price = f"{obj.price:,.2f}"
        return format_html("<strong>Frw {}</strong>", formatted_price)
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'price'

    def stock_status(self, obj):
        if obj.quantity == 0:
            return format_html('<span style="color: red; font-weight: bold;">Out of Stock</span>')
        elif obj.quantity < 10:
            return format_html('<span style="color: orange; font-weight: bold;">Low Stock</span>')
        else:
            return format_html('<span style="color: green; font-weight: bold;">In Stock</span>')
    stock_status.short_description = 'Status'

    def average_rating_display(self, obj):
        avg = obj.average_rating
        if avg:
            stars = '⭐' * int(round(avg))
            return format_html('{} ({:.1f}/5)', stars, avg)
        return 'No reviews'
    average_rating_display.short_description = 'Rating'

    def total_reviews(self, obj):
        count = obj.reviews.count()
        return f'{count} review(s)'
    total_reviews.short_description = 'Total Reviews'

    def stock_value(self, obj):
        value = obj.price * obj.quantity
        formatted_value = f"{value:,.2f}"
        return format_html("<strong>Frw {}</strong>", formatted_value)
    stock_value.short_description = 'Stock Value'

    actions = ['mark_out_of_stock']

    def mark_out_of_stock(self, request, queryset):
        queryset.update(quantity=0)
        self.message_user(request, f'{queryset.count()} products marked as out of stock.')
    mark_out_of_stock.short_description = 'Mark selected as out of stock'


# ===========================
# Product Image Admin
# ===========================
class ProductImageAdmin(admin.ModelAdmin):
    form = ProductImageAdminForm
    list_display = ['product', 'image_preview', 'file_name', 'created_at']
    list_filter = ['product__category', 'created_at']
    search_fields = ['product__product_name', 'file_name']
    readonly_fields = ['file_name', 'mime_type', 'image_data', 'image_preview', 'created_at']
    fields = ['product', 'upload_image', 'file_name', 'mime_type', 'image_data', 'image_preview', 'created_at']
    list_per_page = 20

    def save_model(self, request, obj, form, change):
        """
        Handle uploaded file, convert & store into BinaryField.
        """
        file = form.cleaned_data.get("upload_image")

        if file:
            obj.file_name = file.name
            obj.mime_type = getattr(file, "content_type", "application/octet-stream")
            obj.image_data = file.read()

        super().save_model(request, obj, form, change)
    
    def image_preview(self, obj):
        try:
            if not obj.image_data:
                return "No Image"
            data = bytes(obj.image_data)  # convert memoryview if needed
            encoded = base64.b64encode(data).decode("utf-8")
            return mark_safe(f'<img src="data:{obj.mime_type};base64,{encoded}" width="100" />')
        except Exception:
            return "Invalid Image"

    image_preview.short_description = "Preview"


# ===========================
# Stock Movement Admin
# ===========================
class StockMovementAdmin(admin.ModelAdmin):
    list_display = [
        'product', 'movement_type', 'quantity', 'total_price_display',
        'processed_by', 'created_date'
    ]
    list_filter = ['movement_type', 'created_date', 'product__category']
    search_fields = ['product__product_name', 'notes']
    readonly_fields = ['created_date', 'processed_by']
    date_hierarchy = 'created_date'
    list_per_page = 20
    
    fieldsets = (
        ('Movement Details', {
            'fields': ('product', 'movement_type', 'quantity', 'total_price')
        }),
        ('Additional Information', {
            'fields': ('notes', 'processed_by', 'created_date')
        }),
    )
    
    def total_price_display(self, obj):
        try:
            return format_html('Frw {:,.2f}', float(obj.total_price))
        except (ValueError, TypeError):
            # fallback if total_price is None or not a number
            return obj.total_price
    total_price_display.short_description = 'Total Price'
    total_price_display.admin_order_field = 'total_price'


# ===========================
# Wishlist Admin
# ===========================
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'product_price', 'added_date']
    list_filter = ['added_date', 'product__category']
    search_fields = ['user__username', 'user__email', 'product__product_name']
    readonly_fields = ['added_date']
    date_hierarchy = 'added_date'
    list_per_page = 20
    
    def product_price(self, obj):
        return format_html('Frw {:,.2f}', obj.product.price)
    product_price.short_description = 'Price'
    product_price.admin_order_field = 'product__price'


# ===========================
# Order Admin
# ===========================
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'client', 'status_display', 'total_amount_display',
        'payment_method', 'payment_status', 'created_date'
    ]
    list_filter = ['status', 'payment_method', 'created_date']
    search_fields = ['order_number', 'client__username', 'client__email', 'payment_id']
    readonly_fields = ['order_number', 'created_date', 'updated_date', 'payment_status']
    date_hierarchy = 'created_date'
    list_per_page = 20
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'client', 'status')
        }),
        ('Delivery Details', {
            'fields': ('shipping_address', 'order_note')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'payment_id', 'total_amount', 'payment_status')
        }),
        ('Timestamps', {
            'fields': ('created_date', 'updated_date'),
            'classes': ('collapse',)
        }),
    )
    
    def status_display(self, obj):
        colors = {
            'Pending': '#FFA500',
            'Processing': '#1E90FF',
            'Shipped': '#9370DB',
            'Delivered': '#32CD32',
            'Success': '#228B22',
            'Canceled': '#DC143C',
        }
        color = colors.get(obj.status, '#000000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.status
        )
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'
    
    def total_amount_display(self, obj):
        return format_html('<strong>Frw {:,.2f}</strong>', obj.total_amount)
    total_amount_display.short_description = 'Total'
    total_amount_display.admin_order_field = 'total_amount'
    
    def payment_status(self, obj):
        try:
            if obj.payment.status:
                return format_html('<span style="color: green;">✓ Paid</span>')
            else:
                return format_html('<span style="color: red;">✗ Unpaid</span>')
        except Payment.DoesNotExist:
            return format_html('<span style="color: gray;">No payment record</span>')
    payment_status.short_description = 'Payment Status'
    
    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered', 'cancel_orders']
    
    def mark_as_processing(self, request, queryset):
        queryset.update(status='Processing')
        self.message_user(request, f'{queryset.count()} orders marked as processing.')
    mark_as_processing.short_description = 'Mark as Processing'
    
    def mark_as_shipped(self, request, queryset):
        queryset.update(status='Shipped')
        self.message_user(request, f'{queryset.count()} orders marked as shipped.')
    mark_as_shipped.short_description = 'Mark as Shipped'
    
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='Delivered')
        self.message_user(request, f'{queryset.count()} orders marked as delivered.')
    mark_as_delivered.short_description = 'Mark as Delivered'
    
    def cancel_orders(self, request, queryset):
        queryset.update(status='Canceled')
        self.message_user(request, f'{queryset.count()} orders canceled.')
    cancel_orders.short_description = 'Cancel selected orders'


# ===========================
# Order Item Admin
# ===========================
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'price_display', 'subtotal_display']
    list_filter = ['order__status', 'order__created_date']
    search_fields = ['order__order_number', 'product__product_name']
    readonly_fields = ['subtotal_display']
    list_per_page = 20
    
    def price_display(self, obj):
        return format_html('Frw {:,.2f}', obj.price)
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'price'
    
    def subtotal_display(self, obj):
        return format_html('<strong>Frw {:,.2f}</strong>', obj.subtotal)
    subtotal_display.short_description = 'Subtotal'


# ===========================
# Payment Admin
# ===========================
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'amount_display', 'payment_method',
        'payment_id', 'status_display', 'created_date'
    ]
    list_filter = ['status', 'payment_method', 'created_date']
    search_fields = ['order__order_number', 'payment_id']
    readonly_fields = ['created_date', 'updated_date']
    date_hierarchy = 'created_date'
    list_per_page = 20
    
    def amount_display(self, obj):
        return format_html('<strong>Frw {:,.2f}</strong>', obj.amount)
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def status_display(self, obj):
        if obj.status:
            return format_html('<span style="color: green; font-weight: bold;">✓ Paid</span>')
        else:
            return format_html('<span style="color: red; font-weight: bold;">✗ Unpaid</span>')
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'
    
    actions = ['mark_as_paid']
    
    def mark_as_paid(self, request, queryset):
        queryset.update(status=True)
        self.message_user(request, f'{queryset.count()} payments marked as paid.')
    mark_as_paid.short_description = 'Mark as paid'


# ===========================
# Review Admin
# ===========================
class ReviewAdmin(admin.ModelAdmin):
    list_display = [
        'product', 'user', 'rating_display', 'comment_preview',
        'created_date'
    ]
    list_filter = ['rating', 'created_date', 'product__category']
    search_fields = ['product__product_name', 'user__username', 'comment']
    readonly_fields = ['created_date', 'updated_date']
    date_hierarchy = 'created_date'
    list_per_page = 20
    
    def rating_display(self, obj):
        stars = '⭐' * obj.rating
        return format_html('{} ({})', stars, obj.rating)
    rating_display.short_description = 'Rating'
    rating_display.admin_order_field = 'rating'
    
    def comment_preview(self, obj):
        if obj.comment:
            return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
        return '-'
    comment_preview.short_description = 'Comment'
    
    actions = ['approve_reviews', 'delete_reviews']
    
    def approve_reviews(self, request, queryset):
        # You can add an 'approved' field to the model if needed
        self.message_user(request, f'{queryset.count()} reviews approved.')
    approve_reviews.short_description = 'Approve selected reviews'
    
    def delete_reviews(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'{count} reviews deleted.')
    delete_reviews.short_description = 'Delete selected reviews'


# ===========================
# Register Models with Custom Admin Site
# ===========================
custom_admin_site.register(ProductCategory, ProductCategoryAdmin)
custom_admin_site.register(Product, ProductAdmin)
custom_admin_site.register(ProductImage, ProductImageAdmin)
custom_admin_site.register(StockMovement, StockMovementAdmin)
custom_admin_site.register(Wishlist, WishlistAdmin)
custom_admin_site.register(Order, OrderAdmin)
custom_admin_site.register(OrderItem, OrderItemAdmin)
custom_admin_site.register(Payment, PaymentAdmin)
custom_admin_site.register(Review, ReviewAdmin)