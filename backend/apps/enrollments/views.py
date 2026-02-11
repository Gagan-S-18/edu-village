from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes

from .models import Enrollment
from .serializers import EnrollmentSerializer, CourseEnrollmentSerializer
from .permissions import IsStudent
from apps.courses.models import Course
from apps.enrollments.models import Enrollment

class EnrollmentView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get(self, request):
        """Get student's enrollments"""
        enrollments = Enrollment.objects.filter(student=request.user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Enroll student in a course"""
        course_id = request.data.get('course')

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course
        )

        if not created:
            return Response(
                {"message": "Already enrolled in this course"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def browse_courses(request):
    """Get all available courses with enrollment status"""
    courses = Course.objects.all().select_related('instructor')
    serializer = CourseEnrollmentSerializer(
        courses,
        many=True,
        context={'request': request}
    )
    return Response({
        'total_courses': courses.count(),
        'courses': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def check_enrollment(request, course_id):
    """Check if student is enrolled in a course"""
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response(
            {"error": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    is_enrolled = Enrollment.objects.filter(
        student=request.user,
        course=course
    ).exists()
    
    return Response({
        'course_id': course_id,
        'is_enrolled': is_enrolled
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_students_count(request, course_id):
    """Get count of enrolled students (for any role)"""
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response(
            {"error": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    student_count = Enrollment.objects.filter(course=course).count()
    
    return Response({
        'course_id': course_id,
        'student_count': student_count
    }, status=status.HTTP_200_OK)



@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_enrollments(request):
    enrollments = Enrollment.objects.select_related("student", "course")

    data = []
    for e in enrollments:
        data.append({
            "id": e.id,
            "student": e.student.username,
            "course": e.course.title,
            "status": e.status,
            "enrolled_at": e.enrolled_at,
        })

    return Response(data)

class TeacherStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teacher = request.user

        enrollments = Enrollment.objects.filter(
            course__instructor=teacher
        ).select_related("student", "course")

        data = []
        for e in enrollments:
            data.append({
                "student_id": e.student.id,
                "student_name": e.student.username,
                "course_title": e.course.title,
                "status": e.status,
                "enrolled_at": e.enrolled_at,
            })

        return Response(data)
