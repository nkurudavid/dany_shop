import datetime, jwt, random, logging
from django.conf import settings
from django.contrib.auth import get_user_model, logout
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed


# Set up a logger for internal errors
logger = logging.getLogger(__name__)



# Utility function to generate JWT token
def generate_jwt_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
        "iat": datetime.datetime.utcnow(),
    }

    # Encode the payload
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


# Utility function to get user from JWT token
def get_user_from_token(request):
    token = request.COOKIES.get('jwt')
    
    if not token:
        return Response({'message': 'Session ended. Please log in again.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Decode the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get("user_id")
        user = get_user_model().objects.get(id=user_id)
        return user
    
    except (jwt.ExpiredSignatureError, jwt.DecodeError, get_user_model().DoesNotExist): 
        return handle_invalid_token()



# Handle session expiration
def handle_session_expired(request):
    response = Response({'message': 'Session ended. Please log in again.'}, status=status.HTTP_401_UNAUTHORIZED)
    response.delete_cookie('jwt')
    logout(request)
    return response



# Handle invalid token
def handle_invalid_token():
    logger.error('Invalid token') 
    return None




# otp generator
def generate_otp():
    return str(random.randint(100000, 999999))