# Quick Reference - Admin Manage Users

## 📍 URL Routes & Modes

| URL | Mode | View Type | Use Case |
|-----|------|-----------|----------|
| `/admin/users?view=all` | View | Read-Only | Dashboard "Total Users" card |
| `/admin/users?role=student` | View | Read-Only | Dashboard "Students" card |
| `/admin/users?role=teacher` | View | Read-Only | Dashboard "Teachers" card |
| `/admin/users?mode=manage` | Manage | Full Control | "Manage Users" button |

---

## 🎯 Component Behavior

```javascript
isManageMode = true   → Show Actions column + Buttons + Add User
isManageMode = false  → Hide Actions column (read-only view)
```

---

## 🔘 Available Actions (Manage Mode Only)

### Teacher Pending
```
Button "✓ Approve" 
  → PATCH /api/users/admin/teachers/{id}/approve/
  → Toast: "Teacher approved successfully!"

Button "✕ Reject"
  → PATCH /api/users/admin/teachers/{id}/reject/
  → Toast: "Teacher rejected successfully!"
```

### Student/Teacher Active
```
Button "🚫 Block"
  → Opens confirmation modal
  → PATCH /api/users/admin/users/{id}/block
  → Toast: "User blocked successfully!"
  → Disabled if: currentUserId === user.id
```

### Student/Teacher Blocked
```
Button "✓ Unblock"
  → PATCH /api/users/admin/users/{id}/unblock
  → Toast: "User unblocked successfully!"
  → Disabled if: currentUserId === user.id
```

### Any Non-Admin User
```
Button "🗑️ Delete"
  → Opens confirmation modal
  → DELETE /api/users/admin/users/{id}/delete
  → Toast: "User deleted successfully!"
  → Disabled if: 
    - currentUserId === user.id (can't delete self)
    - user.role === "admin" (can't delete admin)
```

### Admin Account
```
Text "Admin account" (gray, no buttons)
  → No actions available
```

---

## 📊 Page Display

### Dashboard View (Read-Only)
```
Title: "All Users" | "All Students" | "All Teachers"
Counter: "5 users" | "3 students" | "2 teachers"
Table: Name | Email | Role | Status
Buttons: None
```

### Management Mode
```
Title: "Manage Users"
Counter: "5 users"
Button: "+ Add User"
Table: Name | Email | Role | Status | Actions
Buttons: Approve/Reject | Block/Unblock | Delete
```

---

## 🎨 Status Badges

| Status | Color | Meaning |
|--------|-------|---------|
| Active | Green 🟢 | User can access |
| Pending | Yellow 🟡 | Waiting for approval |
| Approved | Green 🟢 | Teacher approved |
| Rejected | Red 🔴 | Teacher rejected |
| Blocked | Gray ⚫ | User cannot access |

---

## ⚠️ Safety Features

```javascript
// Prevents self-deletion
if (currentUserId === user.id) {
  // Button disabled
}

// Prevents admin deletion
if (user.role === "admin") {
  // Button disabled
}

// Confirmation before destructive actions
{blockConfirmUser && <Modal />}  // Block confirmation
{deleteConfirmUser && <Modal />} // Delete confirmation
```

---

## 🔔 User Feedback

### Success Notification
```
✓ Teacher approved successfully!     [Auto-dismiss 3s]
✓ User blocked successfully!         [Auto-dismiss 3s]
✓ User deleted successfully!         [Auto-dismiss 3s]
```

### Error Notification
```
⚠️ Error: Failed to fetch users      [Auto-dismiss 3s]
⚠️ Error: [specific error message]   [Auto-dismiss 3s]
```

---

## 🔍 Query Params Logic

```javascript
const mode = searchParams.get("mode");      // "manage" or null
const roleFilter = searchParams.get("role"); // "student", "teacher", or null
const viewFilter = searchParams.get("view"); // "all" or null
const isManageMode = mode === "manage";

// Apply filters to table
if (roleFilter === "student") → Show only students
if (roleFilter === "teacher") → Show only teachers
else → Show all users
```

---

## 🚀 Navigation Flow

### From Dashboard
```
Dashboard → Click "Manage Users" → /admin/users?mode=manage
        → Click "Total Users" → /admin/users?view=all
        → Click "Students" → /admin/users?role=student
        → Click "Teachers" → /admin/users?role=teacher
```

### From Management Mode
```
Manage Users → Approve Teacher → Refresh → Show updated status
            → Reject Teacher → Refresh → Show updated status
            → Block Student → Confirm → Refresh → Show blocked
            → Delete User → Confirm → Refresh → User removed
```

---

## 🔧 Backend APIs Used

```
GET  /api/users/admin/users                    → Fetch all users
PATCH /api/users/admin/teachers/{id}/approve/  → Approve teacher
PATCH /api/users/admin/teachers/{id}/reject/   → Reject teacher
PATCH /api/users/admin/users/{id}/block        → Block user
PATCH /api/users/admin/users/{id}/unblock      → Unblock user
DELETE /api/users/admin/users/{id}/delete      → Delete user
```

All requests include: `Authorization: Bearer {token}`

---

## 📝 File Locations

```
ManageUsers.jsx          → frontend/src/pages/admin/ManageUsers.jsx
AdminDashboard.jsx       → frontend/src/pages/admin/AdminDashboard.jsx
CSS                      → frontend/src/styles/manage-users.css
```

---

## ✅ Testing Quick Checks

- [ ] Dashboard cards have different URLs
- [ ] Management mode shows action column
- [ ] View modes hide action column
- [ ] Approve/Reject work for pending teachers
- [ ] Block/Unblock work for active users
- [ ] Delete prevents self-delete and admin-delete
- [ ] Modals appear before critical actions
- [ ] Toast notifications appear and auto-dismiss
- [ ] Page title updates based on query params
- [ ] Results counter shows correct count

---

## 🐛 Debugging

### Check Query Params in DevTools
```
Open DevTools → Console
type: new URLSearchParams(window.location.search)
Shows all current query params
```

### Check API Calls
```
DevTools → Network tab
Filter: fetch
See all API calls made
Check response status and data
```

### Check Component State
```
DevTools → React DevTools extension
Inspect ManageUsers component
See: searchParams, users, filteredUsers, etc.
```

---

## 📚 Documentation Files

- `MANAGE_USERS_REDESIGN.md` - Full architecture & features
- `TESTING_GUIDE.md` - 30+ test cases with step-by-step instructions
- `BEFORE_AFTER.md` - Detailed comparison of improvements
- `IMPLEMENTATION_SUMMARY.md` - What was built and how

---

## 🎯 Key Takeaway

**Same Route. Different Intent. Query Params. Smart UI.**

The beauty of this design:
- No new routes to maintain
- URL clearly shows what you're doing
- Component automatically adjusts UI
- Professional, intuitive admin panel

✨ **Status**: Ready to use!
