from django.conf import settings
from django.contrib.auth import login, logout, update_session_auth_hash

from rest_framework import status, generics, viewsets, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.usr.serializers import (
    UserLoginSerializer,
    UserLogoutSerializer,
    UserSerializer,
    UserChangePasswordSerializer,
)
from apps.usr.utils import generate_jwt_token, get_user_from_token
from apps.usr.permissions import IsNotAdmin



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