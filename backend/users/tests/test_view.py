import pytest

from django.contrib.auth import get_user_model
from django.urls import reverse

from users.tests.factories import UserFactory

User = get_user_model()


@pytest.mark.django_db
def test_register_user(api_client):
    url = reverse("register")

    payload = {
        "username": "novo_usuario",
        "email": "novo@example.com",
        "password": "senha123",
    }

    response = api_client.post(url, payload, format="json")

    assert response.status_code == 201
    assert response.data["username"] == "novo_usuario"
    assert response.data["email"] == "novo@example.com"

    user = User.objects.get(username="novo_usuario")

    assert user.check_password("senha123")


@pytest.mark.django_db
def test_register_user_invalid_password(api_client):
    url = reverse("register")

    payload = {
        "username": "novo_usuario",
        "email": "novo@example.com",
        "password": "12345",
    }

    response = api_client.post(url, payload, format="json")

    assert response.status_code == 400
    assert "password" in response.data


@pytest.mark.django_db
def test_me_authenticated(authenticated_client):
    user = authenticated_client.handler._force_user

    url = reverse("me")

    response = authenticated_client.get(url)

    assert response.status_code == 200
    assert response.data["id"] == user.id
    assert response.data["username"] == user.username
    assert response.data["email"] == user.email


@pytest.mark.django_db
def test_me_unauthenticated(api_client):
    url = reverse("me")

    response = api_client.get(url)

    assert response.status_code == 401