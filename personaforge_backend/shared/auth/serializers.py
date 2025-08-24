from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import Token
from django.contrib.auth import get_user_model
from users.models import CustomUser
from rest_framework import serializers

User = get_user_model()

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import Token
from users.models import CustomUser  # Ensure you import your CustomUser model

class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: CustomUser) -> Token:
        token = super().get_token(user)
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({"user": str(self.user.id)})
        data.update({"email": str(self.user.email)})
        return data


class ChangeEmailSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = CustomUser
        fields = ("email", "password")
        read_only_fields = ("id", "password")

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["password"]):
            raise serializers.ValidationError(
                {"password": "Current password is not correct"}
            )

        if CustomUser.objects.exclude(id=user.id).filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "This email is already in use"})

        return attrs

    def update(self, instance, validated_data):
        if instance != self.context["request"].user:
            raise serializers.ValidationError("You can only update your own email")

        instance.email = validated_data["email"]
        instance.save()
        return instance