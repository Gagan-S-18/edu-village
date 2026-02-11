# Admin "Manage Users" Feature - Redesign Summary

## Overview
Redesigned the Admin "Manage Users" feature with a **query param-based UI flow** that differentiates between **dashboard view** (read-only) and **admin management mode** (full controls).

---

## Architecture

### Query Param Structure
The component uses the **same route** `/admin/users` but changes behavior based on query parameters:

```
Dashboard Views (Read-only):
- /admin/users?view=all          → All Users (read-only)
- /admin/users?role=student      → All Students (read-only)
- /admin/users?role=teacher      → All Teachers (read-only)

Management Mode (Full Controls):
- /admin/users?mode=manage       → Manage Users (with action buttons)
```

### State Management
```javascript
const mode = searchParams.get("mode");        // "manage" or null
const roleFilter = searchParams.get("role");  // "student", "teacher", or null
const viewFilter = searchParams.get("view");  // "all" or null
const isManageMode = mode === "manage";
```

---

## UI Behavior

### Dashboard View (Default - Read-Only)
- **Page Title**: Dynamic based on filter
  - "All Users" (when no filter)
  - "All Students" (when role=student)
  - "All Teachers" (when role=teacher)
- **Table Columns**: Name, Email, Role, Status (NO Actions)
- **Features**: None - pure viewing experience
- **Used By**: Dashboard stat cards

### Management Mode (mode=manage)
- **Page Title**: "Manage Users"
- **Table Columns**: Name, Email, Role, Status, **Actions**
- **Add User Button**: Shows in header (UI only for now)
- **Action Buttons**: Fully enabled with context-aware logic

---

## Action Controls (Management Mode Only)

### 1. Teacher Pending
- **Approve**: Calls `PATCH /api/users/admin/teachers/{id}/approve/`
- **Reject**: Calls `PATCH /api/users/admin/teachers/{id}/reject/`

### 2. Student/Teacher Active
- **Block**: Opens confirmation modal
  - Calls `PATCH /api/users/admin/users/{id}/block`
  - Disabled if blocked user is self
  
### 3. Student/Teacher Blocked
- **Unblock**: Calls `PATCH /api/users/admin/users/{id}/unblock`
  - Disabled if blocked user is self

### 4. Any Non-Admin User
- **Delete**: Opens confirmation modal
  - Calls `DELETE /api/users/admin/users/{id}/delete`
  - **Prevents**: Self-delete, Admin account deletion
  
### 5. Admin Account
- **No Actions** - Shows "Admin account" text (read-only)

---

## UX Features

### Toast Notifications
- Success: "Teacher approved successfully!" ✓
- Error: "Error: [message]" ⚠️
- Auto-dismiss after 3 seconds

### Confirmation Modals
1. **Block User Modal**
   - Confirms blocking action
   - Warning: "This user will lose access to the platform"
   
2. **Delete User Modal**
   - Confirms deletion
   - Warning: "This action cannot be undone"

### Tooltips & Disabled State
- Buttons have `title` attribute for hover tooltips
- Buttons are disabled with explanation:
  - "Cannot delete yourself"
  - "Cannot block" (for admins)
  - "Cannot delete admin"

### Dynamic Page Title
```javascript
getPageTitle() {
  if (isManageMode) return "Manage Users";
  if (roleFilter === "student") return "All Students";
  if (roleFilter === "teacher") return "All Teachers";
  return "All Users";
}
```

### Results Counter
```javascript
getResultsText() {
  const count = filteredUsers.length;
  if (roleFilter === "student") return `${count} student${count !== 1 ? "s" : ""}`;
  if (roleFilter === "teacher") return `${count} teacher${count !== 1 ? "s" : ""}`;
  return `${count} user${count !== 1 ? "s" : ""}`;
}
```

---

## AdminDashboard Integration

### Before
```javascript
// All cards navigated to the same route with no differentiation
action: () => navigate('/admin/users')
```

### After
```javascript
// Manage Users Button (Management Mode)
action: () => navigate('/admin/users?mode=manage')

// Dashboard Cards (View Modes)
onClick={() => navigate('/admin/users?view=all')}        // Total Users
onClick={() => navigate('/admin/users?role=student')}    // Students
onClick={() => navigate('/admin/users?role=teacher')}    // Teachers
```

---

## Component Flow

```
ManageUsers Component
├── Read Query Params (useSearchParams)
├── Determine Mode (isManageMode)
├── Fetch Users (useEffect on mount)
├── Apply Filters (useEffect on users change)
├── Render Page Header
│   ├── Dynamic Title
│   ├── Result Counter
│   └── "+ Add User" Button (only in manage mode)
├── Render Table
│   ├── Conditional Actions Column (only if isManageMode)
│   ├── Status-based Button Logic
│   └── Disabled State Prevention
├── Render Modals
│   ├── Block Confirmation
│   └── Delete Confirmation
└── Toast Notifications
```

---

## Security & Safety

✅ **Self-Delete Prevention**: Users cannot delete themselves
✅ **Admin Protection**: Cannot delete admin accounts
✅ **Admin Account Lock**: Admin accounts show no actions
✅ **JWT Auth**: All API calls include Bearer token
✅ **Confirmation Modals**: Critical actions require confirmation
✅ **Error Handling**: User-friendly error messages

---

## Backend Compatibility

- ✅ No backend changes required
- ✅ Uses existing API endpoints:
  - `GET /api/users/admin/users`
  - `PATCH /api/users/admin/teachers/{id}/approve/`
  - `PATCH /api/users/admin/teachers/{id}/reject/`
  - `PATCH /api/users/admin/users/{id}/block`
  - `PATCH /api/users/admin/users/{id}/unblock`
  - `DELETE /api/users/admin/users/{id}/delete`

---

## CSS Classes Used

```css
.manage-users-container
.page-header
.header-top
.users-table-wrapper
.users-table
.badge badge-{role}
.status-badge status-{status}
.action-buttons
.btn btn-sm btn-{color}
.modal-overlay
.modal-content
.modal-header
.modal-body
.modal-footer
.toast toast-{type}
.empty-state
.no-actions
```

---

## Testing Checklist

- [ ] Dashboard cards navigate with correct query params
- [ ] "Manage Users" button shows action column
- [ ] Dashboard cards hide action column
- [ ] Approve/Reject buttons work for pending teachers
- [ ] Block/Unblock buttons work for active users
- [ ] Delete button works for non-admin users
- [ ] Self-delete is prevented
- [ ] Admin-delete is prevented
- [ ] Toast messages appear on success/error
- [ ] Confirmation modals appear before destructive actions
- [ ] Page title changes based on filter
- [ ] Results counter updates dynamically
- [ ] "+Add User" button only shows in manage mode

---

## Files Modified

1. **ManageUsers.jsx** (Complete Redesign)
   - Query param reading
   - Conditional rendering based on mode
   - Toast notifications
   - Confirmation modals
   - Self-delete & admin protection

2. **AdminDashboard.jsx** (Minor Update)
   - Changed Manage Users action: `/admin/users` → `/admin/users?mode=manage`
   - Changed All Users action: `/admin/users` → `/admin/users?view=all`

---

## Key Improvements

✨ **Clear Intent**: Users immediately see if they're viewing or managing
✨ **Single Route**: No route duplication, cleaner URL structure
✨ **Reusable Component**: Same component handles multiple views
✨ **Better UX**: Toast notifications instead of window.alert()
✨ **Safer Operations**: Confirmation modals for critical actions
✨ **Self-Protection**: Can't delete yourself or other admins
✨ **Professional UI**: Modals, tooltips, disabled states
✨ **Responsive**: Maintains existing styling and layout
