from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer
from .models import User
from .permissions import IsAdmin
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "teacher_status": user.teacher_status,
        "qualification": user.qualification,
        "subject": user.subject,
        "experience": user.experience
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_users_list(request):
    """Get all users, optionally filtered by role."""
    role_filter = request.query_params.get('role', None)
    
    if role_filter:
        users = User.objects.filter(role=role_filter)
    else:
        users = User.objects.all()

    data = []
    for user in users:
        data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "teacher_status": user.teacher_status if user.role == 'teacher' else None
        })

    return Response(data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_delete_user(request, user_id):
    # Prevent admin from deleting self
    if request.user.id == user_id:
        return Response(
            {"error": "Admin cannot delete self"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = get_object_or_404(User, id=user_id)

    # Optional safety: prevent deleting other admins
    if user.role == "admin":
        return Response(
            {"error": "Cannot delete another admin"},
            status=status.HTTP_403_FORBIDDEN
        )

    user.delete()
    return Response(
        {"message": "User deleted successfully"},
        status=status.HTTP_200_OK
    )



@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_update_user_role(request, user_id):
    # Prevent admin from changing own role
    if request.user.id == user_id:
        return Response(
            {"error": "Admin cannot change own role"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.get(id=user_id)

    # Prevent changing other admin roles
    if user.role == "admin":
        return Response(
            {"error": "Cannot change another admin role"},
            status=status.HTTP_403_FORBIDDEN
        )

    new_role = request.data.get("role")

    if new_role not in ["student", "teacher"]:
        return Response(
            {"error": "Invalid role"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.role = new_role
    user.save()

    return Response(
        {"message": "User role updated successfully"},
        status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_pending_teachers(request):
    """Get all teachers with pending approval status"""
    pending_teachers = User.objects.filter(
        role='teacher',
        teacher_status='pending'
    )
    
    data = []
    for teacher in pending_teachers:
        data.append({
            "id": teacher.id,
            "username": teacher.username,
            "email": teacher.email,
            "qualification": teacher.qualification,
            "subject": teacher.subject,
            "experience": teacher.experience,
            "teacher_status": teacher.teacher_status
        })
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_approved_teachers(request):
    """Get all approved teachers for course assignment"""
    approved_teachers = User.objects.filter(
        role='teacher',
        teacher_status='approved'
    )
    
    data = []
    for teacher in approved_teachers:
        data.append({
            "id": teacher.id,
            "username": teacher.username,
            "email": teacher.email,
            "subject": teacher.subject,
            "experience": teacher.experience
        })
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_approve_teacher(request, teacher_id):
    """Approve a pending teacher"""
    teacher = get_object_or_404(User, id=teacher_id, role='teacher')
    
    if teacher.teacher_status != 'pending':
        return Response(
            {"error": f"Teacher status is '{teacher.teacher_status}', not pending"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    teacher.teacher_status = 'approved'
    teacher.save()
    
    return Response(
        {
            "message": "Teacher approved successfully",
            "teacher": {
                "id": teacher.id,
                "username": teacher.username,
                "teacher_status": teacher.teacher_status
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_reject_teacher(request, teacher_id):
    """Reject a pending teacher"""
    teacher = get_object_or_404(User, id=teacher_id, role='teacher')
    
    if teacher.teacher_status != 'pending':
        return Response(
            {"error": f"Teacher status is '{teacher.teacher_status}', not pending"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    teacher.teacher_status = 'rejected'
    teacher.save()
    
    return Response(
        {
            "message": "Teacher rejected successfully",
            "teacher": {
                "id": teacher.id,
                "username": teacher.username,
                "teacher_status": teacher.teacher_status
            }
        },
        status=status.HTTP_200_OK
    )

# views.py
@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_block_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()
        return Response(
            {"message": "User blocked successfully"},
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    


User = get_user_model()

@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_unblock_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = True
        user.save()
        return Response(
            {"message": "User unblocked successfully"},
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )
        

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            # Check if teacher is approved
            if user.role == 'teacher' and user.teacher_status != 'approved':
                return Response(
                    {
                        "error": "Teacher account pending admin approval",
                        "teacher_status": user.teacher_status
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "role": request.user.role
        })
    


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not user.check_password(old_password):
        return Response(
            {"detail": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(new_password)
    user.save()

    return Response(
        {"detail": "Password changed successfully"},
        status=status.HTTP_200_OK
    )


from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response

User = get_user_model()

@api_view(['GET'])
def create_admin_temp(request):
    user, created = User.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@example.com"
        }
    )

    user.is_staff = True
    user.is_superuser = True
    user.set_password("admin123")
    user.save()

    return Response({"message": "Admin password reset to admin123"})