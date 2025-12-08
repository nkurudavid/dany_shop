# apps/eshop/views.py
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import models as dj_models
from django.db import transaction
from rest_framework import mixins, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action

from apps.eshop.models import (
    ProductCategory, Product, ProductImage, StockMovement,
    Wishlist, Order, OrderItem, Payment, Review
)
from apps.eshop.constants import MovementType, OrderStatus
from apps.eshop.permissions import IsAdminOrSeller, IsCustomer, IsSeller, IsOwnerOrReadOnly

from apps.eshop.serializers import (
    ProductCategorySerializer, ProductSerializer, ProductImageSerializer,
    StockMovementSerializer, WishlistSerializer, OrderSerializer,
    OrderItemSerializer, PaymentSerializer, ReviewSerializer,
    ShopOverviewSerializer, CustomerProductDetailSerializer,
    CustomerProfileSerializer, CustomerOrderDetailSerializer,
    SellerProductOverviewSerializer, DashboardSerializer,
    SellerOrderSerializer, SellerAnalyticsSerializer, InventoryOverviewSerializer
)

User = get_user_model()



# ---------------------------
# Product Category (Seller)
# ---------------------------
class ShopProductCategoryViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ProductCategory.objects.all().order_by('category_name')
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated, IsSeller]


# ---------------------------
# Product (Seller CRUD)
# ---------------------------
class ShopProductViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Product.objects.all().select_related('category').prefetch_related('product_images', 'reviews')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def get_queryset(self):
        qs = super().get_queryset()
        # allow optional filtering by category via ?category=1
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs


# ---------------------------
# ProductImage (Seller image uploads)
# ---------------------------
class ShopProductImageViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ProductImage.objects.all().select_related('product')
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def create(self, request, *args, **kwargs):
        """
        Expect form-data with:
          - image (file)
          - product (product id)
        """
        file = request.FILES.get("image")
        product_id = request.data.get("product")

        if not file or not product_id:
            return Response({"detail": "image file and product id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "product not found"}, status=status.HTTP_404_NOT_FOUND)

        image_bytes = file.read()
        obj = ProductImage.objects.create(
            product=product,
            file_name=file.name,
            mime_type=getattr(file, "content_type", "application/octet-stream"),
            image_data=image_bytes
        )
        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------------------
# Stock Movement (Seller)
# ---------------------------
class ShopStockMovementViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = StockMovement.objects.select_related('product', 'processed_by').all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def perform_create(self, serializer):
        # set processed_by to current user (seller)
        serializer.save(processed_by=self.request.user)


# ---------------------------
# Seller Orders (view + update status)
# ---------------------------
class ShopOrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Order.objects.select_related('client').prefetch_related('order_items__product')
    serializer_class = SellerOrderSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def update(self, request, *args, **kwargs):
        """
        Restrict update to status and order_note (shop processing info).
        """
        order = self.get_object()
        status_value = request.data.get('status')
        order_note = request.data.get('order_note', None)

        if status_value:
            # basic validation: must be one of OrderStatus choices
            valid_statuses = [choice[0] for choice in OrderStatus.choices]
            if status_value not in valid_statuses:
                return Response({"detail": "invalid status"}, status=status.HTTP_400_BAD_REQUEST)
            order.status = status_value

        if order_note is not None:
            order.order_note = order_note

        order.save()
        return Response(SellerOrderSerializer(order).data)


# ---------------------------
# Payments (Seller read-only)
# ---------------------------
class ShopOrderPaymentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Payment.objects.select_related('order').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsSeller]


# ---------------------------
# Reviews (Seller read-only)
# ---------------------------
class ShopProductReviewViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Review.objects.select_related('product', 'user').all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsSeller]


# ---------------------------
# Seller Dashboard / Analytics / Inventory Endpoints
# ---------------------------
class ShopDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsSeller]

    def list(self, request):
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status=OrderStatus.PENDING).count()
        total_revenue = Order.objects.filter(status=OrderStatus.SUCCESS).aggregate(total=dj_models.Sum("total_amount"))["total"] or Decimal("0.00")
        total_products = Product.objects.count()
        low_stock = Product.objects.filter(quantity__lt=5).count()

        data = {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "total_revenue": total_revenue,
            "total_products": total_products,
            "low_stock": low_stock,
        }
        return Response(DashboardSerializer(data).data)


class ShopAnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsSeller]

    def list(self, request):
        # Example simple analytics payload (you can expand)
        # revenue_by_month: { "2025-01": 1234.00, ... }
        from django.db.models.functions import TruncMonth
        revenue_qs = (
            Order.objects.filter(status=OrderStatus.SUCCESS)
            .annotate(month=TruncMonth("created_date"))
            .values("month")
            .annotate(total=dj_models.Sum("total_amount"))
            .order_by("month")
        )
        revenue_by_month = {row["month"].strftime("%Y-%m"): float(row["total"] or 0) for row in revenue_qs}

        orders_by_status_qs = Order.objects.values("status").annotate(count=dj_models.Count("id"))
        orders_by_status = {row["status"]: row["count"] for row in orders_by_status_qs}

        # top products
        top_products = Product.objects.annotate(sold=dj_models.Sum("order_items__quantity")).order_by("-sold")[:5]

        # top customers
        top_customers = User.objects.annotate(spent=dj_models.Sum("orders__total_amount")).order_by("-spent")[:5]
        top_customers_data = [{"username": u.username, "total_spent": float(u.spent or 0)} for u in top_customers]

        payload = {
            "revenue_by_month": revenue_by_month,
            "orders_by_status": orders_by_status,
            "top_products": SellerProductOverviewSerializer(top_products, many=True).data,
            "top_customers": top_customers_data,
        }
        return Response(SellerAnalyticsSerializer(payload).data)


class ShopInventoryOverviewViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsSeller]

    def list(self, request):
        total_products = Product.objects.count()
        low_stock_items = Product.objects.filter(quantity__lt=5).count()
        recent_movements = StockMovement.objects.select_related("product", "processed_by").order_by("-created_date")[:20]
        payload = {
            "total_products": total_products,
            "low_stock_items": low_stock_items,
            "recent_movements": StockMovementSerializer(recent_movements, many=True).data
        }
        return Response(InventoryOverviewSerializer(payload).data)


# ---------------------------
# CUSTOMER-FACING VIEWSETS
# ---------------------------

# Public product browsing
class CustomerProductViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Product.objects.filter().select_related('category').prefetch_related('product_images', 'reviews')
    serializer_class = CustomerProductDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        # optional filters
        cat = self.request.query_params.get("category")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        in_stock = self.request.query_params.get("in_stock")

        if cat:
            qs = qs.filter(category_id=cat)
        if min_price:
            qs = qs.filter(price__gte=Decimal(min_price))
        if max_price:
            qs = qs.filter(price__lte=Decimal(max_price))
        if in_stock in ("1", "true", "True"):
            qs = qs.filter(quantity__gt=0)
        return qs


# Wishlist (customer own)
class CustomerWishlistViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated, IsCustomer, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Customer reviews (own)
class CustomerReviewViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsCustomer, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Customer orders (place order, list own orders)
class CustomerOrderViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsCustomer, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Order.objects.filter(client=self.request.user).prefetch_related('order_items__product', 'payment')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Expected payload:
        {
            "shipping_address": "...",
            "order_note": "...",           # optional
            "payment_method": "COD",       # optional
            "payment_details": {           # optional, only if not COD
                "payment_id": "...",
                "amount": "...",
                "status": "pending|success|failed",
            },
            "items": [
                {"product": <id>, "quantity": <int>, "price": "12.50"},
                ...
            ]
        }
        """
        payload = request.data
        items = payload.get("items", [])
        if not items:
            return Response({"detail": "items required"}, status=status.HTTP_400_BAD_REQUEST)

        payment_method = payload.get("payment_method", "COD")
        payment_details = payload.get("payment_details", {})

        # 1️⃣ Create Order
        order = Order.objects.create(
            client=request.user,
            shipping_address=payload.get("shipping_address", ""),
            order_note=payload.get("order_note", ""),
            payment_method=payment_method,
        )

        # 2️⃣ Create Order Items & Stock Movements
        for it in items:
            prod_id = it.get("product")
            qty = int(it.get("quantity", 1))
            price = Decimal(str(it.get("price", "0")))
            product = get_object_or_404(Product, pk=prod_id)

            # create order item
            OrderItem.objects.create(order=order, product=product, quantity=qty, price=price)

            # decrease stock via StockMovement
            StockMovement.objects.create(
                product=product,
                movement_type=MovementType.STOCK_OUT,
                quantity=qty,
                total_price=price * qty,
                processed_by=None,
                notes=f"Order {order.order_number} created by customer"
            )

        # 3️⃣ Recalculate total
        order.calculate_total()
        order.save()

        # 4️⃣ Create Payment if not COD or “Cash on Delivery.”
        if payment_method.upper() != "COD":
            Payment.objects.create(
                order=order,
                amount=order.total_amount,
                payment_method=payment_method,
                payment_id=payment_details.get("payment_id", ""),
                status=payment_details.get("status", "pending"),
            )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)



# Customer profile (dashboard)
class CustomerProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsCustomer, IsOwnerOrReadOnly]

    def list(self, request):
        serializer = CustomerProfileSerializer(request.user)
        return Response(serializer.data)


# Shop Overview (public)
class ShopOverviewViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        data = ShopOverviewSerializer(None).data
        return Response(data)
