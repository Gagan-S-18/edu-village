"""
Django signals to automatically create notifications for various events.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .utils import (
    notify_admin_teacher_signup,
    notify_teacher_student_enrollment,
    notify_teacher_approval,
    notify_student_enrollment_confirmation,
    notify_student_new_content,
)

User = get_user_model()


@receiver(post_save, sender=User)
def create_notification_on_teacher_signup(sender, instance, created, **kwargs):
    """
    Notify admins when a new teacher signs up (teacher_status becomes 'pending').
    """
    if created and instance.role == 'teacher' and instance.teacher_status == 'pending':
        notify_admin_teacher_signup(instance)


@receiver(post_save, sender=User)
def notify_teacher_account_status(sender, instance, created, update_fields, **kwargs):
    """
    Notify teacher when their account is approved or rejected.
    """
    if not created and update_fields is None or 'teacher_status' in (update_fields or []):
        # Teacher approval status changed
        if instance.role == 'teacher' and instance.teacher_status in ['approved', 'rejected']:
            approved = instance.teacher_status == 'approved'
            notify_teacher_approval(instance, approved)


# Enrollment signal handler
def setup_enrollment_signal():
    """Setup signal handler for Enrollment model."""
    from apps.enrollments.models import Enrollment
    
    @receiver(post_save, sender=Enrollment)
    def notify_on_student_enrollment(sender, instance, created, **kwargs):
        """
        Notify both teacher and student when a student enrolls.
        """
        if created:
            notify_teacher_student_enrollment(instance.student, instance.course)
            notify_student_enrollment_confirmation(instance.student, instance.course)


# CourseContent signal handler
def setup_coursecontent_signal():
    """Setup signal handler for CourseContent model."""
    from apps.courses.models import CourseContent
    
    @receiver(post_save, sender=CourseContent)
    def notify_on_new_course_content(sender, instance, created, **kwargs):
        """
        Notify all enrolled students when new content is added to a course.
        """
        if created:
            notify_student_new_content(instance.course, instance.title)


# Setup both signals
setup_enrollment_signal()
setup_coursecontent_signal()
