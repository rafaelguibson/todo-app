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
    Testa para ver se a validação de registro duplicado está ok.
    """
    User.objects.create_user(username='repeated_user',password='testpassword123')
    client = APIClient()
    url = '/api/auth/register/'
    data = {
        'username': 'nerepeated_userwuser',
        'password': 'testpassword123',
        'email': 'repeated_userwuser@email.com',
        'date_of_birth': '2000-01-01'
    }
    response = client.post(url, data, format='json')
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST