from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
def test_create_user():
    user = User.objects.create_user(username='testuser', password='password123')
    assert user.username == 'testuser'
    assert user.is_active
    assert not user.is_staff
    assert not user.is_superuser
    #Verificar se a senha foi hadheada
    assert user.check_password('password123')
    assert not user.check_password('wrongpassword')