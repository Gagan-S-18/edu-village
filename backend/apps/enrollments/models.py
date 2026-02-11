from django.db import models

# Create your models here.

from django.db import models
from apps.users.models import User
from apps.courses.models import Course

class Enrollment(models.Model):
    STATUS_CHOICES = (
        ("Active", "Active"),
        ("Completed", "Completed"),
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.title}"
    
    

# class Enrollment(models.Model):
#     STATUS_CHOICES = (
#         ("Active", "Active"),
#         ("Completed", "Completed"),
#     )

#     student_name = models.CharField(max_length=100)
#     course_name = models.CharField(max_length=100)
#     teacher_name = models.CharField(max_length=100)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES)
#     enrolled_date = models.DateField(auto_now_add=True)

#     def str(self):
#         return f"{self.student_name} - {self.course_name}"

