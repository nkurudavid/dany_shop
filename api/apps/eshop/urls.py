from django.urls import path, include
from rest_framework_nested import routers

from .views import (
    # shop
    ShopProductCategoryViewSet,
    ShopProductViewSet,
    ShopProductImageViewSet,
    ShopStockMovementViewSet,
    ShopOrderViewSet,
    ShopOrderPaymentViewSet,
    ShopProductReviewViewSet,
    ShopDashboardViewSet,
    ShopAnalyticsViewSet,
    ShopInventoryOverviewViewSet,

    # Customer
    CustomerProductViewSet,
    CustomerWishlistViewSet,
    CustomerReviewViewSet,
    CustomerOrderViewSet,
    CustomerProfileViewSet,

    # Public
    ShopOverviewViewSet,
)

# --------------------------------------------------------------------
# MAIN ROUTER
# --------------------------------------------------------------------
router = routers.SimpleRouter()

# -----------------------
# PUBLIC ROUTES
# -----------------------
router.register(r'shop_overview', ShopOverviewViewSet, basename="shop-overview")

# -----------------------
# CUSTOMER ROUTES
# -----------------------
router.register(r'shop_products', CustomerProductViewSet, basename="customer-products")
router.register(r'customer/dashboard', CustomerProfileViewSet, basename="customer-dashboard")
router.register(r'customer/orders', CustomerOrderViewSet, basename="customer-orders")
router.register(r'customer/wishlist', CustomerWishlistViewSet, basename="customer-wishlist")
router.register(r'customer/reviews', CustomerReviewViewSet, basename="customer-reviews")

# -----------------------
# SHOP ROUTES
# -----------------------
router.register(r'shop/categories', ShopProductCategoryViewSet, basename="shop-categories")
router.register(r'shop/products', ShopProductViewSet, basename="shop-products")
router.register(r'shop/stock-movements', ShopStockMovementViewSet, basename="shop-stock-movements")
router.register(r'shop/orders', ShopOrderViewSet, basename="shop-orders")
router.register(r'shop/payments', ShopOrderPaymentViewSet, basename="shop-payments")
router.register(r'shop/reviews', ShopProductReviewViewSet, basename="shop-reviews")

router.register(r'shop/dashboard', ShopDashboardViewSet, basename="shop-dashboard")
router.register(r'shop/analytics', ShopAnalyticsViewSet, basename="shop-analytics")
router.register(r'shop/inventory', ShopInventoryOverviewViewSet, basename="shop-inventory")

# --------------------------------------------------------------------
# NESTED ROUTERS
# --------------------------------------------------------------------

# Shop → Product → Images
shop_product_router = routers.NestedSimpleRouter(router, r'shop/products', lookup='product')
shop_product_router.register(r'images', ShopProductImageViewSet, basename='shop-product-images')

# Shop → Order → Items (read-only inside ShopOrderSerializer)
shop_order_router = routers.NestedSimpleRouter(router, r'shop/orders', lookup='order')
# shop_order_router.register(r'items', shopOrderItemViewSet, basename='shop-order-items')


# URL PATTERNS
urlpatterns = [
    path('', include(router.urls)),
    path('', include(shop_product_router.urls)),
    path('', include(shop_order_router.urls)),
]