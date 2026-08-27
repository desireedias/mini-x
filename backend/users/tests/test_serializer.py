import pytest

from users.serializers import UserRegisterSerializer, UserProfileSerializer
from users.tests.factories import UserFactory


@pytest.mark.django_db
def test_user_register_serializer():
    data = {
        "username": "novo_usuario",
        "email": "novo@example.com",
        "password": "senha123",
    }

    serializer = UserRegisterSerializer(data=data)

    assert serializer.is_valid()

    user = serializer.save()

    assert user.username == "novo_usuario"
    assert user.email == "novo@example.com"
    assert user.check_password("senha123")
    assert user.password != "senha123"


@pytest.mark.django_db
def test_user_register_serializer_password_min_length():
    data = {
        "username": "novo_usuario",
        "email": "novo@example.com",
        "password": "12345",
    }

    serializer = UserRegisterSerializer(data=data)

    assert serializer.is_valid() is False
    assert "password" in serializer.errors


@pytest.mark.django_db
def test_user_register_serializer_password_is_write_only():
    user = UserFactory()

    serializer = UserRegisterSerializer(user)

    assert "password" not in serializer.data


@pytest.mark.django_db
def test_user_profile_serializer():
    user = UserFactory()

    serializer = UserProfileSerializer(user)
    data = serializer.data

    assert data["id"] == user.id
    assert data["username"] == user.username
    assert data["email"] == user.email
    assert data["bio"] == user.bio
    assert data["followers_count"] == 0
    assert data["following_count"] == 0


@pytest.mark.django_db
def test_user_profile_serializer_followers_count():
    user = UserFactory()

    follower_1 = UserFactory()
    follower_2 = UserFactory()

    user.followers.add(follower_1, follower_2)

    serializer = UserProfileSerializer(user)

    assert serializer.data["followers_count"] == 2


@pytest.mark.django_db
def test_user_profile_serializer_following_count():
    user = UserFactory()

    following_1 = UserFactory()
    following_2 = UserFactory()
    following_3 = UserFactory()

    user.following.add(following_1, following_2, following_3)

    serializer = UserProfileSerializer(user)

    assert serializer.data["following_count"] == 3