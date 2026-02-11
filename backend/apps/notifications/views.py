from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    MarkAsReadSerializer
)


class NotificationPagination(PageNumberPagination):
    """Pagination for notifications."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user notifications.
    
    Endpoints:
    - GET /api/notifications/ - List notifications for logged-in user
    - GET /api/notifications/{id}/ - Retrieve specific notification
    - PATCH /api/notifications/{id}/read/ - Mark notification as read
    - GET /api/notifications/unread-count/ - Get unread notification count
    - PATCH /api/notifications/mark-all-as-read/ - Mark all as read
    """
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination
    
    def get_queryset(self):
        """Return notifications for the logged-in user."""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        """Use different serializer for list view."""
        if self.action == 'list':
            return NotificationListSerializer
        elif self.action == 'mark_as_read' or self.action == 'mark_all_as_read':
            return MarkAsReadSerializer
        return NotificationSerializer
    
    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = NotificationSerializer(notification, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({
            'unread_count': count
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read."""
        notifications = self.get_queryset().filter(is_read=False)
        count = notifications.update(is_read=True)
        return Response({
            'message': f'{count} notification(s) marked as read.',
            'count': count
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notification statistics for the user."""
        queryset = self.get_queryset()
        total_count = queryset.count()
        unread_count = queryset.filter(is_read=False).count()
        read_count = total_count - unread_count
        
        # Count by type
        type_stats = {}
        for notification_type in Notification.NOTIFICATION_TYPES:
            count = queryset.filter(notification_type=notification_type[0]).count()
            if count > 0:
                type_stats[notification_type[0]] = count
        
        return Response({
            'total': total_count,
            'unread': unread_count,
            'read': read_count,
            'by_type': type_stats
        }, status=status.HTTP_200_OK)
