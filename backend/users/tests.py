import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

@pytest.mark.django_db
def test_register_user_endpoint():
    """
    Testa o endpoint de registro de usuário com username, email e data de nascimento.
    """
    client = APIClient()
    url = '/api/auth/register/'
    data = {
        'username': 'newuser',
        'password': 'newpassword123',
        'email': 'newuser@example.com',
        'date_of_birth': '2000-01-01'
    }
    response = client.post(url, data, format='json')
    
    assert response.status_code == status.HTTP_201_CREATED
    assert 'password' not in response.data
    assert response.data['username'] == 'newuser'
    
@pytest.mark.django_db
def test_register_user_with_existing_username():
    """
    Testa que o registro falha se o nome de usuário já existir.
    """
    User.objects.create_user(username='existinguser', password='password123')
    client = APIClient()
    url = '/api/auth/register/'
    data = {
        'username': 'existinguser',
        'password': 'newpassword123',
        'email': 'existing@example.com',
        'date_of_birth': '1999-01-01'
    }
    response = client.post(url, data, format='json')

    assert response.status_code == status.HTTP_400_BAD_REQUEST