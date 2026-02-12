# Testing Guide - Admin Manage Users Redesign

## Prerequisites
- Backend running: `python manage.py runserver` (https://edu-village-6j7f.onrender.com/)
- Frontend running: `npm start` (http://localhost:3000)
- Logged in as admin

---

## Test Cases

### 1. Dashboard Navigation (Read-Only View)

**Test 1.1: Total Users Card**
- Click dashboard "Total Users" stat card
- Expected: `/admin/users?view=all`
- Expected URL shows: "All Users" as page title
- Expected: NO Action column in table
- Expected: Table shows all users

**Test 1.2: Students Card**
- Click dashboard "Students" stat card
- Expected: `/admin/users?role=student`
- Expected URL shows: "All Students" as page title
- Expected: NO Action column in table
- Expected: Table shows only students

**Test 1.3: Teachers Card**
- Click dashboard "Teachers" stat card
- Expected: `/admin/users?role=teacher`
- Expected URL shows: "All Teachers" as page title
- Expected: NO Action column in table
- Expected: Table shows only teachers

---

### 2. Management Mode Navigation

**Test 2.1: Manage Users Button**
- Click "Manage Users" button in dashboard
- Expected: `/admin/users?mode=manage`
- Expected URL shows: "Manage Users" as page title
- Expected: Action column IS visible
- Expected: "+Add User" button shows in header

---

### 3. Teacher Approval (Management Mode)

**Test 3.1: Approve Pending Teacher**
- Navigate to `/admin/users?mode=manage`
- Find teacher with status "Pending"
- Click "✓ Approve" button
- Expected: Toast message "Teacher approved successfully!"
- Expected: Table refreshes, teacher status changes to "Approved" or "Active"

**Test 3.2: Reject Pending Teacher**
- Navigate to `/admin/users?mode=manage`
- Find teacher with status "Pending"
- Click "✕ Reject" button
- Expected: Toast message "Teacher rejected successfully!"
- Expected: Table refreshes, teacher status changes to "Rejected"

---

### 4. Block/Unblock User (Management Mode)

**Test 4.1: Block Active Student**
- Navigate to `/admin/users?mode=manage`
- Find active student
- Click "🚫 Block" button
- Expected: Confirmation modal appears
  - Shows username
  - Warning: "This user will lose access to the platform"
- Click "Block User" button
- Expected: Toast message "User blocked successfully!"
- Expected: Table refreshes, user status changes to "Blocked"

**Test 4.2: Unblock Blocked Student**
- Find blocked student from previous test
- Click "✓ Unblock" button
- Expected: Toast message "User unblocked successfully!"
- Expected: Table refreshes, user status changes to "Active"

**Test 4.3: Try to Block Self**
- Navigate to `/admin/users?mode=manage`
- Find your own username (logged-in admin user)
- Check if Block button is visible and enabled
- Expected: Block button should be disabled
- Expected: Tooltip shows "Cannot block"

---

### 5. Delete User (Management Mode)

**Test 5.1: Delete Non-Admin User**
- Navigate to `/admin/users?mode=manage`
- Find any student user
- Click "🗑️ Delete" button
- Expected: Confirmation modal appears
  - Shows username
  - Warning: "This action cannot be undone"
- Click "Delete User" button
- Expected: Toast message "User deleted successfully!"
- Expected: Table refreshes, user is removed from list

**Test 5.2: Try to Delete Self**
- Navigate to `/admin/users?mode=manage`
- Find your own username
- Check if Delete button is visible and enabled
- Expected: Delete button should be disabled
- Expected: Tooltip shows "Cannot delete yourself"

**Test 5.3: Try to Delete Admin**
- Find any admin user in the list
- Check if Delete button is visible and enabled
- Expected: Delete button should be disabled
- Expected: Tooltip shows "Cannot delete admin"

**Test 5.4: Admin Shows No Actions**
- Find any admin user in the list
- Expected: No buttons visible
- Expected: Shows text "Admin account" in gray

---

### 6. Filtering & Display

**Test 6.1: Results Counter**
- Navigate to `/admin/users?view=all`
- Expected: Shows "X user(s)" based on count
- Navigate to `/admin/users?role=student`
- Expected: Shows "X student(s)" based on count
- Navigate to `/admin/users?role=teacher`
- Expected: Shows "X teacher(s)" based on count

**Test 6.2: Status Badges**
- Navigate to `/admin/users?view=all`
- Expected: Users show different colored status badges:
  - Green: "Active"
  - Yellow: "Pending"
  - Red: "Rejected"
  - Gray: "Blocked"

---

### 7. Toast Notifications

**Test 7.1: Success Toast**
- Approve a teacher
- Expected: Green toast appears with "✓ Teacher approved successfully!"
- Expected: Toast auto-dismisses after 3 seconds

**Test 7.2: Error Toast**
- Network error scenario (if possible to simulate)
- Expected: Red toast appears with "⚠️ Error: [message]"
- Expected: Toast auto-dismisses after 3 seconds

---

### 8. Modal Interactions

**Test 8.1: Block Modal Cancel**
- Click Block button on active user
- Modal appears
- Click "Cancel" button
- Expected: Modal closes, no API call made

**Test 8.2: Delete Modal Cancel**
- Click Delete button on user
- Modal appears
- Click "Cancel" button
- Expected: Modal closes, no API call made

**Test 8.3: Modal Close Button**
- Click Block button
- Modal appears
- Click "✕" in top-right
- Expected: Modal closes

---

### 9. URL Query Param Changes

**Test 9.1: Manual URL Navigation**
- Manually type `/admin/users?role=student` in address bar
- Expected: Only students show in table
- Manually type `/admin/users?mode=manage&role=teacher`
- Expected: Teachers show with action column visible

**Test 9.2: Back Button**
- Navigate from dashboard to manage mode
- Click browser back button
- Expected: Returns to dashboard

---

### 10. Empty State

**Test 10.1: No Users Match Filter**
- Filter for a role that may have no users
- Expected: Shows "📭 No users found" message

---

## Browser Console Checks

Open DevTools (F12) → Console tab and verify:

✓ No red errors appear
✓ Fetch requests show in Network tab
✓ Response status is 200
✓ JWT token is being sent correctly

---

## Known Limitations (Current)

⚠️ "+Add User" button is UI-only (stub)
⚠️ No search functionality yet
⚠️ No bulk actions yet
⚠️ No sorting yet
⚠️ No pagination yet

---

## Success Criteria

- ✅ Read-only dashboard views work
- ✅ Management mode shows action column
- ✅ Approve/Reject work for teachers
- ✅ Block/Unblock work for users
- ✅ Delete works with proper protections
- ✅ Toast messages appear
- ✅ Modals work correctly
- ✅ No errors in console
- ✅ Page titles update correctly
- ✅ Results counter updates correctly
