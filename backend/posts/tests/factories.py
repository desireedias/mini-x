import factory
from django.contrib.auth import get_user_model
from posts.models import Post

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'user_{n}')
    email = factory.LazyAttribute(lambda o: f'{o.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'senha123')


class PostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Post

    author = factory.SubFactory(UserFactory)
    content = factory.Faker('text', max_nb_chars=280)
    parent = None