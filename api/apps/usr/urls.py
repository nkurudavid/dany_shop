from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.usr.views import (
    UserSignUpView,
    UserLoginView,
    UserLogoutView,
    CurrentUserDetailView,
    ChangePasswordView,
    UserActivateVerifyOTPView,
    UserActivateResendOTPView,
    PasswordResetVerifyEmailView,
    PasswordResetVerifyOTPView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path("signup/", UserSignUpView.as_view(), name="sign_up"),
    path("activate_verify_otp/", UserActivateVerifyOTPView.as_view(), name="activate_verify_otp"),
    path("activate_resend_otp/", UserActivateResendOTPView.as_view(), name="activate_resend_otp"),
    path("password_reset_verify_email/", PasswordResetVerifyEmailView.as_view(), name="password_reset_verify_email"),
    path("password_reset_verify_otp/", PasswordResetVerifyOTPView.as_view(), name="password_reset_verify_otp"),
    path("password_reset_confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('me/change_password/', ChangePasswordView.as_view(), name='change_user_password'),
    path("me/profile", CurrentUserDetailView.as_view(), name="current_user_profile"),
]
