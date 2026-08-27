import pytest
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import AnonymousUser

from posts.serializers import PostSerializer
from posts.tests.factories import PostFactory, UserFactory


@pytest.mark.django_db
def test_post_serializer_contains_expected_fields():
    post = PostFactory()

    serializer = PostSerializer(post)

    assert set(serializer.data.keys()) == {
        "id",
        "author",
        "content",
        "media",
        "created_at",
        "likes_count",
        "replies_count",
        "is_liked",
        "parent",
    }


@pytest.mark.django_db
def test_post_serializer_returns_likes_count():
    post = PostFactory()

    users = UserFactory.create_batch(3)

    post.likes.add(*users)

    serializer = PostSerializer(post)

    assert serializer.data["likes_count"] == 3


@pytest.mark.django_db
def test_post_serializer_returns_replies_count():
    post = PostFactory()

    PostFactory.create_batch(2, parent=post)

    serializer = PostSerializer(post)

    assert serializer.data["replies_count"] == 2


@pytest.mark.django_db
def test_post_serializer_returns_is_liked():
    user = UserFactory()
    post = PostFactory()

    post.likes.add(user)

    request_factory = APIRequestFactory()
    request = request_factory.get("/api/posts/")
    request.user = user

    serializer = PostSerializer(
        post,
        context={"request": request},
    )

    assert serializer.data["is_liked"] is True

@pytest.mark.django_db
def test_post_serializer_returns_is_liked_false_for_anonymous_user():
    post = PostFactory()

    request = APIRequestFactory().get("/")

    request.user = AnonymousUser()

    serializer = PostSerializer(
        post,
        context={"request": request},
    )

    assert serializer.data["is_liked"] is False