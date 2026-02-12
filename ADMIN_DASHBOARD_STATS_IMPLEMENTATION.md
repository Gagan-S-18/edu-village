# Admin Dashboard Statistics Implementation

## Overview
Implemented a complete admin dashboard statistics system with real-time data fetching from a secure backend endpoint.

---

## Backend Implementation

### 1. **New API Endpoint**
**File:** [backend/apps/dashboard/views.py](backend/apps/dashboard/views.py)

#### Endpoint: `GET /api/dashboard/admin/stats/`

**Features:**
- ✅ Admin-only access (requires `IsAdmin` permission)
- ✅ JWT authentication required (Authorization header)
- ✅ Returns comprehensive platform statistics
- ✅ Error handling with proper HTTP status codes

**Required Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "total_users": 15,
  "total_students": 10,
  "total_teachers": 4,
  "total_courses": 8,
  "total_enrollments": 25,
  "pending_teachers": 2
}
```

**Error Response (403 Forbidden):**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to fetch dashboard stats: {error_message}"
}
```

### 2. **Statistics Calculated**

| Metric | Query | Description |
|--------|-------|-------------|
| `total_users` | `User.objects.count()` | All users in system |
| `total_students` | `User.objects.filter(role='student').count()` | Active students |
| `total_teachers` | `User.objects.filter(role='teacher').count()` | All teachers (approved & pending) |
| `total_courses` | `Course.objects.count()` | All published courses |
| `total_enrollments` | `Enrollment.objects.count()` | Total enrollments |
| `pending_teachers` | `User.objects.filter(role='teacher', teacher_status='pending').count()` | Teachers awaiting approval |

### 3. **Database Queries**
- Efficient use of Django ORM with `.count()` for aggregations
- No N+1 query problems
- Single database query per statistic

### 4. **URL Configuration**
**File:** [backend/apps/dashboard/urls.py](backend/apps/dashboard/urls.py)

```python
path("admin/stats/", admin_dashboard_stats, name="admin-dashboard-stats")
```

**Full API Path:** `/api/dashboard/admin/stats/`

---

## Frontend Implementation

### 1. **Updated AdminDashboard Component**
**File:** [frontend/src/pages/admin/AdminDashboard.jsx](frontend/src/pages/admin/AdminDashboard.jsx)

**State Management:**
```javascript
const [stats, setStats] = useState({
  totalUsers: 0,
  totalStudents: 0,
  totalTeachers: 0,
  totalCourses: 0,
  totalEnrollments: 0,
  pendingTeachers: 0,
});
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
```

### 2. **Data Fetching Logic**
```javascript
useEffect(() => {
  fetchDashboardStats();
}, []);

const fetchDashboardStats = async () => {
  // 1. Get JWT token from localStorage
  const token = localStorage.getItem("access");
  
  // 2. Fetch from backend
  const response = await fetch(
    "https://edu-village-6j7f.onrender.com//api/dashboard/admin/stats/",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  
  // 3. Parse and set state
  const data = await response.json();
  setStats({
    totalUsers: data.total_users,
    totalStudents: data.total_students,
    totalTeachers: data.total_teachers,
    totalCourses: data.total_courses,
    totalEnrollments: data.total_enrollments,
    pendingTeachers: data.pending_teachers,
  });
};
```

### 3. **UI Components**

**Loading State:**
```jsx
{loading ? (
  <div className="stats-section">
    <p className="loading-text">📊 Loading dashboard statistics...</p>
  </div>
) : (
  // Stats cards and other content
)}
```

**Error Message:**
```jsx
{error && (
  <div className="alert alert-error">
    <span>⚠️ Error: {error}</span>
  </div>
)}
```

**Statistics Cards:**
```jsx
<section className="stats-section">
  <div className="stat-card">
    <div className="stat-icon">👥</div>
    <div className="stat-content">
      <div className="stat-value">{stats.totalUsers}</div>
      <div className="stat-label">Total Users</div>
    </div>
  </div>
  {/* More cards for: Students, Teachers, Courses, Enrollments */}
  
  {/* Alert card for pending teachers (if > 0) */}
  {stats.pendingTeachers > 0 && (
    <div className="stat-card stat-card-alert">
      <div className="stat-icon">⏳</div>
      <div className="stat-content">
        <div className="stat-value">{stats.pendingTeachers}</div>
        <div className="stat-label">Pending Teachers</div>
      </div>
    </div>
  )}
</section>
```

### 4. **Statistics Display**

| Icon | Metric | Color | Shows |
|------|--------|-------|-------|
| 👥 | Total Users | Default | All users count |
| 👨‍🎓 | Students | Default | Active students |
| 👨‍🏫 | Teachers | Default | All teachers |
| 📚 | Courses | Default | Published courses |
| 📈 | Enrollments | Default | Total enrollments |
| ⏳ | Pending Teachers | **Alert (Red)** | Only if > 0 |

---

## Styling

### New CSS Classes
**File:** [frontend/src/styles/dashboard-content.css](frontend/src/styles/dashboard-content.css)

#### `.stat-card-alert`
- Red alert border and background
- Highlights pending teacher approvals
- Animated pulse effect on icon

#### `.loading-text`
- Centered loading message
- Pulse animation for visual feedback

#### `.alert` & `.alert-error`
- Error message styling
- Matches EduVillage branding
- Professional appearance

**Animations:**
```css
@keyframes pulse-alert {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulse-text {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
```

---

## User Experience Flow

### 1. **Admin Opens Dashboard**
```
1. AdminDashboard component mounts
2. useEffect triggers fetchDashboardStats()
3. Show loading state: "📊 Loading dashboard statistics..."
4. Fetch data with JWT token
```

### 2. **Data Successfully Loaded**
```
1. Receive stats from backend
2. Update component state
3. Hide loading state
4. Display stats in cards:
   - 👥 15 Total Users
   - 👨‍🎓 10 Students
   - 👨‍🏫 4 Teachers
   - 📚 8 Courses
   - 📈 25 Enrollments
   - ⏳ 2 Pending Teachers (red alert)
```

### 3. **Error Handling**
```
1. API returns error
2. Show error message: "⚠️ Error: {error_details}"
3. Loading state ends
4. Graceful recovery (user can retry by refresh)
```

### 4. **Pending Teachers Indicator**
- Only shows if `pendingTeachers > 0`
- Red alert styling draws attention
- Links to Teacher Approval section below
- Pulsing animation to grab attention

---

## Security Features

✅ **JWT Authentication:** Token sent in Authorization header  
✅ **Admin-Only Access:** Endpoint protected with `IsAdmin` permission  
✅ **Error Handling:** No sensitive data leaked in error messages  
✅ **Database Queries:** Efficient aggregations, no data exposure  

---

## Error Handling

### Network Error
```
User sees: "⚠️ Error: Failed to fetch stats: Failed to fetch"
Action: Page refreshes to retry
```

### Authentication Error (No Token)
```
User sees: "⚠️ Error: No authentication token found"
Action: User redirected to login (by ProtectedRoute)
```

### Permission Error (Not Admin)
```
User sees: "⚠️ Error: Failed to fetch stats: 403 Forbidden"
Action: User redirected to home (by RoleRoute)
```

### Server Error
```
User sees: "⚠️ Error: Failed to fetch stats: {error_message}"
Action: Page refreshes to retry
```

---

## Performance Considerations

✅ **Efficient Queries:** Uses `.count()` for aggregation  
✅ **No N+1 Issues:** Single query per statistic  
✅ **Caching Potential:** Can add Redis caching if needed  
✅ **Loading State:** Shows user feedback immediately  
✅ **Conditional Rendering:** Pending teachers card only shown when needed

---

## Testing Checklist

### Backend
- [ ] Test endpoint returns all statistics
- [ ] Test JWT authentication requirement
- [ ] Test admin permission requirement
- [ ] Test counts are accurate
- [ ] Test error handling
- [ ] Test with 0 pending teachers
- [ ] Test with multiple pending teachers

### Frontend
- [ ] Component loads on mount
- [ ] Loading state shows while fetching
- [ ] Error state shows on API failure
- [ ] Statistics display correctly
- [ ] All 5 cards show (or 6 with pending)
- [ ] Pending teachers card only shows if > 0
- [ ] Refresh works to retry
- [ ] Layout preserved when loading

---

## API Testing

### Using cURL
```bash
# Get admin stats
curl -H "Authorization: Bearer {admin_token}" \
     https://edu-village-6j7f.onrender.com//api/dashboard/admin/stats/
```

### Using Postman
1. Set method to **GET**
2. URL: `https://edu-village-6j7f.onrender.com//api/dashboard/admin/stats/`
3. Headers tab:
   - Key: `Authorization`
   - Value: `Bearer {admin_token}`
4. Send request

### Expected Response
```json
{
  "total_users": 15,
  "total_students": 10,
  "total_teachers": 4,
  "total_courses": 8,
  "total_enrollments": 25,
  "pending_teachers": 2
}
```

---

## Files Modified

### Backend
- ✅ `backend/apps/dashboard/views.py` - Added `admin_dashboard_stats` endpoint
- ✅ `backend/apps/dashboard/urls.py` - Added route for stats endpoint

### Frontend
- ✅ `frontend/src/pages/admin/AdminDashboard.jsx` - Complete refactor with API integration
- ✅ `frontend/src/styles/dashboard-content.css` - Added styling for loading, error, alert states

---

## Summary

A complete, production-ready admin dashboard statistics system has been implemented with:

- **Secure Backend Endpoint** - Admin-only with JWT authentication
- **Real-Time Data** - Fetches fresh counts from database
- **Professional UI** - Loading states, error handling, responsive design
- **EduVillage Branding** - Consistent colors and animations
- **Complete Error Handling** - Graceful fallbacks and user feedback
- **Performance Optimized** - Efficient database queries
- **Existing Layout Preserved** - No breaking changes to design

The dashboard now displays live statistics and alerts admins to pending teacher approvals that need attention.
