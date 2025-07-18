import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from datetime import datetime, timedelta, time
from django.utils.timezone import make_aware
from tasks.models import Task, Category


User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_user(api_client):
    user = User.objects.create_user(username='testuser', password='password123', email='test@example.com')
    api_client.force_authenticate(user=user)
    return user, api_client

@pytest.mark.django_db
class TestTaskAPI:
    
    def test_create_task_with_category(self, authenticated_user):
        user, client = authenticated_user
        category = Category.objects.create(name='Trabalho', owner=user)
        
        url = '/api/tasks/'
        data = {
            'title': 'Reunião',
            'category': category.id
        }
        
        response = client.post(url, data, format ='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Task.objects.count() == 1
        task = Task.objects.first()
        assert task.owner == user
        assert task.category == category
        
    def test_share_task_with_valid_user(self, authenticated_user):
        owner, client = authenticated_user
        shared_user = User.objects.create_user(username='otheruser', password='1234', email='email@email.com')
        
        task = Task.objects.create(title='tarefa_compartilhada', owner=owner)
        url = f'/api/tasks/{task.id}/share/'
        data = {'username': 'otheruser'}
        response = client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert task.shared_with.filter(id=shared_user.id).exists()
        
    def test_share_task_with_invalid_user(self, authenticated_user):
        owner, client = authenticated_user
        task = Task.objects.create(title='Tarefa', owner=owner)
        url = f'/api/tasks/{task.id}/share/'
        data = {'username': 'inexistente'}
        
        response = client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Usuário não encontrado' in response.json()['username'][0]
        
    def test_shared_user_can_view_but_not_edit_task(self, authenticated_user):
        owner, client = authenticated_user
        shared_user = User.objects.create_user(username='friend', password='1234')
        task = Task.objects.create(title='Tarefa Segura', owner=owner)
        task.shared_with.add(shared_user)
        
        other_client = APIClient()
        other_client.force_authenticate(user=shared_user)
        
        url = f'/api/tasks/{task.id}/'
        # Teste de vizualizar
        response = other_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
        # Se não pode editar
        response = other_client.patch(f'/api/tasks/{task.id}/', {'title': 'Novo Título'})
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
    def test_user_cannot_create_duplicate_category(self, authenticated_user):
        user, client = authenticated_user
        Category.objects.create(name='Casa', owner=user)
        
        url = '/api/categories/'
        data = {'name': 'Casa'}
        
        response = client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Categoria com esse nome já existe.' in response.json()['name'][0]

    def test_filter_tasks_by_completion(self, authenticated_user):
        user, client = authenticated_user
        Task.objects.create(title='Feita', completed=True, owner=user)
        Task.objects.create(title='Pendente', completed=False, owner=user)

        url = '/api/tasks/?completed=true'
        response = client.get(url)
        
        assert response.status_code == 200
        assert all(task['completed'] for task in response.json()['results'])
            
        def test_filter_tasks_by_category(self, authenticated_user):
            user,client = authenticated_user
            category_1 = Category.objects.create(name='Trabalho', owner=user)
            category_2 = Category.objects.create(name='Casa', owner=user)
            Task.objects.create(title='Faxina', category=category_2, owner=user)
            Task.objects.create(title='Planilha', category=category_1, owner=user)
            
            url= f'/api/tasks/?category={category_1.id}'
            response = client.get(url)
            
            assert response.status_code == 200
            assert all(task['category'] == category_1.id for task in response.json()['results'])
            
        def test_search_tasks_by_title(self, authenticated_user):
            user, client = authenticated_user
            Task.objects.create(title='Escrever Relatorio', owner=user)
            Task.objects.create(title='Tomar um café <3', owner=user)
            
            url = '/api/tasks/?search=relatório'
            response = client.get(url)
            
            assert response.status_code == 200
            assert any('relatório' in task['title'].lower() for task in response.json()['results'])
            
        def test_filter_tasks_by_date_range(self, authenticated_user):
            user, client = authenticated_user
            Task.objects.create(title='Passada', owner=user, created_at=now() - timedelta(days=3))
            Task.objects.create(title='Recente', owner=user, created_at=now())

            url = f'/api/tasks/?created_after={now().date()}'
            response = client.get(url)
            assert response.status_code == 200
            assert all(task['title'] == 'Recente' for task in response.json()['results'])