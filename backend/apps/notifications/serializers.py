from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    related_course_title = serializers.CharField(
        source='related_course.title',
        read_only=True,
        allow_null=True
    )
    related_user_username = serializers.CharField(
        source='related_user.username',
        read_only=True,
        allow_null=True
    )
    related_user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'message',
            'is_read',
            'related_course',
            'related_course_title',
            'related_user',
            'related_user_username',
            'related_user_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'notification_type',
            'title',
            'message',
            'related_course',
            'related_user',
        ]
    
    def get_related_user_name(self, obj):
        """Get full name of related user."""
        if obj.related_user:
            full_name = obj.related_user.get_full_name()
            return full_name if full_name else obj.related_user.username
        return None


class NotificationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for notification list view."""
    
    related_course_title = serializers.CharField(
        source='related_course.title',
        read_only=True,
        allow_null=True
    )
    related_user_name = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'message',
            'is_read',
            'related_course_title',
            'related_user_name',
            'created_at',
        ]
    
    def get_related_user_name(self, obj):
        """Get full name of related user."""
        if obj.related_user:
            full_name = obj.related_user.get_full_name()
            return full_name if full_name else obj.related_user.username
        return None
    
    def get_unread_count(self, obj):
        """Get unread notification count - only in list context."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return Notification.objects.filter(
                user=request.user,
                is_read=False
            ).count()
        return 0


class MarkAsReadSerializer(serializers.Serializer):
    """Serializer for marking notification as read."""
    
    is_read = serializers.BooleanField(required=False, default=True)
