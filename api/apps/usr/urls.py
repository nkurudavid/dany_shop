from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.usr.views import (
    UserSignUpView,
    UserLoginView,
    UserLogoutView,
    CurrentUserDetailView,
    ChangePasswordView,
    VerifyOTPView,
    ResendOTPView
)

urlpatterns = [
    path("signup/", UserSignUpView.as_view(), name="sign_up"),
    path("verify_otp/", VerifyOTPView.as_view(), name="verify_otp"),
    path("resend_otp/", ResendOTPView.as_view(), name="resend_otp"),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('me/change_password/', ChangePasswordView.as_view(), name='change_user_password'),
    path("me/", CurrentUserDetailView.as_view(), name="current-user")
]
