import pytest
from django.urls import reverse
from posts.tests.factories import PostFactory

@pytest.mark.django_db
def test_create_post_authenticated(authenticated_client):
    url = reverse('post-list-create') # ou '/api/posts/'
    payload = {'content': 'Novo post via teste!'}
    
    response = authenticated_client.post(url, payload, format='json')
    
    assert response.status_code == 201
    assert response.data['content'] == 'Novo post via teste!'

@pytest.mark.django_db
def test_create_post_unauthenticated(api_client):
    url = reverse('post-list-create')
    payload = {'content': 'Post sem token'}
    
    response = api_client.post(url, payload, format='json')
    
    assert response.status_code == 401