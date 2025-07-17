from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'date_of_birth')
        extra_kwargs = {
            'password':{'write_only': True},
            'email': {'required': True},
            }
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed("Usuário e/ou senha incorretos.")