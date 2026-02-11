# Architecture Diagram - Admin Manage Users

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Total Users  │  │  Students    │  │  Teachers    │          │
│  │ Card         │  │  Card        │  │  Card        │          │
│  │ 5 users      │  │  3 students  │  │  2 teachers  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                  │
│         ↓                 ↓                 ↓                  │
│  ?view=all        ?role=student     ?role=teacher             │
│                                                                 │
│  ┌─────────────────────────────────────────┐                   │
│  │ Manage Users Button                     │                   │
│  │ + Add User (secondary)                  │                   │
│  └──────────────────┬──────────────────────┘                   │
│                     │                                          │
│                     ↓                                          │
│              ?mode=manage                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │   ManageUsers.jsx     │
                    │   (Single Component)  │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ↓                       ↓
        ┌──────────────────┐    ┌──────────────────┐
        │   READ QUERY     │    │   READ CURRENT   │
        │   PARAMS         │    │   USER ID        │
        │                  │    │                  │
        │ mode             │    │ localStorage     │
        │ roleFilter       │    │   .user_id       │
        │ viewFilter       │    │                  │
        └────────┬─────────┘    └────────┬─────────┘
                 │                       │
                 └───────────┬───────────┘
                             │
                    ┌────────▼────────┐
                    │ Determine Mode  │
                    │                 │
                    │ isManageMode    │
                    │ = (mode ===     │
                    │   "manage")     │
                    └────────┬────────┘
                             │
        ┌────────────────────┴─────────────────────┐
        │                                          │
        ↓                                          ↓
   MANAGE MODE = TRUE               MANAGE MODE = FALSE
   (Manage Users)                   (Dashboard View)
        │                                          │
        │                                          │
   ┌────▼──────────────┐                 ┌────────▼──────────┐
   │ CONDITIONAL       │                 │ CONDITIONAL       │
   │ RENDERING         │                 │ RENDERING         │
   │                   │                 │                   │
   │ • Show Title      │                 │ • Show Title      │
   │   "Manage Users"  │                 │   "All Users" /   │
   │                   │                 │   "Students" /    │
   │ • Show "+ Add"    │                 │   "Teachers"      │
   │                   │                 │                   │
   │ • Show Actions    │                 │ • Hide Actions    │
   │   Column          │                 │   Column          │
   │                   │                 │                   │
   │ • Show Buttons:   │                 │ • Show Read-Only  │
   │   - Approve       │                 │   Table Only      │
   │   - Reject        │                 │                   │
   │   - Block         │                 │ • Redirect intent │
   │   - Unblock       │                 │   "Just viewing"  │
   │   - Delete        │                 │                   │
   │                   │                 │                   │
   │ • Show Confirm    │                 └───────────────────┘
   │   Modals          │
   │                   │
   │ • Show Tooltips   │
   │   on disabled     │
   │   buttons         │
   │                   │
   └────┬──────────────┘
        │
        ↓
   ┌──────────────────────────────────┐
   │ FETCH USERS                      │
   │ GET /api/users/admin/users       │
   │ Headers: Authorization Bearer    │
   └────┬─────────────────────────────┘
        │
        ↓
   ┌──────────────────────────────────┐
   │ APPLY FILTERS                    │
   │                                  │
   │ if roleFilter === "student"      │
   │   → Show only students           │
   │ elif roleFilter === "teacher"    │
   │   → Show only teachers           │
   │ else                             │
   │   → Show all users               │
   │                                  │
   └────┬─────────────────────────────┘
        │
        ↓
   ┌──────────────────────────────────┐
   │ RENDER TABLE                     │
   │                                  │
   │ Column: Name                     │
   │ Column: Email                    │
   │ Column: Role                     │
   │ Column: Status                   │
   │ Column: Actions (if manage mode) │
   │                                  │
   │ For each user:                   │
   │  Show status badge               │
   │  Show smart buttons              │
   │  Show disabled state if needed   │
   │                                  │
   └────┬─────────────────────────────┘
        │
        ├─→ If no users → Show "No users found"
        │
        └─→ Render rows with buttons
              │
              ├─→ Teacher Pending
              │    ├─→ [✓ Approve] → handleApprove(id)
              │    └─→ [✕ Reject]  → handleReject(id)
              │
              ├─→ Student/Teacher Active
              │    └─→ [🚫 Block]   → setBlockConfirmUser()
              │
              ├─→ Student/Teacher Blocked
              │    └─→ [✓ Unblock]  → handleUnblock(id)
              │
              ├─→ Any Non-Admin
              │    └─→ [🗑️ Delete]  → setDeleteConfirmUser()
              │
              └─→ Admin Account
                   └─→ "Admin account" (text, no buttons)
```

---

## 🔄 Action Flow - Approve Teacher Example

```
┌─────────────────────────┐
│ Admin clicks            │
│ "✓ Approve" button      │
│ (user.id = 42)          │
└────────────┬────────────┘
             │
             ↓
    ┌────────────────────┐
    │ handleApprove(42)  │
    │ Function called    │
    └────────┬───────────┘
             │
             ↓
    ┌─────────────────────────────┐
    │ API CALL                    │
    │ PATCH                       │
    │ /api/users/admin/teachers   │
    │  /42/approve/               │
    │                             │
    │ Headers:                    │
    │ Authorization:              │
    │   Bearer {token}            │
    └────────┬────────────────────┘
             │
             ├─→ ✅ Success (200)
             │   │
             │   ↓
             │  ┌──────────────────────┐
             │  │ Show Toast           │
             │  │ ✓ Teacher approved   │
             │  │ successfully!        │
             │  │ (auto-dismiss 3s)    │
             │  └──────────┬───────────┘
             │             │
             │             ↓
             │  ┌──────────────────────┐
             │  │ await fetchUsers()   │
             │  │ Reload table from    │
             │  │ backend              │
             │  └──────────┬───────────┘
             │             │
             │             ↓
             │  ┌──────────────────────┐
             │  │ Update UI            │
             │  │ Status now shows     │
             │  │ "Approved" or        │
             │  │ "Active"             │
             │  │ Buttons change       │
             │  └──────────────────────┘
             │
             └─→ ❌ Error
                 │
                 ↓
                ┌──────────────────────┐
                │ Show Toast (Red)     │
                │ ⚠️ Error: [message]  │
                │ (auto-dismiss 3s)    │
                └──────────────────────┘
```

---

## 🛡️ Delete Protection Logic

```
Admin clicks [🗑️ Delete] on user_id=99

         ↓

┌────────────────────────────────────┐
│ PROTECTION CHECKS                  │
│                                    │
│ Check 1: Is this me?               │
│ if (currentUserId === 99)          │
│   → Button DISABLED ❌             │
│   → Tooltip: "Cannot delete        │
│              yourself"             │
│                                    │
│ Check 2: Is this an admin?         │
│ if (user.role === "admin")         │
│   → Button DISABLED ❌             │
│   → Tooltip: "Cannot delete admin" │
│                                    │
│ Check 3: Am I in manage mode?      │
│ if (!isManageMode)                 │
│   → Button NOT VISIBLE ❌          │
│                                    │
│ If all checks pass:                │
│   → Button ENABLED ✅             │
│   → onClick: setDeleteConfirmUser()│
│                                    │
└────────────────────────────────────┘

         ↓

If Button Enabled:

┌────────────────────────────────────┐
│ CONFIRMATION MODAL                 │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Delete User                  │   │
│ ├──────────────────────────────┤   │
│ │ Are you sure you want to     │   │
│ │ delete "john"?               │   │
│ │                              │   │
│ │ ⚠️ This action cannot be     │   │
│ │ undone.                      │   │
│ │                              │   │
│ │ [Cancel] [Delete User]       │   │
│ └──────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘

         ↓

┌────────────────────────────────────┐
│ DELETE API CALL                    │
│                                    │
│ DELETE                             │
│ /api/users/admin/users/99/delete   │
│                                    │
└────────────────────────────────────┘

         ↓

┌────────────────────────────────────┐
│ SUCCESS                            │
│                                    │
│ ✓ User deleted successfully!       │
│                                    │
│ Table refreshes, user removed      │
│                                    │
└────────────────────────────────────┘
```

---

## 📊 State Changes

```
Initial State:
├─ users: []
├─ filteredUsers: []
├─ deleteConfirmUser: null
├─ blockConfirmUser: null
├─ toast: null
├─ currentUserId: 123
├─ isManageMode: false/true (from params)
└─ roleFilter: null/"student"/"teacher"

After fetchUsers():
├─ users: [user1, user2, user3...]
└─ Trigger filter useEffect

After filter useEffect:
├─ filteredUsers: [filtered users based on roleFilter]

After user clicks Approve:
├─ Make API call
├─ toast: { message: "...", type: "success" }
├─ fetchUsers() → refresh users
├─ Toast auto-dismisses after 3s
└─ toast: null

After user clicks Block:
├─ blockConfirmUser: {id: 42, username: "john", ...}
├─ Modal shows
└─ User confirms in modal

After Delete Confirmation:
├─ Make API call
├─ deleteConfirmUser: null (close modal)
├─ toast: "User deleted successfully!"
├─ fetchUsers() → refresh users
└─ User removed from table
```

---

## ✨ The Magic: Same Route, Different UI

```
        URL INPUT
           │
    ┌──────┴──────┐
    │             │
    ↓             ↓
/admin/users  /admin/users
?role=student  ?mode=manage
    │             │
    ↓             ↓
 SAME         SAME
ROUTE        ROUTE
    │             │
    ├─────┬───────┤
    │     │       │
    ↓     ↓       ↓
Query Params      Body
    │
    └─────────────────────┐
                          │
                    ┌─────▼─────┐
                    │ Component │
                    │ Reads     │
                    │ Params    │
                    └─────┬─────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ↓                       ↓
        Renders UI A            Renders UI B
        (Read-Only)            (Full Control)
          MAGIC! ✨
```

This is the power of query parameter-based UI design!
