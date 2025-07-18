from django.db import models
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer, ShareTaskSerializer
from .permissions import IsOwnerOrReadOnly

User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        user = self.request.user
        return Task.objects.filter(
            models.Q(owner=user) | models.Q(shared_with=user)
        ).distinct().order_by('-created_at')
        
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        
    @action(detail=True, methods=['post'], url_path='share', permission_classes=[permissions.IsAuthenticated])
    def share_task(self, request, pk=None):
        task = self.get_object()
        
        if task.owner != request.user:
            message = {'detail': 'Você não tem permissão para compartilhar esta tarefa.'}
            return Response(message, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ShareTaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']

        try:
            user_to_share = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'detail': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if user_to_share == request.user:
            return Response({'detail': 'Você não pode compartilhar uma tarefa consigo mesmo.'},
                            status=status.HTTP_400_BAD_REQUEST)

        task.shared_with.add(user_to_share)
        return Response({'detail': 'Tarefa compartilhada com sucesso!'}, status=status.HTTP_200_OK)
    
    
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user).order_by('name')