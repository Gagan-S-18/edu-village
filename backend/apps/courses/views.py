from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsTeacher, IsAdmin, IsStudent
from .models import Course, CourseContent, StudentCourseProgress, AssignmentSubmission
from .serializers import CourseSerializer, CourseContentSerializer, AdminCreateCourseSerializer, AssignmentSubmissionSerializer
from rest_framework.decorators import api_view, permission_classes
from apps.users.models import User
from apps.enrollments.models import Enrollment
from django.utils import timezone


class CourseListCreateView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsTeacher()]
    
    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Only teachers can create courses

        self.permission_classes = [IsAuthenticated, IsTeacher]
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(instructor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def put(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        # Ownership check
        if course.instructor != request.user:
            return Response(
                {"error": "You can update only your own courses"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        course = get_object_or_404(Course, pk=pk)

        # Ownership check
        if course.instructor != request.user:
            return Response(
                {"error": "You can delete only your own courses"},
                status=status.HTTP_403_FORBIDDEN
            )

        course.delete()
        return Response(
            {"message": "Course deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
class CourseUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, course_id):
        try:
            return Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return None
    
    def put(self, request, course_id):
        course = self.get_object(course_id)

        if not course:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Role check
        if request.user.role != "teacher":
            return Response(
                {"error": "Only teachers can update courses"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Ownership check
        if course.instructor != request.user:
            return Response(
                {"error": "You can update only your own courses"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CourseSerializer(course, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, course_id):
        course = self.get_object(course_id)

        if not course:
            return Response(
                {"error": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.role != "teacher":
            return Response(
                {"error": "Only teachers can delete courses"},
                status=status.HTTP_403_FORBIDDEN
            )

        if course.instructor != request.user:
            return Response(
                {"error": "You can delete only your own courses"},
                status=status.HTTP_403_FORBIDDEN
            )

        course.delete()
        return Response(
            {"message": "Course deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
class CourseDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def delete(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        course.delete()
        return Response(
            {"message": "Course deleted successfully"},
            status=status.HTTP_200_OK
        )
    

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_courses_list(request):
    courses = Course.objects.all()

    data = []
    for course in courses:
        data.append({
            "id": course.id,
            "title": course.title,
            "instructor": course.instructor.username if course.instructor else None
        })

    return Response(data)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_delete_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    course.delete()

    return Response(
        {"message": "Course deleted successfully"},
        status=status.HTTP_200_OK
    )

 
 
@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_assign_teacher(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    teacher_id = request.data.get("teacher_id")

    if not teacher_id:
        return Response(
            {"error": "teacher_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    teacher = get_object_or_404(User, id=teacher_id)

    if teacher.role != "teacher":
        return Response(
            {"error": "Only users with teacher role can be assigned"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if teacher is approved
    if teacher.teacher_status != "approved":
        return Response(
            {"error": f"Teacher must be approved before assignment. Current status: {teacher.teacher_status}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    course.instructor = teacher
    course.save()

    return Response(
        {
            "message": "Teacher assigned successfully",
            "course": {
                "id": course.id,
                "title": course.title,
                "instructor": teacher.username,
                "instructor_id": teacher.id,
                "status": course.status
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacher])
def my_courses(request):
    """Get courses assigned to logged-in teacher"""
    teacher = request.user
    courses = Course.objects.filter(instructor=teacher)
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_add_content_courses(request):
    """Get courses for Add Content dropdown - returns only id and title"""
    teacher = request.user
    courses = Course.objects.filter(instructor=teacher).values('id', 'title')
    return Response(list(courses), status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacher])
def course_detail(request, course_id):
    """Get course details with content and enrolled students - only assigned teacher can access"""
    course = get_object_or_404(Course, pk=course_id)
    
    # Check if logged-in user is the course instructor
    if course.instructor != request.user:
        return Response(
            {"error": "You can only view courses you teach"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get course content
    content_items = course.content.all().order_by('-created_at')
    content_data = []
    for item in content_items:
        content_data.append({
            "id": item.id,
            "title": item.title,
            "content_type": item.content_type,
            "file": item.file.url if item.file else None,
            "file_url": item.file_url,
            "created_at": item.created_at,
        })
    
    # Get enrolled students
    enrollments = Enrollment.objects.filter(course=course).select_related('student')
    students_data = []
    for enrollment in enrollments:
        students_data.append({
            "id": enrollment.student.id,
            "username": enrollment.student.username,
            "first_name": enrollment.student.first_name,
            "last_name": enrollment.student.last_name,
            "email": enrollment.student.email,
            "enrolled_at": enrollment.enrolled_at,
        })
    
    data = {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "duration": course.duration,
        "status": course.status,
        "created_at": course.created_at,
        "total_students": len(students_data),
        "content": content_data,
        "students": students_data,
    }
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTeacher])
def add_course_content(request, course_id):
    """Upload course content - only assigned teacher can upload
    
    Accepts:
    - FormData with: title, content_type, file
    - content_type: 'video', 'pdf', 'assignment', 'document', 'link', 'other'
    - file: actual file upload (for video, pdf, assignment)
    """
    course = get_object_or_404(Course, pk=course_id)
    
    # Check if logged-in user is the course instructor
    if course.instructor != request.user:
        return Response(
            {"error": "You can only add content to courses you teach"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Extract data from request
    title = request.data.get('title')
    content_type = request.data.get('content_type')
    file = request.FILES.get('file')
    file_url = request.data.get('file_url')
    
    # Validate required fields
    if not title:
        return Response(
            {"error": "title is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not content_type:
        return Response(
            {"error": "content_type is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate content_type
    valid_types = ['video', 'pdf', 'assignment', 'document', 'link', 'other']
    if content_type not in valid_types:
        return Response(
            {"error": f"Invalid content_type. Must be one of: {', '.join(valid_types)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # File upload types require actual file
    if content_type in ['video', 'pdf', 'assignment', 'document']:
        if not file:
            return Response(
                {"error": f"File is required for content_type: {content_type}"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Link type requires URL
    if content_type == 'link':
        if not file_url:
            return Response(
                {"error": "file_url is required for content_type: link"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Create CourseContent object
    try:
        content = CourseContent.objects.create(
            course=course,
            title=title,
            content_type=content_type,
            file=file if file else None,
            file_url=file_url if file_url else None
        )
        
        serializer = CourseContentSerializer(content, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {"error": f"Error saving content: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudent])
def student_my_courses(request):
    """Get courses enrolled by logged-in student"""
    student = request.user
    # Get enrollments for this student and fetch related courses
    enrollments = student.enrollments.all()
    courses = [enrollment.course for enrollment in enrollments]
    
    # Build response with id, title, instructor username
    data = []
    for course in courses:
        data.append({
            "id": course.id,
            "title": course.title,
            "instructor": course.instructor.username
        })
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudent])
def student_course_contents(request, course_id):
    """Get course content - student must be enrolled"""
    course = get_object_or_404(Course, pk=course_id)
    student = request.user
    
    # Check if student is enrolled in the course
    is_enrolled = Enrollment.objects.filter(
        student=student,
        course=course
    ).exists()
    
    if not is_enrolled:
        return Response(
            {"error": "You are not enrolled in this course"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get course content
    content = course.content.all()
    
    # Build content list with completion status
    contents_data = []
    for item in content:
        content_data = CourseContentSerializer(item).data
        
        # Check if student has completed this content
        progress = StudentCourseProgress.objects.filter(
            student=student,
            content=item
        ).first()
        
        content_data['completed'] = progress.completed if progress else False
        contents_data.append(content_data)
    
    data = {
        "course_id": course.id,
        "course_title": course.title,
        "contents": contents_data
    }
    
    return Response(data, status=status.HTTP_200_OK)



@api_view(["POST"])
@permission_classes([IsAuthenticated, IsStudent])
def mark_content_complete(request, content_id):
    """Mark course content as completed by student"""
    content = get_object_or_404(CourseContent, pk=content_id)
    course = content.course
    student = request.user
    
    # Check if student is enrolled in the course
    is_enrolled = Enrollment.objects.filter(
        student=student,
        course=course
    ).exists()
    
    if not is_enrolled:
        return Response(
            {"error": "You are not enrolled in this course"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Create or update progress record
    progress, created = StudentCourseProgress.objects.get_or_create(
        student=student,
        content=content,
        defaults={'course': course}
    )
    
    progress.completed = True
    progress.completed_at = timezone.now()
    progress.save()
    
    return Response(
        {
            "message": "Content marked as completed",
            "content_id": content.id,
            "completed_at": progress.completed_at
        },
        status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudent])
def student_course_progress(request, course_id):
    """Get student course progress - student must be enrolled"""
    course = get_object_or_404(Course, pk=course_id)
    student = request.user
    
    # Check if student is enrolled in the course
    is_enrolled = Enrollment.objects.filter(
        student=student,
        course=course
    ).exists()
    
    if not is_enrolled:
        return Response(
            {"error": "You are not enrolled in this course"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Count total content for the course
    total_content = course.content.count()
    
    # Count completed content for the student
    completed_content = StudentCourseProgress.objects.filter(
        student=student,
        course=course,
        completed=True
    ).count()
    
    # Calculate progress percentage
    progress_percentage = (completed_content / total_content * 100) if total_content > 0 else 0
    
    # Check if course is completed
    is_completed = (completed_content == total_content and total_content > 0)
    
    data = {
        "course_id": course.id,
        "course_title": course.title,
        "total_content": total_content,
        "completed_content": completed_content,
        "progress_percentage": round(progress_percentage, 2),
        "is_completed": is_completed
    }
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_students_progress(request, course_id):
    """Get student progress for a course - teacher must be assigned"""
    course = get_object_or_404(Course, pk=course_id)
    teacher = request.user
    
    # Check if teacher is assigned to this course
    if course.instructor != teacher:
        return Response(
            {"error": "You can only view students in courses you teach"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all enrolled students
    enrollments = Enrollment.objects.filter(course=course).select_related('student')
    
    # Count total content for the course
    total_content = course.content.count()
    
    # Build student progress list
    students_data = []
    for enrollment in enrollments:
        student = enrollment.student
        
        # Count completed content for this student
        completed_content = StudentCourseProgress.objects.filter(
            student=student,
            course=course,
            completed=True
        ).count()
        
        # Calculate progress
        progress_percentage = (completed_content / total_content * 100) if total_content > 0 else 0
        is_completed = (completed_content == total_content and total_content > 0)
        
        students_data.append({
            "student_id": student.id,
            "student_name": f"{student.first_name} {student.last_name}".strip() or student.username,
            "student_username": student.username,
            "total_content": total_content,
            "completed_content": completed_content,
            "progress_percentage": round(progress_percentage, 2),
            "is_completed": is_completed
        })
    
    data = {
        "course_id": course.id,
        "course_title": course.title,
        "total_students": len(students_data),
        "students": students_data
    }
    
    return Response(data, status=status.HTTP_200_OK)


class AdminCreateCourseView(APIView):
    """Admin-only endpoint to create courses."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        """Create a new course as an admin."""
        serializer = AdminCreateCourseSerializer(data=request.data)
        if serializer.is_valid():
            # Get the first admin user or create default instructor
            # Since admin creates the course, we assign current admin as instructor
            serializer.save(instructor=request.user)
            return Response(
                {
                    "success": True,
                    "message": "Course created successfully",
                    "course": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsStudent])
def submit_assignment(request, assignment_id):
    """
    Submit assignment for a student.
    
    Accepts:
    - FormData with: file (required)
    - assignment_id: CourseContent id of type 'assignment'
    
    Returns:
    - Submission ID, status, and timestamp
    """
    # Get the assignment
    assignment = get_object_or_404(CourseContent, pk=assignment_id)
    
    # Verify it's an assignment
    if assignment.content_type != 'assignment':
        return Response(
            {"error": "This content is not an assignment"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    course = assignment.course
    student = request.user
    
    # Check if student is enrolled in the course
    is_enrolled = Enrollment.objects.filter(
        student=student,
        course=course
    ).exists()
    
    if not is_enrolled:
        return Response(
            {"error": "You are not enrolled in this course"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get the file from request
    file = request.FILES.get('file')
    if not file:
        return Response(
            {"error": "file is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create or update submission
    submission, created = AssignmentSubmission.objects.get_or_create(
        student=student,
        assignment=assignment,
        defaults={'course': course}
    )
    
    # Update file (allows resubmission)
    submission.file = file
    submission.save()
    
    serializer = AssignmentSubmissionSerializer(submission)
    
    return Response(
        {
            "message": "Assignment submitted successfully",
            "submission": serializer.data,
            "is_new_submission": created
        },
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudent])
def get_assignment_submission(request, assignment_id):
    """
    Get student's submission for an assignment.
    
    Returns submission details if exists, otherwise empty response.
    """
    assignment = get_object_or_404(CourseContent, pk=assignment_id)
    course = assignment.course
    student = request.user
    
    # Check if student is enrolled
    is_enrolled = Enrollment.objects.filter(
        student=student,
        course=course
    ).exists()
    
    if not is_enrolled:
        return Response(
            {"error": "You are not enrolled in this course"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Try to get submission
    submission = AssignmentSubmission.objects.filter(
        student=student,
        assignment=assignment
    ).first()
    
    if not submission:
        return Response(
            {"submitted": False},
            status=status.HTTP_200_OK
        )
    
    serializer = AssignmentSubmissionSerializer(submission)
    return Response(
        {
            "submitted": True,
            "submission": serializer.data
        },
        status=status.HTTP_200_OK
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTeacher])
def teacher_course_submissions(request, course_id):
    """
    Get all student assignment submissions for a course - teacher only.
    
    Teacher must be assigned to this course.
    Returns list of submissions grouped by student with assignment info.
    """
    course = get_object_or_404(Course, pk=course_id)
    teacher = request.user
    
    # Check if teacher is assigned to this course
    if course.instructor != teacher:
        return Response(
            {"error": "You can only view submissions in courses you teach"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all assignments for this course
    assignments = course.content.filter(content_type='assignment')
    
    # Get all submissions for this course
    submissions = AssignmentSubmission.objects.filter(
        course=course
    ).select_related('student', 'assignment').order_by('-submitted_at')
    
    # Build submissions data grouped by student
    submissions_by_student = {}
    
    for submission in submissions:
        student_id = submission.student.id
        if student_id not in submissions_by_student:
            submissions_by_student[student_id] = {
                "student_id": student_id,
                "student_name": f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username,
                "student_username": submission.student.username,
                "submissions": []
            }
        
        submissions_by_student[student_id]["submissions"].append({
            "submission_id": submission.id,
            "assignment_id": submission.assignment.id,
            "assignment_title": submission.assignment.title,
            "file_url": submission.file.url if submission.file else None,
            "file_name": submission.file.name.split('/')[-1] if submission.file else None,
            "submitted_at": submission.submitted_at,
            "updated_at": submission.updated_at
        })
    
    # Get enrolled students to include those with no submissions
    enrollments = Enrollment.objects.filter(course=course).select_related('student')
    
    for enrollment in enrollments:
        student_id = enrollment.student.id
        if student_id not in submissions_by_student:
            submissions_by_student[student_id] = {
                "student_id": student_id,
                "student_name": f"{enrollment.student.first_name} {enrollment.student.last_name}".strip() or enrollment.student.username,
                "student_username": enrollment.student.username,
                "submissions": []
            }
    
    data = {
        "course_id": course.id,
        "course_title": course.title,
        "total_assignments": assignments.count(),
        "total_students": len(submissions_by_student),
        "students": list(submissions_by_student.values())
    }
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsStudent])
def generate_course_certificate(request, course_id):
    """
    Generate a course completion certificate for a student.
    
    Student must have 100% progress in the course.
    Returns certificate file URL.
    """
    from .models import Certificate
    from .serializers import CertificateSerializer
    from .certificate_generator import save_certificate_pdf
    
    course = get_object_or_404(Course, pk=course_id)
    student = request.user     
    
    # Check if student is enrolled in the course
    is_enrolled = Enrollment.objects.filter(
        student=student,
        course=course
    ).exists()
    
    if not is_enrolled:
        return Response(
            {"error": "You are not enrolled in this course"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get student's progress
    total_content = course.content.count()
    completed_content = StudentCourseProgress.objects.filter(
        student=student,
        course=course,
        completed=True
    ).count()
    
    # Check if course is completed (100%)
    if total_content == 0 or completed_content != total_content:
        progress_percentage = (completed_content / total_content * 100) if total_content > 0 else 0
        return Response(
            {
                "error": "Course not yet completed",
                "progress_percentage": round(progress_percentage, 2),
                "message": "You must complete 100% of the course to generate a certificate"
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if certificate already exists
    certificate, created = Certificate.objects.get_or_create(
        student=student,
        course=course
    )
    
    if created:
        # Generate PDF
        student_name = f"{student.first_name} {student.last_name}".strip() or student.username
        try:
            save_certificate_pdf(certificate, student_name, course.title)
        except Exception as e:
            # If PDF generation fails, delete the certificate record
            certificate.delete()
            return Response(
                {"error": f"Failed to generate certificate: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    serializer = CertificateSerializer(certificate)
    return Response(
        {
            "message": "Certificate generated successfully" if created else "Certificate already exists",
            "certificate": serializer.data,
            "is_new": created
        },
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStudent])
def get_student_certificates(request):
    """
    Get all certificates for the authenticated student.
    
    Returns list of all courses they have completed and received certificates for.
    """
    from .models import Certificate
    from .serializers import CertificateSerializer
    
    student = request.user
    
    certificates = Certificate.objects.filter(
        student=student
    ).select_related('course')
    
    serializer = CertificateSerializer(certificates, many=True)
    
    return Response(
        {
            "total_certificates": len(certificates),
            "certificates": serializer.data
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudent])
def download_certificate(request, certificate_id):
    """
    Download a specific certificate file.
    
    Student can only download their own certificates.
    """
    from .models import Certificate
    from django.http import FileResponse
    import os
    
    certificate = get_object_or_404(Certificate, id=certificate_id)
    
    # Verify ownership
    if certificate.student != request.user:
        return Response(
            {"error": "You don't have permission to download this certificate"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if certificate file exists
    if not certificate.certificate_file:
        return Response(
            {"error": "Certificate file not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        file_path = certificate.certificate_file.path
        
        # Check if file physically exists
        if not os.path.exists(file_path):
            return Response(
                {"error": "Certificate file does not exist on server"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate filename
        filename = f"Certificate_{certificate.course.title}_{certificate.student.first_name}_{certificate.student.last_name}.pdf"
        filename = filename.replace(" ", "_").replace("/", "_")
        
        # Open and return file
        file = open(file_path, 'rb')
        response = FileResponse(file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return Response(
            {"error": f"Error downloading certificate: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

