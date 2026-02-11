from django.contrib import admin
from .models import Course, CourseContent, StudentCourseProgress, AssignmentSubmission


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description', 'instructor__username']


@admin.register(CourseContent)
class CourseContentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'content_type', 'created_at']
    list_filter = ['content_type', 'created_at']
    search_fields = ['title', 'course__title']


@admin.register(StudentCourseProgress)
class StudentCourseProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'content', 'completed', 'completed_at']
    list_filter = ['completed', 'completed_at']
    search_fields = ['student__username', 'course__title', 'content__title']


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'assignment', 'course', 'submitted_at', 'updated_at']
    list_filter = ['submitted_at', 'updated_at']
    search_fields = ['student__username', 'assignment__title', 'course__title']
    readonly_fields = ['submitted_at', 'updated_at']
