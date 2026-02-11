from django.shortcuts import render
from django.core.paginator import Paginator

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status

from apps.users.permissions import IsTeacher, IsStudent, IsAdmin
from apps.users.models import User
from apps.courses.models import Course
from apps.enrollments.models import Enrollment
from django.contrib.auth import get_user_model



class TeacherDashboardSummary(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        courses = Course.objects.filter(instructor=request.user)
        total_courses = courses.count()

        total_enrollments = Enrollment.objects.filter(
            course__in=courses
        ).count()

        return Response({
            "total_courses": total_courses,
            "total_enrollments": total_enrollments
        })


class TeacherCourseStats(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request):
        
        courses = Course.objects.filter(
            instructor=request.user
        ).order_by("-id")
        paginator = Paginator(courses, 5)  # 5 courses per page
        page_number = request.GET.get("page", 1)
        page_obj = paginator.get_page(page_number)
        
        data = []
    
        for course in page_obj:
            count = Enrollment.objects.filter(course=course).count()
            data.append({
                "course_id": course.id,
                "course_title": course.title,
                "enrolled_students": count
            })

        return Response({
         "count": paginator.count,
         "page": page_obj.number,
         "total_pages": paginator.num_pages,
         "results": data
        })
    
class StudentMyEnrollments(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        enrollments = Enrollment.objects.filter(
            student=request.user
        ).order_by("-id")
        paginator = Paginator(enrollments, 5)
        page_number = request.GET.get("page", 1)
        page_obj = paginator.get_page(page_number)

        data = []
        for enrollment in page_obj:
            course = enrollment.course
            data.append({
                "course_id": course.id,
                "course_title": course.title,
                "instructor": course.instructor.username
            })

        return Response({
          "count": paginator.count,
          "page": page_obj.number,
          "total_pages": paginator.num_pages,
          "results": data
})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard_stats(request):
    """
    Admin-only endpoint to fetch dashboard statistics
    Returns: total users, students, teachers, courses, enrollments, pending teachers
    """
    try:
        # User counts
        total_users = User.objects.count()
        total_students = User.objects.filter(role='student').count()
        total_teachers = User.objects.filter(role='teacher').count()
        
        # Course and enrollment counts
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        
        # Pending teacher approvals
        pending_teachers = User.objects.filter(
            role='teacher',
            teacher_status='pending'
        ).count()
        
        return Response({
            "total_users": total_users,
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "pending_teachers": pending_teachers
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": f"Failed to fetch dashboard stats: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_dashboard_stats(request):
    teacher = request.user


    courses_count = Course.objects.filter(instructor=teacher).count()
    students_count = User.objects.filter(
        enrollments__course__instructor=teacher
    ).distinct().count()

    return Response({
        "total_courses": courses_count,
        "total_students": students_count,
        "active_assignments": courses_count, # or any logic you want
    }) 