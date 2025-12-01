from django.conf import settings
from django.contrib.auth import login, logout, get_user_model, update_session_auth_hash
from django.core.cache import cache
from django.core.mail import EmailMessage
from rest_framework import status, generics, viewsets, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.usr.serializers import (
    UserLoginSerializer,
    UserLogoutSerializer,
    UserSerializer,
    UserChangePasswordSerializer,
)
from apps.usr.utils import generate_jwt_token, get_user_from_token, generate_otp
from apps.usr.permissions import IsNotAdmin



# User SignUp
class UserSignUpView(generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']

            if get_user_model().objects.filter(email=email).exists():
                return Response({"message": "Email already exists"}, status=400)

            user = serializer.save()
            user.is_active = False
            user.save()

            # OTP
            otp = generate_otp()
            cache_key = f"otp_{user.id}"

            # Store OTP (5 minutes)
            cache.set(cache_key, otp, timeout=300)

            # Send Email
            EmailMessage(
                subject="Account Verification OTP",
                body=f"Hello {user.first_name},\nYour OTP is {otp}\nExpires in 5 minutes.",
                from_email=settings.EMAIL_HOST_USER,
                to=[email],
            ).send()

            return Response({
                "message": "Registration successful. OTP sent.",
                "email": email
            }, status=201)

        return Response(serializer.errors, status=400)



# Verify OTP to activate user account
class VerifyOTPView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"message": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        cache_key = f"otp_{user.id}"
        stored_otp = cache.get(cache_key)

        if not stored_otp:
            return Response({"message": "OTP expired or not found. Request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if stored_otp != otp:
            return Response({"message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        # Activate user
        user.is_active = True
        user.save(update_fields=["is_active"])
        cache.delete(cache_key)

        return Response({"message": "Account activated successfully."}, status=status.HTTP_200_OK)
    


# Resend the OTP
class ResendOTPView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response({"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({"message": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            return Response({"message": "Account already activated."}, status=status.HTTP_400_BAD_REQUEST)

        otp = generate_otp()
        cache_key = f"otp_{user.id}"

        # Replace old OTP
        cache.set(cache_key, otp, timeout=300)

        EmailMessage(
            subject="Your new OTP code",
            body=f"Hello {user.first_name},\n\nYour new OTP is {otp}.\nExpires in 5 minutes.",
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        ).send()

        return Response({"message": "A new OTP has been sent to your email."}, status=status.HTTP_200_OK)




# UserLogin View
class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            user = validated_data['user']
            message = validated_data['message']

            # Generate JWT token
            token = generate_jwt_token(user)
            login(request, user)
            response = Response(status=status.HTTP_200_OK)
            
            # Set JWT in an HttpOnly cookie
            response.set_cookie(
                key='jwt', 
                value=token,
                httponly=settings.JWT_COOKIE_HTTPONLY,
                secure=settings.JWT_COOKIE_SECURE,
                samesite='Lax'
            )

            response.data = {"message": message, "token": token}
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# UserLogout View
class UserLogoutView(generics.GenericAPIView):
    serializer_class = UserLogoutSerializer
    permission_classes = [IsAuthenticated, IsNotAdmin]
    
    def post(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_200_OK) 
        response.delete_cookie('jwt') 
        logout(request)
        response.data = {'message': 'Logout success!'}
        return response





# ChangePassword View
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = UserChangePasswordSerializer
    permission_classes = [IsAuthenticated, IsNotAdmin]

    def get_object(self): # Retrieve the user
        return get_user_from_token(self.request)

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if isinstance(user, Response):
            return user

        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            update_session_auth_hash(request, user)
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# User Profile View
class CurrentUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsNotAdmin]

    def get_object(self):
        return get_user_from_token(self.request)

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(
            user,
            data=request.data,
            partial=True,      # Allows partial update
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "User profile updated successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "error",
            "message": "Profile update failed.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        logout(request)

        response = Response({"message": "Account successfully deleted."}, status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie("jwt")
        return response