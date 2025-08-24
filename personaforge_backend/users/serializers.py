from rest_framework import serializers
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "id",
            "email",
            "is_active",
            "is_staff",
            "password",
            "created_at",
        )
        extra_kwargs = {
            "password": {"write_only": True},
        }
        read_only_fields = ["id"]
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )

        # i love you, baby
        user.is_active = validated_data.get("is_active", True)
        user.is_staff = validated_data.get("is_staff", False)

        user.save()
        return user

    def update(self, instance, validated_data):
        # Handle password updates
        if "password" in validated_data:
            password = validated_data.pop("password")
            instance.set_password(password)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
