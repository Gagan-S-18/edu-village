# from django.contrib.auth import get_user_model

# User = get_user_model()

# def create_superadmin():
#     user, created = User.objects.get_or_create(
#         username='superadmin',
#         defaults={
#             'email': 'superadmin@example.com',
#             'role': 'admin',
#             'is_staff': True,
#             'is_superuser': True,
#         }
#     )

#     if created:
#         user.set_password('admin123')
#         user.save()
#     else:
#         # ensure role is always correct
#         user.role = 'admin'
#         user.is_staff = True
#         user.is_superuser = True
#         user.set_password('admin123')
#         user.save()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin():
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="admin123"
        )

create_admin()