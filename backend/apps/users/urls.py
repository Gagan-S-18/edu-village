from django.urls import path
from .views import (
    ProfileView, RegisterView, LoginView, user_profile, 
    admin_users_list, admin_delete_user, admin_update_user_role,
    admin_pending_teachers, admin_approved_teachers, admin_approve_teacher, admin_reject_teacher, change_password
)
from .views import admin_block_user, admin_unblock_user
from .views import force_create_superadmin

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('me/', user_profile),
    # ✅ ADD THIS (change password)
    path('change-password/', change_password),
    path('admin/users/', admin_users_list),
    path("admin/users/<int:user_id>/delete", admin_delete_user),
    path("admin/users/<int:user_id>/role", admin_update_user_role),
    path("admin/teachers/pending/", admin_pending_teachers),
    path("admin/teachers/approved/", admin_approved_teachers),
    path("admin/teachers/<int:teacher_id>/approve/", admin_approve_teacher),
    path("admin/teachers/<int:teacher_id>/reject/", admin_reject_teacher),
    path("admin/users/<int:user_id>/block/",admin_block_user),
    path("admin/users/<int:user_id>/unblock/",admin_unblock_user),
    path("force-create-superadmin/", force_create_superadmin),

]