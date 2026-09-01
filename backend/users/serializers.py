from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
      
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'username', 'email', 'bio', 'avatar', 'banner', 'followers_count', 'following_count')

    def get_followers_count(self, obj):
       
        try:
            return obj.followers.count()
        except Exception:
            return 0

    def get_following_count(self, obj):
       
        try:
            return obj.following.count()
        except Exception:
            return 0