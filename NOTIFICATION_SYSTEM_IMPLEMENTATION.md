# Role-Based Notification System - Complete Implementation Guide

## Overview

This document describes the complete role-based notification system implemented for the EduVillage LMS platform. The system automatically creates and manages notifications for Admin, Teacher, and Student users based on specific events and actions.

## Architecture

### Backend Stack
- **Framework**: Django 4.2+
- **API**: Django REST Framework
- **Database**: SQLite (default)
- **Authentication**: JWT (djangorestframework-simplejwt)

### Frontend Stack
- **Framework**: React
- **HTTP Client**: Native Fetch API
- **State Management**: React Hooks + Local State

---

## Database Schema

### Notification Model

```python
class Notification(models.Model):
    user                   # ForeignKey to User (recipient)
    notification_type      # Choice field (admin_teacher_signup, teacher_student_enrollment, etc.)
    title                  # Short text (max 255 chars)
    message                # Detailed text (TextField)
    is_read                # Boolean (default: False)
    created_at             # Auto timestamp
    updated_at             # Auto timestamp
    related_course         # Optional ForeignKey to Course
    related_user           # Optional ForeignKey to User (who triggered it)
```

### Notification Types

1. **admin_teacher_signup**: New teacher signup request
   - Recipient: All Admin users
   - Triggered: When a teacher creates an account with status='pending'

2. **teacher_student_enrollment**: Student enrolled in course
   - Recipient: Teacher (course instructor)
   - Triggered: When a student enrolls in a course

3. **teacher_approval**: Teacher account approved/rejected
   - Recipient: Teacher user
   - Triggered: When admin changes teacher_status

4. **student_enrollment_confirmation**: Enrollment confirmation
   - Recipient: Student
   - Triggered: When student enrolls in a course

5. **student_new_content**: New content added to course
   - Recipient: All enrolled students
   - Triggered: When teacher/admin adds new content

6. **student_certificate_ready**: Certificate ready for download
   - Recipient: Student
   - Triggered: When certificate is generated

---

## Backend Implementation

### 1. File Structure

```
backend/apps/notifications/
├── models.py              # Notification model
├── serializers.py         # DRF serializers
├── views.py              # ViewSet with API endpoints
├── urls.py               # URL routing
├── admin.py              # Django admin interface
├── apps.py               # App configuration
├── signals.py            # Signal handlers for auto-notifications
├── utils.py              # Utility functions for creating notifications
└── migrations/
    └── 0001_initial.py   # Database migration
```

### 2. API Endpoints

#### List Notifications (Paginated)
```
GET /api/notifications/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/notifications/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "notification_type": "student_enrollment_confirmation",
      "title": "Enrollment Confirmation: Advanced Mathematics",
      "message": "You have been successfully enrolled in \"Advanced Mathematics\"...",
      "is_read": false,
      "related_course_title": "Advanced Mathematics",
      "related_user_name": null,
      "created_at": "2026-02-06T10:30:00Z"
    }
  ]
}
```

#### Mark Notification as Read
```
PATCH /api/notifications/{id}/read/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "notification_type": "student_enrollment_confirmation",
  "is_read": true,
  ...
}
```

#### Get Unread Count
```
GET /api/notifications/unread-count/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "unread_count": 5
}
```

#### Mark All as Read
```
PATCH /api/notifications/mark-all-as-read/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "5 notification(s) marked as read.",
  "count": 5
}
```

#### Get Notification Statistics
```
GET /api/notifications/stats/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 42,
  "unread": 5,
  "read": 37,
  "by_type": {
    "student_enrollment_confirmation": 10,
    "student_new_content": 15,
    "admin_teacher_signup": 2
  }
}
```

### 3. Usage Examples

#### Creating Notifications Manually

```python
from apps.notifications.utils import notify_student_certificate_ready

# When certificate is generated
notify_student_certificate_ready(student_user, course_object)
```

#### Creating Bulk Notifications

```python
from apps.notifications.utils import bulk_create_notifications

students = User.objects.filter(
    enrollments__course=course,
    role='student'
)

bulk_create_notifications(
    users_list=list(students),
    notification_type='student_new_content',
    title=f'New Content: {course.title}',
    message=f'New video "{content.title}" has been added!',
    course=course
)
```

#### Integrating Signals

Signals are automatically set up in `apps/notifications/signals.py`. They trigger notifications for:
- Teacher signup (sends to all admins)
- Teacher approval status change (sends to teacher)
- Student enrollment (sends to both teacher and student)
- New course content (sends to all enrolled students)

---

## Frontend Implementation

### 1. File Structure

```
frontend/src/
├── pages/
│   └── NotificationsPage.jsx           # Main notifications page
├── components/
│   ├── NotificationBell.jsx             # Header bell icon with badge
│   ├── NotificationItem.jsx             # Single notification card
│   ├── NotificationBell.css
│   ├── NotificationItem.css
├── services/
│   └── notificationService.js           # API service layer
└── pages/
    └── NotificationsPage.css
```

### 2. Components

#### NotificationBell (Header Component)
```jsx
import NotificationBell from './components/NotificationBell';

// In your header/layout:
<NotificationBell />
```

Features:
- Shows unread notification count badge
- Dropdown preview of unread count
- Polls backend every 30 seconds for new notifications
- Links to full notifications page

#### NotificationsPage (Full Page)
```jsx
import NotificationsPage from './pages/NotificationsPage';

// In your router:
<Route path="/notifications" element={<NotificationsPage />} />
```

Features:
- List all notifications with pagination
- Filter by read/unread status
- Mark individual or all as read
- View notification statistics
- Responsive design

#### NotificationItem (Individual Notification)
- Displays notification with icon based on type
- Shows metadata (course, user, timestamp)
- Click to mark as read
- Color-coded by type

### 3. Services

#### notificationService.js API Methods

```javascript
import {
  getNotifications,
  getNotification,
  markNotificationAsRead,
  getUnreadCount,
  markAllAsRead,
  getNotificationStats,
} from './services/notificationService';

// Get all notifications (paginated)
const data = await getNotifications(page);

// Get specific notification
const notif = await getNotification(notificationId);

// Mark as read
await markNotificationAsRead(notificationId);

// Get unread count
const { unread_count } = await getUnreadCount();

// Mark all as read
await markAllAsRead();

// Get statistics
const stats = await getNotificationStats();
```

### 4. Integration Examples

#### Integrate NotificationBell in Header

```jsx
import NotificationBell from './components/NotificationBell';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h1>EduVillage</h1>
      </div>
      <div className="header-right">
        <NotificationBell />
        <UserProfile />
      </div>
    </header>
  );
}
```

#### Add Notifications Route

The notifications route has already been added to App.js:

```jsx
<Route 
  path="/notifications" 
  element={
    <ProtectedRoute>
      <DashboardLayout userRole={userRole} username={username}>
        <NotificationsPage />
      </DashboardLayout>
    </ProtectedRoute>
  } 
/>
```

### 5. Environment Configuration

Ensure your frontend is configured with the correct API base URL:

```bash
# In frontend/.env or default in notificationService.js
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Workflow Examples

### Scenario 1: Teacher Signup Approval

1. **Teacher signs up** → Signal triggers → Notification created for all admins
2. **Admin approves teacher** → Signal triggers → Notification sent to teacher
3. **Teacher logs in** → Sees notification in NotificationBell and NotificationsPage

### Scenario 2: Student Course Enrollment

1. **Student enrolls in course** → Enrollment created → Signals trigger:
   - Notification sent to teacher (student enrolled)
   - Notification sent to student (enrollment confirmed)
2. **Both users see notifications** in their dashboard

### Scenario 3: New Course Content

1. **Teacher adds content to course** → CourseContent created → Signal triggers
2. **Notification sent to all enrolled students**
3. **Students see notification** when they log in

---

## Configuration & Settings

### Django Settings (settings.py)

The notifications app is already added to `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    ...
    'apps.notifications',
    ...
]
```

### Database Indexes

The Notification model includes database indexes for optimal query performance:

```python
indexes = [
    models.Index(fields=['user', '-created_at']),      # For listing
    models.Index(fields=['user', 'is_read']),          # For counting unread
]
```

---

## Testing

### Backend Tests

Run the comprehensive test script:

```bash
cd backend
python manage.py shell
```

Then execute notifications test (See test results in test documentation)

### Frontend Testing Checklist

- [ ] NotificationBell displays correct unread count
- [ ] NotificationBell updates every 30 seconds
- [ ] NotificationsPage loads all notifications
- [ ] Pagination works correctly
- [ ] Filter buttons work (all/unread/read)
- [ ] Mark as read updates UI
- [ ] Mark all as read works
- [ ] Statistics display correctly
- [ ] Responsive design on mobile

---

## Security Considerations

### Authentication
- All API endpoints require JWT authentication
- Implemented via `permission_classes = [permissions.IsAuthenticated]`

### Authorization
- Each user only sees their own notifications
- Enforced in ViewSet: `get_queryset()` filters by `request.user`

### CSRF Protection
- Django CSRF middleware enabled
- Safe for POST/PATCH requests

### Data Validation
- Serializers validate all input
- Admin interface prevents manual notification creation

---

## Performance Optimization

### Database Query Optimization

1. **Indexed queries**: User + created_at, User + is_read
2. **Pagination**: 20 notifications per page (configurable)
3. **Select related**: Course and user data fetched efficiently

### Frontend Optimization

1. **Polling interval**: 30 seconds (configurable)
2. **Lazy loading**: Pagination for notification lists
3. **Responsive images**: Icons as emoji (no external requests)

### Caching Opportunities

For future optimization:
```python
# Cache unread count (example)
cache.set(f'user_{user_id}_unread_count', count, 60)
```

---

## Troubleshooting

### Issue: No notifications appearing

**Solution:**
1. Verify signals are properly loaded: Check `apps/notifications/apps.py`
2. Check user role: Notifications are role-specific
3. Verify Django signals are working: Run test script

### Issue: Unread count not updating

**Solution:**
1. Check polling interval in NotificationBell (default 30s)
2. Verify API endpoint works: `GET /api/notifications/unread-count/`
3. Check authentication token is valid

### Issue: API returns 401 Unauthorized

**Solution:**
1. Ensure token is included in headers
2. Verify token hasn't expired
3. Check `SIMPLE_JWT` settings in settings.py

---

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for instant updates
2. **Email Notifications**: Send emails for critical notifications
3. **Notification Preferences**: Allow users to customize what they receive
4. **Notification Groups**: Group similar notifications
5. **Scheduled Notifications**: Send at specific times
6. **Notification History**: Archive old notifications

---

## Support & Documentation

For issues or questions:
- Check signal handlers in `apps/notifications/signals.py`
- Review utility functions in `apps/notifications/utils.py`
- Test using the provided test script
- Check API response format in ViewSet docstrings

---

## Version History

- **v1.0** (2026-02-06): Initial implementation
  - Core notification model
  - Role-based notification creation
  - REST API endpoints
  - React components
  - Pagination and filtering
  - Signal handlers for auto-notifications
