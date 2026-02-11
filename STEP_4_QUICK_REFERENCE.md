# STEP 4: Assignment Submission - Quick Reference Guide

## For Students

### Submitting an Assignment

1. **Navigate to Course**
   - Go to My Courses → Select a course
   - Click "📝 Assignments" tab

2. **Submit Assignment**
   - Find the assignment you want to submit
   - Click "Submit Assignment" button

3. **Upload File**
   - In the modal, click the file picker or drag & drop your file
   - Supported formats: PDF, DOC, DOCX, TXT, ZIP
   - Click "Submit Assignment" button in modal

4. **Confirmation**
   - You'll see a success message
   - Submission date appears below assignment name (green text)
   - Button changes to "Update Submission"

### Resubmitting an Assignment

1. Click "Update Submission" button on the assignment
2. Select a new file
3. Click "Submit Assignment" in modal
4. Your previous submission will be replaced
5. Updated submission date will be shown

### Check Submission Status

- Green text "Submitted: [date]" = You've submitted this assignment
- "Submit Assignment" button = Not yet submitted
- "Update Submission" button = Already submitted (can resubmit)

---

## For Developers

### Backend API Endpoints

#### Submit Assignment
```
POST /api/courses/student/assignments/<assignment_id>/submit/
Content-Type: multipart/form-data
Authorization: Bearer <access_token>

Body:
{
  "file": <binary_file_data>
}

Response (201 Created):
{
  "success": "Assignment submitted successfully",
  "submission": {
    "id": 1,
    "student": 1,
    "assignment": 5,
    "course": 2,
    "file": "/media/submissions/2026/02/02/file.pdf",
    "submitted_at": "2026-02-02T10:30:00Z",
    "updated_at": "2026-02-02T10:30:00Z"
  }
}
```

#### Check Submission Status
```
GET /api/courses/student/assignments/<assignment_id>/submission/
Authorization: Bearer <access_token>

Response (200 OK):
{
  "submitted": true,
  "submission": {
    "id": 1,
    "student": 1,
    "assignment": 5,
    "course": 2,
    "file": "/media/submissions/2026/02/02/file.pdf",
    "submitted_at": "2026-02-02T10:30:00Z",
    "updated_at": "2026-02-02T10:30:00Z"
  }
}

OR

{
  "submitted": false,
  "submission": null
}
```

### Database Model

```python
from apps.courses.models import AssignmentSubmission

# Create submission (automatically via API)
submission = AssignmentSubmission.objects.create(
    student=user,
    assignment=assignment,
    course=course,
    file=uploaded_file
)

# Get student's submission for an assignment
submission = AssignmentSubmission.objects.get(
    student=user,
    assignment=assignment
)

# Get all submissions for an assignment
submissions = AssignmentSubmission.objects.filter(
    assignment=assignment
).order_by('-submitted_at')

# Get student's all submissions
submissions = AssignmentSubmission.objects.filter(
    student=user
).order_by('-submitted_at')
```

### Frontend Component

```javascript
import AssignmentSubmissionModal from '../../components/AssignmentSubmissionModal';

// In your component:
const [showModal, setShowModal] = useState(false);
const [selectedAssignment, setSelectedAssignment] = useState(null);

// Open modal
const handleOpenModal = (assignment) => {
  setSelectedAssignment(assignment);
  setShowModal(true);
};

// Handle successful submission
const handleSuccess = (response) => {
  console.log('Submission successful:', response.submission);
  // Update your UI
};

// In render:
{showModal && (
  <AssignmentSubmissionModal
    assignment={selectedAssignment}
    courseId={courseId}
    onClose={() => {
      setShowModal(false);
      setSelectedAssignment(null);
    }}
    onSubmitSuccess={handleSuccess}
  />
)}
```

### Admin Interface

1. Go to Django admin: `http://localhost:8000/admin/`
2. Navigate to "Courses" → "Assignment Submissions"
3. View all submissions by student, course, and date
4. Filter and search:
   - Filter by Course
   - Filter by Submission Date
   - Search by Student Username
   - Search by Assignment Title
5. View submission details (student, assignment, file, dates)
6. Download submitted files from the file field

### Running Tests

```bash
# Run all assignment submission tests
python manage.py test apps.courses.tests.AssignmentSubmissionTests

# Run specific test
python manage.py test apps.courses.tests.AssignmentSubmissionTests.test_submit_assignment_with_file

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test apps.courses.tests
coverage report
coverage html

# View coverage report
open htmlcov/index.html
```

---

## Configuration

### File Upload Settings (in settings.py)

```python
# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File upload handlers
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Allowed file types (if implementing validation)
ALLOWED_FILE_TYPES = ['pdf', 'doc', 'docx', 'txt', 'zip']
```

### CORS Settings (for frontend to access API)

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "401 Unauthorized" | Ensure access token is included in Authorization header |
| "403 Forbidden" | Check that user is enrolled in course and is a student |
| "404 Not Found" | Verify assignment ID is correct |
| "400 Bad Request" | Ensure file is included in multipart request body |
| Modal won't open | Check that showSubmissionModal state is true |
| File upload fails | Check file size and format restrictions |
| Duplicate submissions | Ensure using get_or_create (updates existing submission) |

---

## Performance Notes

- Submissions are stored with date-based paths: `/submissions/YYYY/MM/DD/`
- Unique constraint on (student, assignment) prevents duplicates
- Indexes on submitted_at and course_id for efficient queries
- Consider pagination for large submission lists

---

## Security Checklist

- ✅ Authentication required (IsAuthenticated)
- ✅ Role verification (IsStudent)
- ✅ Enrollment verification
- ✅ File validation
- ✅ Unique constraint prevents overwrites via API
- ✅ Read-only fields prevent ID forgery
- ✅ CSRF protection enabled
- ✅ File stored outside web root

---

## Code Examples

### Frontend: Custom Hook for Submissions

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAssignmentSubmissions = (courseId) => {
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubmissions = async (assignmentIds) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const submissionData = {};

      for (const id of assignmentIds) {
        const response = await axios.get(
          `/api/courses/student/assignments/${id}/submission/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.submitted) {
          submissionData[id] = response.data.submission;
        }
      }

      setSubmissions(submissionData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { submissions, loading, error, fetchSubmissions };
};

// Usage:
const { submissions, fetchSubmissions } = useAssignmentSubmissions(courseId);
await fetchSubmissions(assignmentIds);
```

### Backend: Query Recent Submissions

```python
from django.utils import timezone
from datetime import timedelta
from apps.courses.models import AssignmentSubmission

# Get submissions from last 7 days
recent = AssignmentSubmission.objects.filter(
    submitted_at__gte=timezone.now() - timedelta(days=7)
).order_by('-submitted_at')

# Get submissions per course
course_submissions = AssignmentSubmission.objects.filter(
    course_id=course_id
).values('student__username').annotate(
    count=Count('id')
).order_by('-count')

# Get ungraded submissions (if grading added)
ungraded = AssignmentSubmission.objects.filter(
    grade__isnull=True
).order_by('submitted_at')
```

---

## Related Documentation

- [Full Implementation Summary](./STEP_4_ASSIGNMENT_SUBMISSION_COMPLETE.md)
- [STEP 3: Student Course Details](./README_REDESIGN.md)
- [Architecture Overview](./ARCHITECTURE_DIAGRAM.md)
- [API Documentation](./docs/api-notes.md)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test cases for expected behavior
3. Check Django server logs for error details
4. Verify database migration was applied: `python manage.py showmigrations`
