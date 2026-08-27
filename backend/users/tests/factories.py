import factory

from django.contrib.auth import get_user_model

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user_{n}")
    email = factory.LazyAttribute(
        lambda obj: f"{obj.username}@example.com"
    )
    password = factory.PostGenerationMethodCall(
        "set_password",
        "senha123",
    )
    bio = factory.Faker("text", max_nb_chars=200)