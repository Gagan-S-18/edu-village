"""
Utility functions for creating role-based notifications.
"""
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


def notify_admin_teacher_signup(teacher):
    """
    Notify admins about a new teacher signup request.
    
    Args:
        teacher (User): The teacher who signed up
    """
    admins = User.objects.filter(role='admin')
    for admin in admins:
        Notification.objects.create(
            user=admin,
            notification_type='admin_teacher_signup',
            title='New Teacher Signup Request',
            message=f'{teacher.get_full_name() or teacher.username} has requested to become a teacher. Subject: {teacher.subject or "N/A"}',
            related_user=teacher
        )


def notify_teacher_student_enrollment(student, course):
    """
    Notify teacher when a student enrolls in their course.
    
    Args:
        student (User): The student who enrolled
        course (Course): The course they enrolled in
    """
    teacher = course.instructor
    Notification.objects.create(
        user=teacher,
        notification_type='teacher_student_enrollment',
        title=f'Student Enrollment: {course.title}',
        message=f'{student.get_full_name() or student.username} has enrolled in your course "{course.title}".',
        related_course=course,
        related_user=student
    )


def notify_teacher_approval(teacher, approved):
    """
    Notify teacher about approval or rejection.
    
    Args:
        teacher (User): The teacher
        approved (bool): Whether the teacher was approved
    """
    status_text = 'Approved' if approved else 'Rejected'
    message_text = (
        f'Your teacher account has been {status_text.lower()}. '
        f'Subject: {teacher.subject or "N/A"}, '
        f'Experience: {teacher.experience or "N/A"} years.'
    ) if approved else (
        f'Your teacher account has been {status_text.lower()}. '
        f'Please contact support for more information.'
    )
    
    Notification.objects.create(
        user=teacher,
        notification_type='teacher_approval',
        title=f'Teacher Account {status_text}',
        message=message_text
    )


def notify_student_enrollment_confirmation(student, course):
    """
    Notify student about enrollment confirmation.
    
    Args:
        student (User): The student
        course (Course): The course they enrolled in
    """
    Notification.objects.create(
        user=student,
        notification_type='student_enrollment_confirmation',
        title=f'Enrollment Confirmation: {course.title}',
        message=f'You have been successfully enrolled in "{course.title}". Start learning now!',
        related_course=course
    )


def notify_student_new_content(course, content_title):
    """
    Notify all enrolled students about new content.
    
    Args:
        course (Course): The course
        content_title (str): Title of the new content
    """
    # Get all students enrolled in this course
    from apps.enrollments.models import Enrollment
    
    enrollments = Enrollment.objects.filter(course=course)
    for enrollment in enrollments:
        Notification.objects.create(
            user=enrollment.student,
            notification_type='student_new_content',
            title=f'New Content: {course.title}',
            message=f'New content "{content_title}" has been added to "{course.title}". Check it out!',
            related_course=course
        )


def notify_student_certificate_ready(student, course):
    """
    Notify student that their certificate is ready.
    
    Args:
        student (User): The student
        course (Course): The course they completed
    """
    Notification.objects.create(
        user=student,
        notification_type='student_certificate_ready',
        title=f'Certificate Ready: {course.title}',
        message=f'Your certificate for "{course.title}" is ready to download!',
        related_course=course
    )


def bulk_create_notifications(users_list, notification_type, title, message, course=None):
    """
    Create notifications for multiple users at once.
    
    Args:
        users_list (list): List of User objects
        notification_type (str): Type of notification
        title (str): Notification title
        message (str): Notification message
        course (Course, optional): Related course
    """
    notifications = [
        Notification(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            related_course=course
        )
        for user in users_list
    ]
    Notification.objects.bulk_create(notifications)
