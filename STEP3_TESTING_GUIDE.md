# STEP 3: Quick Start & Testing Guide

## Quick Start

### How to Access the Student Course Details Page

1. **Start the Backend**
   ```bash
   cd backend
   python manage.py runserver
   ```
   Should run on `https://edu-village-6j7f.onrender.com/`

2. **Start the Frontend**
   ```bash
   cd frontend
   npm start
   ```
   Should run on `http://localhost:3000`

3. **Login as Student**
   - Navigate to http://localhost:3000/login
   - Enter student credentials
   - Click "Login" → Redirected to `/student/dashboard`

4. **Access Student Course Details**
   - Click "My Courses" or navigate to `/student/courses`
   - Click "View Course" button on any enrolled course
   - **URL changes to**: `/student/courses/<course_id>`
   - **Component renders**: StudentCourseContent ✓

### Expected Page Elements

When the page loads, you should see:

```
✓ Back button (← Back to My Courses)
✓ Course title (large, dark blue heading)
✓ Instructor name (with "Instructor:" label in teal)
✓ Course description (paragraph text)
✓ Progress percentage (e.g., "60%")
✓ Progress bar (filled based on percentage)
✓ Completion count (e.g., "3 of 5 completed")
✓ Three tabs: 📚 Content | 📝 Assignments | 📊 Progress
✓ Tab content (depends on active tab)
```

---

## Testing Scenarios

### Test 1: Page Loads with Course Data
**Objective**: Verify component fetches and displays course information

**Steps**:
1. Navigate to `/student/courses/1` (or any valid course_id)
2. Wait 2-3 seconds for data to load

**Expected Results**:
- [ ] Loading spinner appears initially
- [ ] Spinner disappears after data loads
- [ ] Course title displays (e.g., "Python Basics")
- [ ] Instructor name displays (e.g., "Dr. Sarah Johnson")
- [ ] Course description shows (full text, not truncated)
- [ ] Progress card shows percentage (0-100%)
- [ ] Tabs are clickable and labeled

**Pass/Fail**: _____

---

### Test 2: Content Tab Functionality
**Objective**: Verify content listing and interaction

**Steps**:
1. Ensure Content tab is active (default)
2. Observe the content table
3. Click "Mark Done" button on an incomplete item
4. Wait for button to update

**Expected Results**:
- [ ] Table displays with 5 columns (File Name, Type, Date, Status, Action)
- [ ] Files show correct type icons (🎥, 📄, 📝, etc.)
- [ ] Types show color-coded badges
- [ ] Dates are formatted (MM/DD/YYYY)
- [ ] Completed items show "✓ Completed" (green)
- [ ] Pending items show "○ Pending" (orange)
- [ ] "Mark Done" button appears only on pending items
- [ ] Button shows "..." during API call
- [ ] After completion:
  - Item status changes to "✓ Completed"
  - Button disappears
  - Progress bar increases
  - Progress percentage updates

**Pass/Fail**: _____

---

### Test 3: Assignments Tab
**Objective**: Verify assignment display and filtering

**Steps**:
1. Click "📝 Assignments" tab
2. Observe the assignments list
3. Note the count in tab label

**Expected Results**:
- [ ] Tab count is accurate (only assignment-type content shown)
- [ ] Assignments displayed as cards (not table)
- [ ] Each card shows:
  - Assignment title
  - Uploaded date
  - Status badge (Pending/Submitted)
  - Submit button (if pending)
- [ ] Status colors are correct:
  - Pending = orange/yellow background
  - Submitted = green background
- [ ] Pending items have "Submit Assignment" button
- [ ] Submitted items have no button
- [ ] Empty state shows if no assignments

**Pass/Fail**: _____

---

### Test 4: Progress Tab
**Objective**: Verify progress visualization

**Steps**:
1. Click "📊 Progress" tab
2. Observe the progress display

**Expected Results**:
- [ ] Circular progress indicator displays (120px diameter)
- [ ] Percentage shown inside circle
- [ ] Circle fill matches progress percentage
- [ ] Stats grid shows 3 items:
  - Total Content (count)
  - Completed (count, green text)
  - Remaining (count, orange text)
- [ ] If course 100% complete:
  - Certificate section appears
  - Shows "🏆 Course Completed!" message
  - "Download Certificate" button visible
  - Button is clickable (shows alert: "Certificate download coming soon!")

**Pass/Fail**: _____

---

### Test 5: Tab Switching
**Objective**: Verify smooth tab navigation

**Steps**:
1. Click each tab in sequence
2. Switch between tabs multiple times
3. Observe tab styling and content

**Expected Results**:
- [ ] Active tab shows underline (teal color #1B9AAA)
- [ ] Inactive tabs show gray text
- [ ] Tab buttons are clickable
- [ ] Content changes without page reload
- [ ] Tab state persists (clicking same tab doesn't cause issues)
- [ ] Tab labels show accurate counts
- [ ] No flickering or loading delays between tabs

**Pass/Fail**: _____

---

### Test 6: Back Navigation
**Objective**: Verify back button functionality

**Steps**:
1. Click "← Back to My Courses" button

**Expected Results**:
- [ ] Navigates to `/student/courses` (My Courses page)
- [ ] Course details page unloads
- [ ] My Courses list loads with all enrolled courses

**Pass/Fail**: _____

---

### Test 7: Error Handling
**Objective**: Verify error states work correctly

**Steps**:
1. Close backend server while on course details page
2. Try to refresh page (F5)
3. Or navigate to invalid course_id: `/student/courses/99999`

**Expected Results**:
- [ ] Error message displays in red box
- [ ] Message is readable and informative
- [ ] Page doesn't crash
- [ ] No console JavaScript errors
- [ ] Error state shows without spinner

**Pass/Fail**: _____

---

### Test 8: Loading State
**Objective**: Verify loading indicator displays

**Steps**:
1. Navigate to course details page
2. Observe initial state (< 3 seconds)

**Expected Results**:
- [ ] Spinner displays (animated CSS circle)
- [ ] Text shows "Loading course content..."
- [ ] Spinner rotates smoothly
- [ ] Spinner disappears when data loads
- [ ] Page content appears after loading

**Pass/Fail**: _____

---

### Test 9: Styling & Colors
**Objective**: Verify EduVillage branding colors

**Steps**:
1. Open page and observe colors
2. Compare with color reference guide

**Expected Results**:
- [ ] Page background: #F4F7FA (light blue-grey)
- [ ] Course title: #142C52 (dark navy)
- [ ] Tab active color: #1B9AAA (teal)
- [ ] Progress bar: #1B9AAA (teal)
- [ ] Buttons: #1B9AAA (teal)
- [ ] Content type badges: proper colors
  - Video: red (#DC2626)
  - PDF: blue (#2563EB)
  - Assignment: orange (#D97706)
- [ ] Status colors:
  - Completed: green (#22C55E)
  - Pending: orange (#F59E0B)
- [ ] Error box: red (#DC2626)

**Pass/Fail**: _____

---

### Test 10: Responsive Design
**Objective**: Verify layout on different screen sizes

**Steps**:
1. Open browser DevTools (F12)
2. Test at different viewport widths:
   - Desktop: 1920px
   - Laptop: 1200px
   - Tablet: 768px
   - Mobile: 375px

**Expected Results** (Desktop/Laptop):
- [ ] Layout uses max-width: 1200px
- [ ] Centered on screen
- [ ] All elements visible
- [ ] No horizontal scrolling

**Expected Results** (Tablet):
- [ ] Padding adjusted
- [ ] Content still readable
- [ ] Table may need horizontal scroll
- [ ] No overlapping elements

**Expected Results** (Mobile):
- [ ] Note: Future enhancement (not in STEP 3)
- [ ] Current layout may require scroll

**Pass/Fail**: _____

---

## Browser Console Checks

### Check for Console Errors
Open DevTools (F12) and check Console tab:

```
Expected: ✓ No red error messages
Expected: ✓ No undefined variable warnings
Expected: ✓ No network error messages (unless intentional)

Look for:
  ❌ TypeError: Cannot read property 'X' of undefined
  ❌ Uncaught ReferenceError: X is not defined
  ❌ Failed to fetch data
```

### Check Network Requests
Open DevTools → Network tab, then load the page:

```
Expected API Calls (4):
  1. GET /api/courses/student/<id>/contents/  [Status: 200]
  2. GET /api/courses/student/<id>/progress/  [Status: 200]
  3. GET /api/courses/                         [Status: 200]
  (4. POST /api/courses/student/<id>/complete/ - when clicking Mark Done)

Check each response:
  ❌ 401: Unauthorized (token issue)
  ❌ 403: Forbidden (enrollment issue)
  ❌ 404: Not found (invalid course_id)
  ❌ 500: Server error
```

---

## Data Validation Tests

### Test: Correct Data Display
**Sample Course Data**:
```json
{
  "course_id": 1,
  "course_title": "Python Fundamentals",
  "contents": [
    {
      "id": 1,
      "title": "Intro Video",
      "content_type": "video",
      "created_at": "2026-02-01T10:00:00Z",
      "completed": true
    }
  ]
}
```

**Verify**:
- [ ] Title displays: "Python Fundamentals"
- [ ] Content count is accurate
- [ ] Icons match content_type
- [ ] Dates are formatted (Feb 01)
- [ ] Completion status shows correctly

**Pass/Fail**: _____

---

## Edge Case Tests

### Test: No Content
**Setup**: Course with 0 content items
**Expected**: "No content available yet" message
**Pass**: [ ] [ ]

### Test: No Assignments
**Setup**: Course with no assignment-type content
**Expected**: "No assignments in this course" message
**Pass**: [ ] [ ]

### Test: Course 100% Complete
**Setup**: All content completed
**Expected**: 
- [ ] Progress shows 100%
- [ ] Completion badge visible
- [ ] Certificate section visible
**Pass**: [ ] [ ]

### Test: Missing Description
**Setup**: Course without description
**Expected**: Description section not rendered
**Pass**: [ ] [ ]

### Test: Missing Instructor
**Setup**: Course without instructor assigned
**Expected**: "Instructor: N/A" displays
**Pass**: [ ] [ ]

---

## Integration Tests

### Test: E2E Student Course Journey
**Steps**:
1. Student logs in
2. Navigate to My Courses
3. Click on first enrolled course
4. View course details
5. Click Content tab
6. Mark one item as complete
7. Check progress updated
8. Click Assignments tab
9. View assignments
10. Click Progress tab
11. View progress stats
12. Click back button

**Expected**: All steps complete smoothly
**Pass**: [ ] [ ]

---

## Performance Tests

### Lighthouse Score
Run Lighthouse audit (F12 → Lighthouse):

```
Expected Scores:
  Performance:  > 80
  Accessibility: > 90
  Best Practices: > 90
  SEO: > 90

Notes:
  - May be lower if backend slow
  - CSS-in-JS (inline styles) affects performance slightly
  - Consider CSS modules for optimization (future enhancement)
```

### Load Time
Measure time to render:

```
Expected:
  API Response:  < 1000ms
  First Paint:   < 500ms
  Time to Interactive: < 3000ms
  Full Page Load: < 5000ms
```

---

## Known Limitations (STEP 3)

⚠️ **Not Implemented Yet**:
- File download/streaming
- Video player embedded
- PDF viewer
- Assignment submission upload
- Mobile responsiveness
- Offline access
- Discussion comments
- Real quiz grading
- Email notifications

✅ **Implemented**:
- Course details display
- Tab navigation
- Content listing
- Assignment tracking
- Progress visualization
- Mark content as complete
- Error handling
- Loading states
- Professional styling

---

## Deployment Checklist

Before deploying to production:

- [ ] Backend APIs are running
- [ ] Frontend builds without errors (`npm run build`)
- [ ] No console errors or warnings
- [ ] All API endpoints return correct data
- [ ] Authentication tokens work correctly
- [ ] Error messages are user-friendly
- [ ] Loading states display properly
- [ ] Page renders within 3-5 seconds
- [ ] Database has test data (courses with content)
- [ ] Environment variables configured correctly

---

## Support & Debugging

### Common Issues & Fixes

**Issue**: "Course not found" error
- **Cause**: Invalid course_id in URL
- **Fix**: Check URL, verify course exists in database
- **Debug**: Check Network tab → API response

**Issue**: Blank page with no error
- **Cause**: API timeout or network issue
- **Fix**: Check backend is running, verify API endpoints
- **Debug**: Check Network tab for failed requests

**Issue**: Instructor name shows "N/A"
- **Cause**: Course metadata API not returning data
- **Fix**: Verify course has instructor assigned
- **Debug**: Check `/api/courses/` endpoint response

**Issue**: Progress doesn't update after "Mark Done"
- **Cause**: API call failed or state not updating
- **Fix**: Refresh page, check console errors
- **Debug**: Check Network tab for POST request status

**Issue**: Tab content not showing
- **Cause**: Content type filtering issue
- **Fix**: Verify content_type values in database
- **Debug**: Check browser console for JavaScript errors

---

## Contact & Support

**For Issues**:
1. Check browser console (F12)
2. Verify backend is running
3. Check API response in Network tab
4. Review error messages displayed
5. Check database for test data

**Component Location**:
- Frontend: `frontend/src/pages/student/StudentCourseContent.jsx`
- Route: `/student/courses/:id`
- Version: 1.0 (STEP 3)

**Related Documentation**:
- [Implementation Summary](STEP3_STUDENT_COURSE_DETAILS_IMPLEMENTATION.md)
- [UI/UX Reference](STEP3_UI_UX_REFERENCE.md)
- Backend API Docs: `docs/api-notes.md`

---

*Last Updated: February 2, 2026*
*Component Status: ✅ Ready for Testing*
