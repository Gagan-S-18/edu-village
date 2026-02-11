from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Notification(models.Model):
    """
    Notification model for role-based notifications.
    
    Notification types:
    - admin_teacher_signup: New teacher signup request
    - teacher_student_enrollment: Student enrolled in teacher's course
    - teacher_approval: Teacher account approval/rejection by admin
    - student_enrollment_confirmation: Student enrollment confirmation
    - student_new_content: New content added to enrolled course
    - student_certificate_ready: Certificate generated and ready to download
    """
    
    NOTIFICATION_TYPES = [
        ('admin_teacher_signup', 'New Teacher Signup Request'),
        ('teacher_student_enrollment', 'Student Enrollment'),
        ('teacher_approval', 'Teacher Approval Status'),
        ('student_enrollment_confirmation', 'Enrollment Confirmation'),
        ('student_new_content', 'New Course Content'),
        ('student_certificate_ready', 'Certificate Ready'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default='student_enrollment_confirmation'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    # Optional: Link to related objects for context
    related_course = models.ForeignKey(
        'courses.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    related_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications_about_me',
        help_text="User who triggered the notification (e.g., teacher applying, student enrolling)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'notifications_notification'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.is_read = True
        self.save(update_fields=['is_read', 'updated_at'])
