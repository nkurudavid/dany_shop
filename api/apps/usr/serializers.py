from django.contrib.auth import authenticate, get_user_model, update_session_auth_hash
from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMessage
from rest_framework import serializers
from apps.usr.models import UserRole, UserProfile
from apps.usr.utils import generate_otp



class UserActivateVerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate(self, data):
        email = data.get("email")
        otp = data.get("otp")

        # Validate user
        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError({"message": "User not found."})

        cache_key = f"otp_{user.id}"
        stored_otp = cache.get(cache_key)

        # Validate OTP existence
        if not stored_otp:
            raise serializers.ValidationError(
                {"message": "OTP expired or invalid. Request a new one."}
            )

        # Validate OTP correctness
        if stored_otp != otp:
            raise serializers.ValidationError({"message": "Incorrect OTP."})

        # Activate User Inside Serializer
        user.is_active = True
        user.save(update_fields=["is_active"])
        cache.delete(cache_key)

        data["user"] = user
        return data



class UserActivateResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = get_user_model().objects.get(email=value)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if user.is_active:
            raise serializers.ValidationError("Account already activated.")

        return value

    def save(self):
        email = self.validated_data["email"]
        user = get_user_model().objects.get(email=email)
        otp = generate_otp()

        cache_key = f"otp_{user.id}"
        cache.set(cache_key, otp, timeout=300)

        EmailMessage(
            subject="Your new OTP code",
            body=f"Hello {user.first_name},\n\nYour new OTP is {otp}.\nExpires in 5 minutes.",
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        ).send()

        return {"message": "A new OTP has been sent to your email."}



class PasswordResetVerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = get_user_model().objects.get(email=value)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError('Invalid email address')

        if not user.is_active:
            raise serializers.ValidationError('User account is inactive')

        return value


class PasswordResetVerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get("email")
        otp = data.get("otp")

        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError({"message": "User not found."})

        cache_key = f"password_reset_otp_{user.id}"
        stored_otp = cache.get(cache_key)

        if not stored_otp:
            raise serializers.ValidationError({"message": "OTP expired or not found."})

        if stored_otp != otp:
            raise serializers.ValidationError({"message": "Invalid OTP."})

        return data




class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password1 = serializers.CharField(max_length=128)
    new_password2 = serializers.CharField(max_length=128)

    def validate(self, data):
        if data["new_password1"] != data["new_password2"]:
            raise serializers.ValidationError({"message": "Passwords do not match."})
        return data




class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserRole.choices)
    message = serializers.CharField(read_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        
        if not email or not password:
            raise serializers.ValidationError({'message': 'Email and password are required.'})

        # Filter user by email and role
        user = get_user_model().objects.filter(email=email, role=role).first()
        
        if user is None:
            raise serializers.ValidationError({'message': 'User not found!'})

        if not user.check_password(password):
            raise serializers.ValidationError({'message': 'Incorrect password!'})
        
        if user.is_superuser:
            raise serializers.ValidationError({'message': 'Access denied!'})

        user = authenticate(email=email, password=password)
        
        if user and user.is_active:
            return {'user': user, 'message': 'Login successful!'}
        
        raise serializers.ValidationError({'message': 'User account not active!'})




class UserLogoutSerializer(serializers.Serializer):
    pass



class UserChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        user = self.context['request'].user
        if not user.check_password(data["old_password"]):
            raise serializers.ValidationError({"Error": "Old password is incorrect."})

        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"Error":"New passwords do not match."})

        return data

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        
         # Prevent automatic logout
        update_session_auth_hash(self.context['request'], user)
        
        return user



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["phone_number", "country", "province", "district", "sector", "street", "postal_code",]



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    password_confirmation = serializers.CharField(write_only=True, required=False, style={'input_type': 'password confirm'})

    profile = UserProfileSerializer(required=False)

    class Meta:
        model = get_user_model()
        fields = ["id", "first_name", "last_name", "role", "gender", "is_active", "email", "password", "password_confirmation", "profile",]
        extra_kwargs = {
            "email": {"required": False},
            "is_active": {"read_only": True, "required": False},
            "password": {"write_only": True, "required": False},
            "password_confirmation": {"write_only": True, "required": False},
        }

    def validate(self, data):
        user_id = self.instance.id if self.instance else None

        # Validate email
        email = data.get('email')
        if email and self.instance and email != self.instance.email:
            existing_user = get_user_model().objects.exclude(id=user_id).filter(email=email).first()
            if existing_user:
                raise serializers.ValidationError({"email": "This email address is already in use."})

        # Validate password
        password = data.get('password')
        if password and len(password) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long."})

        # Check password match
        if 'password' in data and 'password_confirmation' in data:
            if data.get('password') != data.pop('password_confirmation', None):
                raise serializers.ValidationError({"password": "The passwords do not match."})

        return data

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", None)
        password = validated_data.pop("password")

        user = self.Meta.model(**validated_data)
        user.set_password(password)
        user.save()

        # Create profile after user
        if profile_data:
            UserProfile.objects.create(user=user, **profile_data)

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        password = validated_data.pop("password", None)
        validated_data.pop("password_confirmation", None)

        # Update user fields
        instance = super().update(instance, validated_data)

        # Update password
        if password:
            instance.set_password(password)
            instance.save()

        # Update profile if included
        if profile_data:
            profile = instance.profile
            for key, value in profile_data.items():
                setattr(profile, key, value)
            profile.save()

        return instance




class UserDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id']

    def delete(self, instance):
        try:
            instance.delete()
        except Exception as e:
            raise serializers.ValidationError(f"Error deleting user account: {str(e)}")
        
        