from django.db import models
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.utils.timezone import now 
from django_filters.rest_framework import DjangoFilterBackend

from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer, ShareTaskSerializer
from .permissions import IsOwnerOrReadOnly

User = get_user_model()

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['completed', 'category']
    search_fields = ['title']
    ordering_fields = ['created_at', 'title', 'completed']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.filter(
            models.Q(owner=user) | models.Q(shared_with=user)
        ).distinct()

        # Filtros personalizados via query params
        created_at__gte = self.request.query_params.get('created_after')
        created_at__lte = self.request.query_params.get('created_before')

        if created_at__gte:
            queryset = queryset.filter(created_at__date__gte=created_at__gte)

        if created_at__lte:
            queryset = queryset.filter(created_at__date__lte=created_at__lte)

        return queryset.order_by('-created_at')

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