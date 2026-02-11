# Notification System - Architecture & Flow Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         EDUVILLAGE LMS                          │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────┐        ┌──────────────────────────┐
    │   REACT FRONTEND         │        │   DJANGO BACKEND         │
    ├──────────────────────────┤        ├──────────────────────────┤
    │                          │        │                          │
    │ NotificationBell ◄─────┐ │        │  Django Signals          │
    │   (Header)       │     │ │        │  ├─ User saved           │
    │   - Bell Icon    │     │ │        │  ├─ Enrollment created   │
    │   - Badge Count  │     │ │        │  └─ Content added        │
    │   - Polling (30s)       │ │        │         │                │
    │                 │       │ │        │         ▼                │
    │ NotificationPage◄───┐  │ │        │  Notification ◄──────┐   │
    │   (Full Page)   │   │  │ │        │  Utility Functions    │   │
    │   - List        │   │  │ │        │  ├─ notify_admin...   │   │
    │   - Filter      │   │  │ │        │  ├─ notify_teacher... │   │
    │   - Statistics  │   │  │ │        │  └─ notify_student... │   │
    │   - Mark as read     │  │ │        │         │             │   │
    │                 │   │  │ │        │         ▼             │   │
    │ notificationSvc │   │  │ │        │  Notification Model   │   │
    │  - getNotifs    │   │  │ │        │  ├─ user (FK)         │   │
    │  - markAsRead   │   │  │ │        │  ├─ type              │   │
    │  - getUnread... │   │  │ │        │  ├─ title/message     │   │
    │                 │   │  │ │        │  ├─ is_read           │   │
    │                API CALLS│ │        │  ├─ created_at        │   │
    │                 │   │  ▼ │        │  └─ course/user FK    │   │
    └─────────────────┼───┼────┼────────┼──────────────────────────┘
                      │   │    │        │
           HTTP/REST  │   │    ▼        ▼
            Requests  │   │   ┏━━━━━━━━━━━━━━━━┓
                      │   │   ┃ REST API ENDPOINTS
                      │   │   ┃ GET    /api/notifications/
                      │   │   ┃ PATCH  /api/notifications/{id}/read/
                      │   │   ┃ GET    /api/notifications/unread-count/
                      │   │   ┃ PATCH  /api/notifications/mark-all-as-read/
                      │   │   ┃ GET    /api/notifications/stats/
                      │   │   ┗━━━━━━━━━━━━━━━━┛
                      │   │        │
                      └───┴────────┘
                           JWT Auth
```

---

## Notification Flow Diagram

### Scenario 1: Teacher Signup Notification Flow

```
┏━━━━━━━━━━━━━━━━┓
┃ Teacher Signs ┃
┃ Up (Pending)  ┃
┗━━━━━━━━━━┬━━━━┛
           │
           ▼
    ┌─────────────────┐
    │ User.post_save  │
    │ Signal Triggered│ ◄─── Django ORM save()
    └────────┬────────┘
             │
             │ role='teacher' AND
             │ teacher_status='pending'
             │
             ▼
    ┌─────────────────────────┐
    │ notify_admin_teacher_   │
    │ signup(teacher)         │
    └────────┬────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Get all admin users      │
    │ User.objects.filter(     │
    │   role='admin'           │
    │ )                        │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ For each admin:          │
    │   Create Notification(   │
    │     user=admin,          │
    │     type='admin_teacher' │
    │     _signup',            │
    │     title='New Teacher'  │
    │     related_user=teacher │
    │   )                      │
    └────────┬─────────────────┘
             │
             ▼
    ┏━━━━━━━━━━━━━━━━┓
    ┃ Notification   ┃
    ┃ Created in DB  ┃
    ┗━━━━━━━━━━━━━━━━┛
             │
             ▼
    ┌──────────────────────────┐
    │ Admin logs in next time  │
    │ NotificationBell shows   │
    │ badge with count         │
    └──────────────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Admin clicks bell or     │
    │ navigates to             │
    │ /notifications           │
    └──────────────────────────┘
             │
             ▼
    ┏━━━━━━━━━━━━━━━━┓
    ┃ NotificationsPage
    ┃ displays list  ┃
    ┗━━━━━━━━━━━━━━━━┛
```

---

## Scenario 2: Student Enrollment Flow

```
┏━━━━━━━━━━━━━━┓
┃ Student      ┃
┃ Enrolls in   ┃
┃ Course       ┃
┗━━━━━━━┬━━━━━┛
        │
        ▼
    ┌──────────────────────────┐
    │ Enrollment.post_save     │
    │ Signal Triggered         │
    └────────┬─────────────────┘
             │
             ├─────────────────────┐
             │ Signal 1            │ Signal 2
             │                     │
             ▼                     ▼
    ┌──────────────────┐   ┌──────────────────┐
    │ notify_teacher_  │   │ notify_student_  │
    │ student_         │   │ enrollment_      │
    │ enrollment       │   │ confirmation     │
    │ (student, course)│   │ (student, course)│
    └────────┬─────────┘   └────────┬─────────┘
             │                      │
             ▼                      ▼
    ┌──────────────────┐   ┌──────────────────┐
    │ Create Notif     │   │ Create Notif     │
    │ For Teacher      │   │ For Student      │
    │ type: teacher_   │   │ type: student_   │
    │ student_         │   │ enrollment_      │
    │ enrollment       │   │ confirmation     │
    │ related_course=  │   │ related_course=  │
    │ course           │   │ course           │
    │ related_user=    │   │ related_user=    │
    │ student          │   │ none             │
    └────────┬─────────┘   └────────┬─────────┘
             │                      │
             ▼                      ▼
    ┏━━━━━━━━━━━━━━━━┓   ┏━━━━━━━━━━━━━━━━┓
    ┃ Teacher sees   ┃   ┃ Student sees   ┃
    ┃ enrollment     ┃   ┃ confirmation   ┃
    ┃ notification   ┃   ┃ notification   ┃
    ┗━━━━━━━━━━━━━━━━┛   ┗━━━━━━━━━━━━━━━━┛
```

---

## API Call Sequence Diagram

```
┌─────────────┐                              ┌──────────────┐
│   Browser   │                              │   Backend    │
│  (Frontend) │                              │   (Django)   │
└──────┬──────┘                              └──────┬───────┘
       │                                            │
       │ 1. GET /api/notifications/                │
       │    (with JWT token)                       │
       ├───────────────────────────────────────────>│
       │                                            │
       │                                      2. Verify JWT
       │                                            │
       │                                      3. Query DB:
       │                                         SELECT * FROM
       │                                         notifications
       │                                         WHERE user=current
       │                                         ORDER BY -created_at
       │                                      4. Paginate (20/page)
       │                                            │
       │ 5. HTTP 200 + JSON (notifications)        │
       │<───────────────────────────────────────────┤
       │                                            │
       │ 6. Render NotificationsPage                │
       │    Display notifications                   │
       │                                            │
       │ 7. User clicks notification                │
       │                                            │
       │ 8. PATCH /api/notifications/5/read/       │
       ├───────────────────────────────────────────>│
       │                                            │
       │                                      9. Update:
       │                                         is_read=True
       │                                            │
       │ 10. HTTP 200 + Updated Notif              │
       │<───────────────────────────────────────────┤
       │                                            │
       │ 11. Update UI (remove badge, etc)         │
       │                                            │
       │ 12. GET /api/notifications/stats/         │
       ├───────────────────────────────────────────>│
       │                                            │
       │                                      13. Calculate stats
       │                                            │
       │ 14. HTTP 200 + Statistics JSON            │
       │<───────────────────────────────────────────┤
       │                                            │
       │ 15. Display stats (total, unread, etc)    │
       │                                            │
```

---

## React Component Hierarchy

```
App
├── Router
│   └── Routes
│       ├── /notifications
│       │   └── ProtectedRoute
│       │       └── DashboardLayout
│       │           ├── NotificationBell (Header)
│       │           │   ├── Button (Bell Icon)
│       │           │   │   └── Badge (Unread Count)
│       │           │   └── Dropdown
│       │           │       ├── Header
│       │           │       └── Body (Quick Info)
│       │           └── NotificationsPage (Main Content)
│       │               ├── Header (Title + Stats)
│       │               │   └── StatCards (Total, Unread, Read)
│       │               ├── Controls
│       │               │   ├── Filter Buttons (All/Unread/Read)
│       │               │   └── Mark All Button
│       │               ├── NotificationList
│       │               │   └── NotificationItem[] (mapped)
│       │               │       ├── Icon
│       │               │       ├── Content
│       │               │       │   ├── Title
│       │               │       │   ├── Message
│       │               │       │   └── Metadata
│       │               │       └── Unread Badge
│       │               └── Pagination
│       │                   ├── Previous Button
│       │                   ├── Page Info
│       │                   └── Next Button
│       │
│       └── /other-routes
│           └── [Other components with NotificationBell]
```

---

## Data Model Relationships

```
┌──────────────────────────────────────────────────────┐
│                    Notification                      │
├──────────────────────────────────────────────────────┤
│ id (PK)                                              │
│ user_id (FK) ──────────> User (Recipient)           │
│ notification_type (choice)  # 6 types                │
│ title (varchar 255)                                  │
│ message (text)                                       │
│ is_read (boolean, default False)                     │
│ related_course_id (FK) ──> Course (Optional)        │
│ related_user_id (FK) ────> User (Optional)          │
│ created_at (datetime, auto)                          │
│ updated_at (datetime, auto)                          │
│                                                      │
│ Indexes:                                             │
│   - (user_id, -created_at)                           │
│   - (user_id, is_read)                               │
└──────────────────────────────────────────────────────┘
        │                           │
        │                           │
        ▼                           ▼
    ┌────────┐               ┌─────────────┐
    │  User  │               │   Course    │
    ├────────┤               ├─────────────┤
    │ id (PK)│               │ id (PK)     │
    │ role   │               │ title       │
    │ ...    │               │ description │
    └────────┘               │ instructor  │
                             │ ...         │
                             └─────────────┘
```

---

## Signal Processing Flow

```
┌──────────────────────────────────────────────────────┐
│           Event Triggers Signal Handler              │
└────────────────┬─────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
    ▼            ▼            ▼              ▼
User post_save  Enrollment  CourseContent  (Future)
                post_save   post_save
    │            │            │
    ▼            ▼            ▼
┌─────────┐  ┌─────────┐  ┌──────────┐
│ Signal  │  │ Signal  │  │ Signal   │
│Handler 1│  │Handler 2│  │Handler 3 │
└────┬────┘  └────┬────┘  └────┬─────┘
     │            │            │
     └────────┬───┴────┬───────┘
              │        │
         (Multiple handlers may fire)
              │
     ┌────────▼────────┐
     │ Create Notif    │
     │ Object(s)       │
     └────────┬────────┘
              │
     ┌────────▼─────────────────┐
     │ Notification.objects.    │
     │ create() or              │
     │ bulk_create()            │
     └────────┬─────────────────┘
              │
     ┌────────▼──────────────┐
     │ Save to Database      │
     │ (with timestamps)     │
     └────────┬──────────────┘
              │
     ┏━━━━━━━━▼━━━━━━━━━┓
     ┃ Notification ready
     ┃ for Frontend      ┃
     ┗━━━━━━━━━━━━━━━━━━┛
```

---

## Polling Mechanism (Frontend)

```
Component Mounts
      │
      ▼
┌──────────────────┐
│useEffect hook    │
│runs once         │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│Call getUnreadCount() once            │
│setUnreadCount(data.unread_count)     │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│Set interval timer (30000ms = 30s)    │
└────────┬─────────────────────────────┘
         │
         ├─ Timer starts ─────┐
         │                    │
    Every 30 seconds:         │
         ▼                    │
┌──────────────────────────┐  │
│Call getUnreadCount()     │◄─┘
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│Update state if different │
│setUnreadCount(new count) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│Badge renders with new    │
│count (or hides if 0)     │
└──────────────────────────┘
         │
         ├─ Continues polling until...
         │
    Component Unmounts
         │
         ▼
┌──────────────────────────┐
│useEffect cleanup runs    │
│clearInterval(interval)   │
└──────────────────────────┘
         │
         ▼
    Polling Stops
```

---

## Database Index Usage

```
Query Pattern 1: List user's notifications (Recent First)
────────────────────────────────────────────────────────

SELECT * FROM notifications
WHERE user_id = 123
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

Index Used: (user_id, -created_at)
Result: Fast scan from index start


Query Pattern 2: Count unread notifications
──────────────────────────────────────────────

SELECT COUNT(*) FROM notifications
WHERE user_id = 123 AND is_read = False;

Index Used: (user_id, is_read)
Result: Fast count from index subset


Query Pattern 3: Filter by read status
──────────────────────────────────────────

SELECT * FROM notifications
WHERE user_id = 123 AND is_read = False
ORDER BY created_at DESC;

Index Used: (user_id, is_read) then sort by created_at
Result: Good performance for smaller result sets
```

---

## Error Handling Flow

```
Frontend Makes API Call
         │
         ▼
    ┌─────────────────┐
    │ Fetch Request   │
    └────────┬────────┘
             │
    ┌────────┴───────────────┐
    │                        │
    ▼                        ▼
Success (Status 200)    Error/Failure
    │                        │
    ▼                        ▼
Parse JSON             Check Status Code
    │                        │
    ▼                        ▼
Update State            ├─ 401: Not Authenticated
    │                   │
    ▼                   ├─ 403: Not Authorized
Render                  │
Component               ├─ 404: Not Found
    │                   │
    ▼                   ├─ 500: Server Error
Display                 │
Data/UI                 ▼
                    Log to Console
                    (Development)
                        │
                        ▼
                    Show Error
                    Message to User
                    (UI Toast/Alert)
                        │
                        ▼
                    User can Retry
```

---

## Performance Optimization Points

```
┌────────────────────────────────────────────────────────────┐
│                  Performance Bottlenecks                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Database Queries                                       │
│     └─> Index (user_id, created_at)  ✓ Optimized          │
│     └─> Index (user_id, is_read)     ✓ Optimized          │
│                                                             │
│  2. API Response Size                                      │
│     └─> Pagination (20 per page)     ✓ Limited            │
│     └─> Serializer fields            ✓ Selective          │
│                                                             │
│  3. Frontend Polling                                       │
│     └─> Interval 30 seconds          ✓ Reasonable         │
│     └─> Conditional updates          ✓ Smart              │
│                                                             │
│  4. Component Rendering                                    │
│     └─> React.memo on items          ✓ Memoized           │
│     └─> Key prop on lists            ✓ Efficient          │
│                                                             │
│  5. Network Requests                                       │
│     └─> JWT caching                  ✓ In localStorage     │
│     └─> API deduping (optional)      □ Future              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

These diagrams provide a comprehensive visual understanding of how the entire notification system works, from architecture to data flow to performance optimization points.
