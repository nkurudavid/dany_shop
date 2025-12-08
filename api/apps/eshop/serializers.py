from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.db import models
from django.db.models import Avg
from decimal import Decimal

from apps.eshop.models import (
    ProductCategory, Product, ProductImage, StockMovement,
    Wishlist, Order, OrderItem, Payment, Review
)

User = get_user_model()


# ==========================
# Product Image Serializer
# ==========================
class ProductImageSerializer(serializers.ModelSerializer):
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['file_name', 'mime_type', 'image_base64', 'created_at']

    def get_image_base64(self, obj):
        import base64
        if not obj.image_data:
            return None
        return f"data:{obj.mime_type};base64," + base64.b64encode(obj.image_data).decode('utf-8')


# ==========================
# Product Serializer
# ==========================
class ProductSerializer(serializers.ModelSerializer):
    product_images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(source='in_stock', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'product_name', 'description', 'price', 'quantity',
            'unit', 'category', 'created_at', 'average_rating', 'in_stock',
            'product_images'
        ]

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg else None


# ==========================
# Product Category Serializer
# ==========================
class ProductCategorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = ProductCategory
        fields = ['id', 'category_name', 'description', 'products']


# ==========================
# Stock Movement Serializer
# ==========================
class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    unit = serializers.CharField(source='product.unit', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'unit',
            'movement_type', 'quantity', 'total_price',
            'processed_by', 'notes', 'created_date'
        ]


# ==========================
# Wishlist Serializer
# ==========================
class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'added_date']


# ==========================
# Order Item Serializer
# ==========================
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'subtotal']

    def get_subtotal(self, obj):
        return Decimal(obj.quantity) * obj.price


# ==========================
# Payment Serializer
# ==========================
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'payment_method', 'payment_id',
            'status', 'created_date', 'updated_date'
        ]


# ==========================
# Order Serializer
# ==========================
class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'client', 'status', 'shipping_address',
            'order_note', 'total_amount', 'payment_method', 'payment',
            'order_items', 'created_date', 'updated_date'
        ]


# ==========================
# Review Serializer
# ==========================
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    product_name = serializers.CharField(source='product.product_name', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'product', 'product_name', 'user', 'user_name',
            'rating', 'comment', 'created_date', 'updated_date'
        ]


# ========================================
# COMBINED SERIALIZERS
# ========================================

# ==========================
# SHOP / CUSTOMER
# ==========================
class ShopOverviewSerializer(serializers.Serializer):
    categories = serializers.SerializerMethodField()
    top_products = serializers.SerializerMethodField()

    def get_categories(self, obj):
        queryset = ProductCategory.objects.all()
        return ProductCategorySerializer(queryset, many=True).data

    def get_top_products(self, obj):
        products = Product.objects.filter(in_stock=True).order_by('-created_at')[:10]
        return ProductSerializer(products, many=True).data


class CustomerProductDetailSerializer(serializers.ModelSerializer):
    product_images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(source='in_stock', read_only=True)
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'product_name', 'description', 'price', 'quantity',
            'unit', 'category_name', 'average_rating', 'in_stock',
            'product_images', 'reviews', 'created_at'
        ]

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg else None


class CustomerProfileSerializer(serializers.Serializer):
    user = serializers.CharField(source='username')
    email = serializers.EmailField()
    date_joined = serializers.DateTimeField()

    wishlist = WishlistSerializer(many=True, read_only=True)
    recent_orders = serializers.SerializerMethodField()

    def get_recent_orders(self, obj):
        orders = obj.orders.all()[:5]
        return OrderSerializer(orders, many=True).data


class CustomerOrderDetailSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'order_number', 'status', 'shipping_address',
            'total_amount', 'payment_method', 'created_date',
            'updated_date', 'order_items', 'payment'
        ]


# ==========================
# SELLER / STORE
# ==========================
class SellerProductOverviewSerializer(serializers.ModelSerializer):
    total_sold = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'product_name', 'price', 'quantity', 'unit',
            'in_stock', 'total_sold', 'created_at'
        ]

    def get_total_sold(self, obj):
        return OrderItem.objects.filter(product=obj).aggregate(
            total=models.Sum('quantity')
        )['total'] or 0


class DashboardSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_products = serializers.IntegerField()
    low_stock = serializers.IntegerField()
    top_selling_products = serializers.SerializerMethodField()

    def get_top_selling_products(self, obj):
        qs = Product.objects.annotate(
            total_sold=models.Sum('order_items__quantity')
        ).order_by('-total_sold')[:5]
        return SellerProductOverviewSerializer(qs, many=True).data


class SellerOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='client.username')
    items_count = serializers.IntegerField(source='order_items.count', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name',
            'status', 'total_amount', 'created_date',
            'items_count'
        ]


class SellerAnalyticsSerializer(serializers.Serializer):
    revenue_by_month = serializers.JSONField()
    orders_by_status = serializers.JSONField()
    top_products = serializers.SerializerMethodField()
    top_customers = serializers.SerializerMethodField()

    def get_top_products(self, obj):
        qs = Product.objects.annotate(
            sold=models.Sum('order_items__quantity')
        ).order_by('-sold')[:5]
        return SellerProductOverviewSerializer(qs, many=True).data

    def get_top_customers(self, obj):
        qs = User.objects.annotate(
            spending=models.Sum('orders__total_amount')
        ).order_by('-spending')[:5]

        return [
            {"username": c.username, "total_spent": c.spending or 0}
            for c in qs
        ]


class InventoryOverviewSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    low_stock_items = serializers.IntegerField()
    recent_movements = StockMovementSerializer(many=True, read_only=True)
