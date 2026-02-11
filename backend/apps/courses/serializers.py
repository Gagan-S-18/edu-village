from rest_framework import serializers
from .models import Course, CourseContent, AssignmentSubmission, Certificate, StudentCourseProgress

# class CourseSerializer(serializers.ModelSerializer):
#     contents = CourseContentSerializer(
#         many=True,
#         read_only=True,
#         source="content"  # IMPORTANT (related_name)
#     )

#     class Meta:
#         model = Course
#         fields = "all"




class CourseContentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = CourseContent
        fields = [
            "id",
            "course",
            "title",
            "content_type",
            "file",
            "file_url",
            "created_at",
        ]

    def get_file_url(self, obj):
        request = self.context.get("request")

        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)

        if obj.file_url:
            return obj.file_url

        return None

# # 2️⃣ THEN define CourseSerializer
class CourseSerializer(serializers.ModelSerializer):
    contents = CourseContentSerializer(
        many=True,
        read_only=True,
        source="content"   # related_name
    )

    class Meta:
        model = Course
        fields = "__all__"


class AdminCreateCourseSerializer(serializers.ModelSerializer):
    """Serializer for admin course creation without instructor field."""
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'duration', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_duration(self, value):
        """Ensure duration is positive."""
        if value < 0:
            raise serializers.ValidationError("Duration must be a positive number.")
        return value
    
    def validate_title(self, value):
        """Ensure title is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()
    
    def validate_description(self, value):
        """Ensure description is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


# class CourseContentSerializer(serializers.ModelSerializer):
#     class Meta:
        # model = CourseContent
        # fields = ['id', 'course', 'title', 'content_type', 'file', 'file_url', 'created_at']
        # read_only_fields = ['id', 'created_at']

# class CourseContentSerializer(serializers.ModelSerializer):
#     file = serializers.SerializerMethodField()

#     class Meta:
#         model = CourseContent
#         fields = [
#             "id",
#             "title",
#             "content_type",
#             "file",
#             "file_url",
#             "created_at",
#         ]

#     def get_file(self, obj):
#         request = self.context.get("request")
#         if obj.file:
#             if request:
#                 return request.build_absolute_uri(obj.file.url)
#             return obj.file.url
#         return None

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for student assignment submissions."""
    
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'student', 'assignment', 'course', 'file', 'submitted_at', 'updated_at']
        read_only_fields = ['id', 'student', 'course', 'submitted_at', 'updated_at']


class CertificateSerializer(serializers.ModelSerializer):
    """Serializer for course completion certificates."""
    student_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = ['id', 'student', 'student_name', 'course', 'course_title', 'issued_at', 'certificate_file']
        read_only_fields = ['id', 'student', 'issued_at', 'certificate_file']
    
    def get_student_name(self, obj):
        """Get full name of the student."""
        return f"{obj.student.first_name} {obj.student.last_name}".strip() or obj.student.username
    
    def get_course_title(self, obj):
        """Get course title."""
        return obj.course.title
    
    def create(self, validated_data):
        """Custom create to add student and course from request context."""
        # Student and course are added in the view via context
        return super().create(validated_data)
