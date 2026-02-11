# Notification System - Quick Reference Guide

## Quick Start

### For Backend Developers

#### 1. Create a Notification Manually
```python
from apps.notifications.utils import notify_student_certificate_ready

notify_student_certificate_ready(student_user, course)
```

#### 2. Create Bulk Notifications
```python
from apps.notifications.utils import bulk_create_notifications

bulk_create_notifications(
    users_list=[user1, user2, user3],
    notification_type='student_new_content',
    title='New Content Added',
    message='Check out the new material!',
    course=course_obj
)
```

#### 3. Available Notification Types

| Type | Recipients | Triggered When |
|------|-----------|-----------------|
| `admin_teacher_signup` | All Admins | Teacher signs up (pending) |
| `teacher_student_enrollment` | Teacher | Student enrolls in course |
| `teacher_approval` | Teacher | Admin approves/rejects teacher |
| `student_enrollment_confirmation` | Student | Student enrolls in course |
| `student_new_content` | All enrolled students | New content added |
| `student_certificate_ready` | Student | Certificate generated |

#### 4. Available Utility Functions

```python
# Individual notification functions
notify_admin_teacher_signup(teacher)
notify_teacher_student_enrollment(student, course)
notify_teacher_approval(teacher, approved=True/False)
notify_student_enrollment_confirmation(student, course)
notify_student_new_content(course, content_title)
notify_student_certificate_ready(student, course)

# Bulk operations
bulk_create_notifications(users_list, notification_type, title, message, course=None)
```

---

### For Frontend Developers

#### 1. Add Notification Bell to Header
```jsx
import NotificationBell from './components/NotificationBell';

// In your header/layout component
<NotificationBell />
```

#### 2. Navigate to Notifications Page
```jsx
// Link in your navigation
<Link to="/notifications">View All Notifications</Link>

// The route is already configured in App.js
// Just click the bell icon or navigate to /notifications
```

#### 3. Use Notification Service
```javascript
import {
  getNotifications,
  markNotificationAsRead,
  getUnreadCount,
  markAllAsRead,
  getNotificationStats,
} from './services/notificationService';

// Get all notifications
const data = await getNotifications(page=1);

// Get unread count
const { unread_count } = await getUnreadCount();

// Mark specific notification as read
await markNotificationAsRead(notificationId);

// Mark all as read
await markAllAsRead();

// Get stats
const stats = await getNotificationStats();
```

#### 4. Notification Item Colors

| Type | Color | Icon |
|------|-------|------|
| `admin_teacher_signup` | Red | 👨‍🏫 |
| `teacher_student_enrollment` | Teal | 📚 |
| `teacher_approval` | Green | ✅ |
| `student_enrollment_confirmation` | Green | 🎓 |
| `student_new_content` | Blue | 📝 |
| `student_certificate_ready` | Yellow | 🎖️ |

---

## API Endpoints Quick Reference

### List Notifications
```bash
GET /api/notifications/?page=1
# Response: { count, next, previous, results: [...] }
```

### Get Unread Count
```bash
GET /api/notifications/unread-count/
# Response: { unread_count: 5 }
```

### Mark as Read
```bash
PATCH /api/notifications/{id}/read/
# Response: Updated notification object
```

### Mark All as Read
```bash
PATCH /api/notifications/mark-all-as-read/
# Response: { message: "X marked as read", count: X }
```

### Get Statistics
```bash
GET /api/notifications/stats/
# Response: { total, unread, read, by_type: {...} }
```

---

## Database Queries

### Get User's Notifications
```python
from apps.notifications.models import Notification

# All notifications
notifs = Notification.objects.filter(user=request.user).order_by('-created_at')

# Unread only
unread = Notification.objects.filter(user=request.user, is_read=False)

# By type
teacher_notifs = Notification.objects.filter(
    user=request.user, 
    notification_type='teacher_student_enrollment'
)
```

### Mark as Read
```python
# Single notification
notification.mark_as_read()

# Multiple
Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
```

---

## Common Tasks

### Task: Notify all admins about something
```python
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification

User = get_user_model()
admins = User.objects.filter(role='admin')

for admin in admins:
    Notification.objects.create(
        user=admin,
        notification_type='admin_teacher_signup',
        title='Important Update',
        message='Description here'
    )
```

### Task: Get unread count for dashboard widget
```python
unread_count = Notification.objects.filter(
    user=request.user,
    is_read=False
).count()
```

### Task: Delete old notifications
```python
from django.utils import timezone
from datetime import timedelta

# Delete notifications older than 30 days
cutoff = timezone.now() - timedelta(days=30)
Notification.objects.filter(created_at__lt=cutoff).delete()
```

### Task: Get notifications for a specific course
```python
course_notifications = Notification.objects.filter(
    user=request.user,
    related_course=course
)
```

---

## Testing Your Changes

### Test Notification Creation
```python
# In Django shell or test file
from apps.notifications.utils import notify_admin_teacher_signup
from django.contrib.auth import get_user_model

User = get_user_model()
teacher = User.objects.get(id=1)
notify_admin_teacher_signup(teacher)

# Check if created
from apps.notifications.models import Notification
print(Notification.objects.filter(notification_type='admin_teacher_signup').count())
```

### Test API Endpoint
```bash
# Get token first
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"student1", "password":"pass123"}'

# Get notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/notifications/unread-count/
```

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| No unread badge appearing | Check: `getUnreadCount()` runs every 30s. Verify token is valid. |
| API returns 401 | Ensure token in Authorization header. Check token expiry. |
| Notifications not creating | Verify signals loaded. Check user roles match notification type. Run migrations. |
| Page won't load | Check browser console for errors. Verify `/notifications` route exists. |

---

## File Locations

**Backend:**
- Models: `backend/apps/notifications/models.py`
- APIs: `backend/apps/notifications/views.py`
- Utils: `backend/apps/notifications/utils.py`
- Signals: `backend/apps/notifications/signals.py`
- URLs: `backend/apps/notifications/urls.py`

**Frontend:**
- Service: `frontend/src/services/notificationService.js`
- Page: `frontend/src/pages/NotificationsPage.jsx`
- Bell: `frontend/src/components/NotificationBell.jsx`
- Item: `frontend/src/components/NotificationItem.jsx`
- Styles: `frontend/src/pages/NotificationsPage.css`, `frontend/src/components/*.css`

---

## Key Points to Remember

1. **Notifications are role-specific** - Only relevant users receive notifications
2. **Signals are automatic** - No manual triggering needed for standard events
3. **Pagination is implemented** - 20 notifications per page
4. **Polling is 30 seconds** - Adjust in NotificationBell.jsx if needed
5. **All endpoints require auth** - Send JWT token in Authorization header
6. **Database has indexes** - Optimized for user + created_at and user + is_read queries

---

## Contact & Support

For detailed documentation, see: `NOTIFICATION_SYSTEM_IMPLEMENTATION.md`
