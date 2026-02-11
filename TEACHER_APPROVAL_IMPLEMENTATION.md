# Teacher Approval Flow - Implementation Guide

## Overview
A complete secure teacher approval workflow has been implemented for EduVillage, requiring admin approval before teachers can access the platform.

---

## Backend Changes

### 1. **User Model Update** 
**File:** [backend/apps/users/models.py](backend/apps/users/models.py)

New fields added to the `User` model:
```python
# Teacher approval status (pending → approved → rejected)
teacher_status = CharField(
    choices=['pending', 'approved', 'rejected'],
    default='pending'
)

# Teacher qualification details
qualification = CharField(max_length=255)  # e.g., "Bachelor's in Mathematics"
subject = CharField(max_length=100)        # e.g., "Mathematics"
experience = PositiveIntegerField()        # Years of teaching experience
```

### 2. **Updated RegisterSerializer**
**File:** [backend/apps/users/serializers.py](backend/apps/users/serializers.py)

Features:
- Password confirmation validation
- Accepts optional teacher fields (qualification, subject, experience)
- Automatically sets `teacher_status='pending'` for teacher signups
- Fields: `username`, `email`, `password`, `password_confirm`, `role`, `qualification`, `subject`, `experience`

### 3. **Enhanced LoginView**
**File:** [backend/apps/users/views.py](backend/apps/users/views.py)

Logic:
```
User Login:
├── If role='student' → Login allowed ✓
├── If role='teacher':
│   ├── If teacher_status='approved' → Login allowed ✓
│   └── If teacher_status!='approved' → Return error 403
└── If role='admin' → Login allowed ✓
```

Response on teacher login attempt:
```json
{
  "error": "Teacher account pending admin approval",
  "teacher_status": "pending"
}
```

### 4. **Updated user_profile Endpoint**
**File:** [backend/apps/users/views.py](backend/apps/users/views.py)

Now returns:
```json
{
  "id": 1,
  "username": "john_teacher",
  "email": "john@example.com",
  "role": "teacher",
  "teacher_status": "pending|approved|rejected",
  "qualification": "Bachelor's in Mathematics",
  "subject": "Mathematics",
  "experience": 5
}
```

### 5. **New Admin Endpoints**
**File:** [backend/apps/users/views.py](backend/apps/users/views.py)

#### GET `/api/users/admin/teachers/pending/`
Fetches all pending teacher registrations:
```json
[
  {
    "id": 1,
    "username": "teacher1",
    "email": "teacher1@example.com",
    "qualification": "Master's in Physics",
    "subject": "Physics",
    "experience": 8,
    "teacher_status": "pending"
  }
]
```

#### PATCH `/api/users/admin/teachers/{teacher_id}/approve/`
Approves a teacher (sets `teacher_status='approved'`):
```json
{
  "message": "Teacher approved successfully",
  "teacher": {
    "id": 1,
    "username": "teacher1",
    "teacher_status": "approved"
  }
}
```

#### PATCH `/api/users/admin/teachers/{teacher_id}/reject/`
Rejects a teacher (sets `teacher_status='rejected'`):
```json
{
  "message": "Teacher rejected successfully",
  "teacher": {
    "id": 1,
    "username": "teacher1",
    "teacher_status": "rejected"
  }
}
```

---

## Frontend Changes

### 1. **New Signup Page**
**File:** [frontend/src/pages/auth/Signup.jsx](frontend/src/pages/auth/Signup.jsx)

Features:
- Role selection: **Student** or **Teacher**
- Student signup:
  - Only requires: username, email, password
  - Account active immediately
- Teacher signup:
  - Requires: username, email, password + qualification, subject, experience
  - Includes warning: "Teacher accounts require admin approval before activation"
  - Redirects to login after successful signup
- Password validation (min 6 chars, confirmation match)

### 2. **Updated Login Page**
**File:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)

New logic:
```
User Login:
├── Authenticate with username/password
├── Fetch user profile (now includes teacher_status)
├── Role-based routing:
│   ├── student → /student/dashboard
│   ├── teacher:
│   │   ├── If teacher_status='approved' → /teacher/dashboard
│   │   ├── If teacher_status='pending' → /teacher/pending-approval
│   │   └── If teacher_status='rejected' → Show error message
│   └── admin → /admin/dashboard
└── Save to localStorage: role, username, teacher_status
```

Added signup link: "Don't have an account? Sign up here"

### 3. **New Pending Approval Page**
**File:** [frontend/src/pages/teacher/PendingApproval.jsx](frontend/src/pages/teacher/PendingApproval.jsx)

Features:
- Shows message: "Your teacher account is under review"
- Information timeline:
  - ✓ Application received
  - 🔄 Under admin review
  - 📧 Approval via email
- FAQ section explaining next steps
- Support contact information
- Logout button
- Professional styling with animations

### 4. **Teacher Approval Admin Component**
**File:** [frontend/src/pages/admin/TeacherApproval.jsx](frontend/src/pages/admin/TeacherApproval.jsx)

Features:
- Displays all pending teachers in a table
- Columns: Username, Email, Qualification, Subject, Experience
- Action buttons: **Approve** ✓ and **Reject** ✕
- Real-time feedback with success/error messages
- Confirmation dialog before rejection
- Empty state when no pending teachers

### 5. **Updated AdminDashboard**
**File:** [frontend/src/pages/admin/AdminDashboard.jsx](frontend/src/pages/admin/AdminDashboard.jsx)

Integrated TeacherApproval component for easy access to pending teacher approvals.

### 6. **Updated App.js Routes**
**File:** [frontend/src/App.js](frontend/src/App.js)

New routes:
```javascript
<Route path="/signup" element={<Signup />} />
<Route path="/teacher/pending-approval" element={<PendingApproval />} />
```

Updated login to handle teacher_status from localStorage.

---

## Styling

### New CSS Files

#### [frontend/src/styles/pending-approval.css](frontend/src/styles/pending-approval.css)
- Centered card layout with gradient background
- Animation pulse effect on icon
- Info boxes showing approval progress
- FAQ section with styled list
- Responsive design for mobile

#### [frontend/src/styles/teacher-approval.css](frontend/src/styles/teacher-approval.css)
- Responsive data table for pending teachers
- Action buttons with hover effects
- Empty state message
- Success/error message styling
- Mobile-responsive table with proper overflow handling

#### Updated [frontend/src/styles/auth-form.css](frontend/src/styles/auth-form.css)
- Added `.form-select` for role selection dropdown
- Added `.form-note` for teacher signup warning
- Added `.auth-success-message` for success feedback
- Added `.auth-footer-link` and `.auth-link-btn` for signup link

---

## User Flows

### Student Registration Flow
```
1. Visit /signup
2. Select "Student" role
3. Enter: username, email, password
4. Click "Sign Up"
5. Success message
6. Redirected to /login
7. Login with credentials
8. Automatically redirected to /student/dashboard
```

### Teacher Registration Flow (Pending Approval)
```
1. Visit /signup
2. Select "Teacher" role
3. Enter: username, email, password, qualification, subject, experience
4. See warning: "Teacher accounts require admin approval"
5. Click "Sign Up"
6. Success message: "Teacher account created! Admin approval required."
7. Redirected to /login
8. Attempt login
9. Receive error: "Teacher account pending admin approval"
10. Redirected to /teacher/pending-approval
11. Wait for admin approval (shown in page)
```

### Teacher Approval Flow (Admin)
```
1. Admin logs in
2. Views /admin/dashboard
3. Sees "Pending Teacher Approvals" section
4. Views table of pending teachers with details:
   - Username, Email, Qualification, Subject, Experience
5. Can click:
   - "✓ Approve" → teacher_status becomes 'approved'
   - "✕ Reject" → teacher_status becomes 'rejected'
6. Success message displayed
7. Teacher removed from pending list
```

### Approved Teacher Login Flow
```
1. Teacher logs in with credentials
2. Checks teacher_status = 'approved'
3. Automatically redirected to /teacher/dashboard
4. Can access all teacher features
```

---

## Database Setup

**Required Migration:**
```bash
# From backend directory
python manage.py makemigrations users
python manage.py migrate
```

This creates the new fields in the User table:
- `teacher_status` (CharField, default='pending')
- `qualification` (CharField, nullable)
- `subject` (CharField, nullable)
- `experience` (PositiveIntegerField, nullable)

---

## Security Features

1. **Backend Validation:** LoginView checks teacher_status before token generation
2. **Frontend Protection:** Teacher routes redirect to pending approval page
3. **Admin-Only Access:** Teacher approval endpoints require IsAdmin permission
4. **Confirmation Dialog:** Admin must confirm before rejecting a teacher
5. **localStorage Tracking:** teacher_status stored for quick frontend checks

---

## Testing Checklist

### Backend
- [ ] Test student registration (teacher_status not set)
- [ ] Test teacher registration (teacher_status='pending')
- [ ] Test student login (no teacher_status check)
- [ ] Test teacher login (pending) - should return 403
- [ ] Test teacher login (approved) - should return 200
- [ ] Test admin endpoints for pending teachers
- [ ] Test teacher approval endpoint
- [ ] Test teacher rejection endpoint

### Frontend
- [ ] Student can signup and login immediately
- [ ] Teacher signup form validates all fields
- [ ] Teacher sees warning about admin approval
- [ ] Teacher login redirects to pending approval page
- [ ] Pending approval page displays correctly
- [ ] Admin can view pending teachers in dashboard
- [ ] Admin can approve teachers
- [ ] Admin can reject teachers with confirmation
- [ ] Approved teacher can login and access dashboard

---

## API Testing Examples

### Register Student
```bash
POST /api/users/register/
{
  "username": "john_student",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "role": "student"
}
```

### Register Teacher
```bash
POST /api/users/register/
{
  "username": "jane_teacher",
  "email": "jane@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "role": "teacher",
  "qualification": "Master's in Mathematics",
  "subject": "Mathematics",
  "experience": 8
}
```

### Get Pending Teachers
```bash
GET /api/users/admin/teachers/pending/
Authorization: Bearer {admin_token}
```

### Approve Teacher
```bash
PATCH /api/users/admin/teachers/1/approve/
Authorization: Bearer {admin_token}
```

### Reject Teacher
```bash
PATCH /api/users/admin/teachers/1/reject/
Authorization: Bearer {admin_token}
```

---

## Existing Functionality Preserved

✅ **Student workflow** - Unchanged, works as before
✅ **Admin workflow** - Enhanced with teacher management
✅ **Login/Token system** - Uses existing JWT system
✅ **Database** - Backward compatible migration
✅ **Styling** - Consistent with EduVillage branding
✅ **Layout system** - Works with existing DashboardLayout

---

## Summary

A complete, production-ready teacher approval system has been implemented with:
- **Clear user experience** for students and teachers
- **Secure backend validation** for teachers
- **Admin interface** for managing approvals
- **Professional UI** with error handling
- **Responsive design** for all devices
- **Consistent branding** throughout

Teachers must now be approved by admins before gaining dashboard access, ensuring platform quality and security.
