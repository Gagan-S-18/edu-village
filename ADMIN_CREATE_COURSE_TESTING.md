# Admin Create Course Feature - Quick Reference & Testing Guide

## Feature Summary
Admins can now create courses directly through the platform without needing teacher assignment initially. Courses are created in "draft" status and can be published later.

## Accessing the Feature

### Option 1: From Admin Dashboard
1. Login as admin
2. Go to Admin Dashboard (`/admin/dashboard`)
3. Click **"Create Course"** quick action button (green with ➕ icon)
4. Or navigate directly to `/admin/create-course`

### Option 2: From Manage Courses
1. Login as admin
2. Go to Manage Courses (`/admin/courses`)
3. Click **"➕ Create New Course"** button at the top

## Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Course Title | Text | Yes | Cannot be empty |
| Course Description | Textarea | Yes | Cannot be empty |
| Duration (hours) | Number | Yes | Must be positive number |
| Status | Dropdown | Yes | Options: Draft, Published, Archived (Default: Draft) |

## Backend Endpoints

### Create Course (Admin Only)
```
POST /api/courses/admin/create/
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Example cURL Request**:
```bash
curl -X POST http://127.0.0.1:8000/api/courses/admin/create/ \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Python",
    "description": "Learn Python programming basics",
    "duration": 40,
    "status": "published"
  }'
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    "id": 5,
    "title": "Introduction to Python",
    "description": "Learn Python programming basics",
    "duration": 40,
    "status": "published",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## Testing Steps

### Test 1: Admin Can Create Course
1. Login as admin user
2. Navigate to `/admin/create-course`
3. Fill form:
   - Title: "Advanced JavaScript"
   - Description: "Master JavaScript ES6+ features"
   - Duration: 35
   - Status: Draft
4. Click "Create Course"
5. **Expected**: Success message, redirect to Manage Courses, course visible in list

### Test 2: Form Validation - Empty Title
1. Try to submit form with empty title
2. **Expected**: Error message "Course title is required"

### Test 3: Form Validation - Invalid Duration
1. Enter duration as -5 or 0
2. **Expected**: Error message "Duration must be a positive number"

### Test 4: Non-Admin Cannot Access
1. Login as teacher or student
2. Try to navigate to `/admin/create-course`
3. **Expected**: Redirect to dashboard (RoleRoute protection)
4. Try to POST to `/api/courses/admin/create/`
5. **Expected**: 403 Forbidden error

### Test 5: Missing Authentication
1. Try to POST to `/api/courses/admin/create/` without token
2. **Expected**: 401 Unauthorized error

### Test 6: Dashboard Integration
1. Login as admin
2. Go to Admin Dashboard
3. **Expected**: "Create Course" button visible in Quick Actions (1st button, green)
4. Click button
5. **Expected**: Navigate to create course form

### Test 7: Manage Courses Integration
1. Login as admin
2. Go to Manage Courses
3. **Expected**: "➕ Create New Course" button at top
4. Click button
5. **Expected**: Navigate to create course form

## Common Issues & Troubleshooting

### Issue: "403 Forbidden" when accessing `/admin/create-course`
**Solution**: 
- Verify you're logged in as an admin user
- Check localStorage for correct role: `localStorage.getItem('role')` should be 'admin'
- Verify JWT token is valid: `localStorage.getItem('access')`

### Issue: Form submission shows "Network error"
**Solution**:
- Ensure Django backend is running on http://127.0.0.1:8000
- Check browser console (F12) for specific error
- Verify JWT token hasn't expired
- Check CORS settings if making from different origin

### Issue: Course doesn't appear after creation
**Solution**:
- Check if API returned 201 status (not 200)
- Verify course was saved in database: `Course.objects.all()` in Django shell
- Check if you're viewing as correct admin user

### Issue: Can see button but can't navigate to form
**Solution**:
- Clear browser cache and localStorage
- Refresh page and try again
- Check browser console for JavaScript errors

## Database Queries

### View All Courses (Django Shell)
```python
python manage.py shell
>>> from apps.courses.models import Course
>>> Course.objects.all()
>>> Course.objects.filter(status='draft')
>>> Course.objects.filter(status='published')
```

### Check Admin User
```python
>>> from apps.users.models import User
>>> admin_user = User.objects.filter(role='admin').first()
>>> admin_user.username
```

## Performance Notes

- Form validation happens in real-time as user types
- Database migration includes indexes on frequently queried fields
- No performance impact on existing course listing

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Keyboard Shortcuts

- Tab: Navigate between form fields
- Enter: Submit form
- Esc: (Not implemented, use Cancel button)

## Accessibility

- All form fields have proper labels
- Error messages clearly describe issues
- Buttons have clear labels
- Color is not only visual indicator (also uses icons)

## Related Documentation

- [Full Implementation Details](ADMIN_CREATE_COURSE_IMPLEMENTATION.md)
- [API Documentation](docs/api-notes.md)
- [Architecture Overview](docs/architecture.md)
- [Database Schema](docs/database-design.md)

---

**Last Updated**: 2024-01-15
**Feature Status**: ✅ Complete & Ready for Testing
