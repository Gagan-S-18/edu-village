# STEP 4: Assignment Submission - Testing Walkthrough

## Pre-Testing Checklist

Before testing, ensure:
- [ ] Django backend is running on `http://localhost:8000`
- [ ] React frontend is running on `http://localhost:3000`
- [ ] Database is set up and migrations applied
- [ ] You have test user credentials (student and teacher accounts)
- [ ] Database has at least one course with an assignment

---

## Backend Testing

### 1. Test Database Migration

**Steps:**
1. Open terminal in backend folder
2. Run: `python manage.py migrate`
3. Should complete without errors
4. Verify AssignmentSubmission table exists: `python manage.py dbshell` → `.tables` → exit

**Expected Result:** ✅ Migration completes successfully, no errors

---

### 2. Test Admin Panel

**Steps:**
1. Go to `http://localhost:8000/admin/`
2. Login with admin credentials
3. Look for "Assignment Submissions" in the Courses section
4. Click to view submissions list

**Expected Result:** ✅ AssignmentSubmission admin panel displays with:
- List view showing all submissions
- Filter options (Course, Date)
- Search functionality
- Ability to click and edit submissions

---

### 3. Test API Endpoints - No Authentication

**Using Postman or cURL:**

```bash
# Test 1: Submit without token (should fail)
curl -X POST http://localhost:8000/api/courses/student/assignments/1/submit/ \
  -F "file=@/path/to/file.pdf"

# Expected: 401 Unauthorized
```

**Expected Result:** ✅ Returns 401 Unauthorized with error message

---

### 4. Test API Endpoints - With Authentication

**Getting an access token first:**

```bash
# Get token (adjust credentials to match your test student)
curl -X POST http://localhost:8000/api/token/ \
  -d "username=teststudent&password=testpass123"

# Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Test 2: Submit assignment with valid token**

```bash
# Replace COURSE_ID and ASSIGNMENT_ID with real values from database
curl -X POST http://localhost:8000/api/courses/student/assignments/1/submit/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/assignment.pdf"

# Expected: 201 Created
{
  "success": "Assignment submitted successfully",
  "submission": {
    "id": 1,
    "student": <student_id>,
    "assignment": 1,
    "course": <course_id>,
    "file": "/media/submissions/2026/02/02/assignment.pdf",
    "submitted_at": "2026-02-02T10:30:00Z",
    "updated_at": "2026-02-02T10:30:00Z"
  }
}
```

**Expected Result:** ✅ Returns 201 Created with submission details

---

### 5. Test Get Submission Status

```bash
# Test 3: Check submission status (should return true after submission)
curl -X GET http://localhost:8000/api/courses/student/assignments/1/submission/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected: 200 OK
{
  "submitted": true,
  "submission": {
    "id": 1,
    "student": <student_id>,
    ...
  }
}
```

**Expected Result:** ✅ Returns 200 OK with submitted=true and submission details

---

### 6. Test Permission - Enrolled vs Not Enrolled

**Setup:** Create two students, enroll only one in test course

**Test 4: Submit as enrolled student**
- Should succeed with 201 Created

**Test 5: Submit as non-enrolled student**
- Should fail with 403 Forbidden

**Expected Result:** ✅ Both tests behave as expected

---

### 7. Test Permission - Teacher Cannot Submit

**Setup:** Ensure you have a teacher account

```bash
# Get teacher token
curl -X POST http://localhost:8000/api/token/ \
  -d "username=testteacher&password=testpass123"

# Try to submit
curl -X POST http://localhost:8000/api/courses/student/assignments/1/submit/ \
  -H "Authorization: Bearer TEACHER_TOKEN" \
  -F "file=@assignment.pdf"

# Expected: 403 Forbidden
```

**Expected Result:** ✅ Returns 403 Forbidden

---

### 8. Test Resubmission

```bash
# Submit first file
curl -X POST http://localhost:8000/api/courses/student/assignments/1/submit/ \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -F "file=@assignment_v1.pdf"
# Get submission ID from response

# Submit second file (resubmit)
curl -X POST http://localhost:8000/api/courses/student/assignments/1/submit/ \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -F "file=@assignment_v2.pdf"
# Get submission ID from response

# Compare IDs - should be same
```

**Expected Result:** ✅ Both submissions have same ID, updated_at is newer

---

### 9. Test File Validation

```bash
# Test 6: Submit without file
curl -X POST http://localhost:8000/api/courses/student/assignments/1/submit/ \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Expected: 400 Bad Request
{
  "error": "File is required"
}
```

**Expected Result:** ✅ Returns 400 Bad Request with error message

---

### 10. Test Invalid Assignment

```bash
# Test 7: Submit to non-existent assignment
curl -X GET http://localhost:8000/api/courses/student/assignments/99999/submission/ \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Expected: 404 Not Found
```

**Expected Result:** ✅ Returns 404 Not Found

---

### 11. Run Unit Tests

```bash
# Run all tests
python manage.py test apps.courses.tests.AssignmentSubmissionTests -v 2

# Expected output:
# test_get_assignment_submission_status ... ok
# test_resubmit_assignment ... ok
# test_submit_assignment_with_file ... ok
# test_submit_invalid_assignment ... ok
# test_submit_without_authentication ... ok
# test_submit_without_enrollment ... ok
# test_submit_without_file ... ok
# test_teacher_cannot_submit ... ok
```

**Expected Result:** ✅ All tests pass (8+ tests)

---

## Frontend Testing

### 1. Test Modal Component Loads

**Steps:**
1. Login to frontend as a student
2. Go to My Courses
3. Select a course with assignments
4. Click "Assignments" tab
5. Look for assignments list

**Expected Result:** ✅ See assignment cards with "Submit Assignment" buttons

---

### 2. Test Modal Opens

**Steps:**
1. Click "Submit Assignment" button on an assignment

**Expected Result:** ✅ Modal overlay appears with:
- Title "Submit Assignment"
- File picker area
- "Choose File" button
- Close button (X)
- Semi-transparent overlay background

---

### 3. Test File Selection

**Steps:**
1. Click file picker in modal
2. Select a PDF file from your computer
3. Modal should show selected file name

**Expected Result:** ✅ Modal shows:
- Selected filename
- File size (if displayed)
- "Submit Assignment" button (clickable)

---

### 4. Test Successful Submission

**Steps:**
1. Select a file
2. Click "Submit Assignment" button in modal
3. Wait for upload to complete

**Expected Result:** ✅ 
- Loading state appears during upload
- Success message displays
- Modal closes automatically
- Back to assignments list
- Assignment card shows green "Submitted: [date]" text
- Button changes to "Update Submission"

---

### 5. Test Error Handling

**Steps:**
1. Try to submit very large file (>5MB)
2. Or close internet connection and try to submit

**Expected Result:** ✅
- Error message appears in modal
- File input still enabled for retry
- Can select different file and retry

---

### 6. Test Resubmission Flow

**Steps:**
1. Click "Update Submission" button on previously submitted assignment
2. Modal opens again
3. Shows existing submission date
4. Select new file
5. Click "Submit Assignment"

**Expected Result:** ✅
- Modal shows "Submitted on [date]"
- Button text is "Update Submission"
- New file replaces old one
- Success message shows
- Submission date updates
- Can repeat multiple times

---

### 7. Test Modal Close

**Steps:**
1. Open modal
2. Try three ways to close:
   - Click X button
   - Click outside modal overlay
   - Press Escape key (if implemented)

**Expected Result:** ✅ Modal closes in all cases

---

### 8. Test Multiple Assignments

**Steps:**
1. Go to assignments tab
2. Submit assignment 1
3. Submit assignment 2
4. Submit assignment 3
5. Verify each shows individual submission status

**Expected Result:** ✅ Each assignment shows:
- Independent submission status
- Correct submission dates
- Correct button states

---

### 9. Test UI Styling (EduVillage Branding)

**Steps:**
1. Open modal
2. Check colors and styling

**Expected Visual Elements:**
- ✅ Teal buttons (#1B9AAA)
- ✅ Navy text (#142C52)
- ✅ Green success message (#22C55E)
- ✅ Red error message (#DC2626)
- ✅ Professional spacing and layout
- ✅ Responsive design on mobile

---

### 10. Test Responsive Design

**Steps:**
1. Open developer tools (F12)
2. Toggle device toolbar
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1200px)

**Expected Result:** ✅
- Modal centers on all screens
- Text readable
- Buttons clickable
- No overflow
- Touch-friendly on mobile

---

## End-to-End Testing

### Complete User Journey

**Setup:**
- Student account logged in
- Course with assignment available
- Student not yet submitted

**Steps:**
1. Navigate to course → Assignments tab
2. See assignment with "Submit Assignment" button
3. Click button → Modal opens
4. Drag & drop PDF file into modal
5. Click "Submit Assignment" button
6. See loading state
7. See success message
8. Modal closes
9. Back on assignments tab
10. See submission date and "Update Submission" button
11. Click "Update Submission"
12. Modal opens showing previous submission date
13. Select different file
14. Click "Submit Assignment"
15. See success
16. See updated submission date

**Expected Result:** ✅ All steps complete successfully with proper UI feedback

---

## Performance Testing

### Test Under Load

```bash
# Create multiple submissions quickly
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/courses/student/assignments/1/submit/ \
    -H "Authorization: Bearer TOKEN" \
    -F "file=@test_$i.pdf" &
done
wait
```

**Expected Result:** ✅ All submissions succeed without errors or timeouts

### Test Large Files

**Steps:**
1. Create 10MB PDF file
2. Try to submit

**Expected Result:** ✅ Either:
- Uploads successfully (if limit allows), or
- Shows clear error message about file size

---

## Database Testing

### Verify Data Storage

**Steps:**
1. Submit multiple assignments
2. Open Django shell: `python manage.py shell`

```python
from apps.courses.models import AssignmentSubmission
from django.contrib.auth.models import User

# Check submissions created
submissions = AssignmentSubmission.objects.all()
print(f"Total submissions: {submissions.count()}")

# Check specific student
student = User.objects.get(username='teststudent')
student_submissions = AssignmentSubmission.objects.filter(student=student)
print(f"Student submissions: {student_submissions.count()}")

# Check file storage
for sub in submissions:
    print(f"File: {sub.file.path}")
    print(f"File exists: {sub.file.storage.exists(sub.file.name)}")
    print(f"Submitted: {sub.submitted_at}")
```

**Expected Result:** ✅
- Correct number of submissions
- Files stored in `/media/submissions/YYYY/MM/DD/` structure
- Timestamps correct
- All data persisted correctly

---

## Security Testing

### Test Access Control

**Scenario 1: Anonymous User**
- Try to access API without token
- Expected: 401 Unauthorized ✅

**Scenario 2: Non-Student User (Teacher)**
- Login as teacher
- Try to submit assignment
- Expected: 403 Forbidden ✅

**Scenario 3: Student Not Enrolled**
- Login as student
- Try to submit in course not enrolled in
- Expected: 403 Forbidden ✅

**Scenario 4: Valid Student**
- Login as student
- Submit in enrolled course
- Expected: 201 Created ✅

---

## Regression Testing

After completing tests, verify that:
- [ ] Existing student dashboard still works
- [ ] Course content tab still works
- [ ] Progress tracking still works
- [ ] Other courses unaffected
- [ ] Login/logout still works
- [ ] Other student features work
- [ ] Teacher admin features work
- [ ] No console errors in browser

---

## Test Report Template

```
TEST EXECUTION REPORT
=====================
Date: __________
Tester: __________
Version: __________

Backend Tests:
- Migration: [ ] PASS [ ] FAIL [ ] SKIP
- Admin Panel: [ ] PASS [ ] FAIL [ ] SKIP
- API Auth: [ ] PASS [ ] FAIL [ ] SKIP
- API Submit: [ ] PASS [ ] FAIL [ ] SKIP
- API Status: [ ] PASS [ ] FAIL [ ] SKIP
- Permissions: [ ] PASS [ ] FAIL [ ] SKIP
- Resubmit: [ ] PASS [ ] FAIL [ ] SKIP
- Validation: [ ] PASS [ ] FAIL [ ] SKIP
- Unit Tests: [ ] PASS [ ] FAIL [ ] SKIP

Frontend Tests:
- Modal Loads: [ ] PASS [ ] FAIL [ ] SKIP
- File Select: [ ] PASS [ ] FAIL [ ] SKIP
- Submit Flow: [ ] PASS [ ] FAIL [ ] SKIP
- Status Display: [ ] PASS [ ] FAIL [ ] SKIP
- Error Handle: [ ] PASS [ ] FAIL [ ] SKIP
- Resubmit Flow: [ ] PASS [ ] FAIL [ ] SKIP
- Modal Close: [ ] PASS [ ] FAIL [ ] SKIP
- Styling: [ ] PASS [ ] FAIL [ ] SKIP
- Responsive: [ ] PASS [ ] FAIL [ ] SKIP

E2E Tests:
- User Journey: [ ] PASS [ ] FAIL [ ] SKIP

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Result:
[ ] PASSED
[ ] PASSED WITH ISSUES
[ ] FAILED

Sign-off: _____________ Date: _______
```

---

## Debugging Tips

### If Tests Fail

1. **Check Django Logs**
   - Look for error messages in console
   - Check for 500 errors

2. **Check Frontend Console**
   - F12 → Console tab
   - Look for JavaScript errors
   - Check network tab for API responses

3. **Check Database**
   - Verify AssignmentSubmission table exists
   - Check file storage directory
   - Verify permissions on media folder

4. **Check Permissions**
   - Verify user is authenticated
   - Verify user has student role
   - Verify user is enrolled in course

5. **Common Issues**
   - Token expired → Get new token
   - Media folder permissions → `chmod 755 media/`
   - Database not migrated → Run `python manage.py migrate`
   - Frontend not refreshed → Hard refresh (Ctrl+F5)

---

## Sign-Off

All tests in this walkthrough should be completed before marking STEP 4 as finished.

**Test Status: ☐ ALL PASSED**

Date Completed: __________
Tester Name: __________
