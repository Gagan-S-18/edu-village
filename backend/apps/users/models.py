from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    )
    
    TEACHER_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student' 
        # 'admin'
    )
    
    # Teacher approval workflow
    teacher_status = models.CharField(
        max_length=20,
        choices=TEACHER_STATUS_CHOICES,
        default='pending',
        null=True,
        blank=True,
        help_text="Status for teacher approval. Only relevant if role='teacher'"
    )
    
    # Teacher qualification details
    qualification = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Educational qualification (e.g., Bachelor's in Mathematics)"
    )
    
    subject = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Subject expertise (e.g., Mathematics, Physics)"
    )
    
    experience = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text="Years of teaching experience"
    )

    # def save(self, *args, **kwargs):
    #     if self.is_superuser:
    #         self.role = "admin"
    #     super().save(*args, **kwargs)
