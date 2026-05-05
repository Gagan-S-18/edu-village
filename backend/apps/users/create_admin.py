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
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'is_staff': True,
            'is_superuser': True,
            'role': 'admin',
        }
    )

    # Always reset password and role
    user.set_password('admin123')
    user.is_staff = True
    user.is_superuser = True
    user.role = 'admin'
    user.save()