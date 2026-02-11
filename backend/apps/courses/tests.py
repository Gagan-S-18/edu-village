from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Course, CourseContent, Enrollment, AssignmentSubmission
from apps.users.models import UserProfile
import json 

class AssignmentSubmissionTests(APITestCase):
    """
    Tests for Assignment Submission functionality (STEP 4)
    
    Test Coverage:
    - AssignmentSubmission model creation
    - POST endpoint: submit_assignment with file upload
    - GET endpoint: get_assignment_submission (check status)
    - Permission checks (authenticated, student role)
    - Enrollment verification
    - Resubmission handling
    """

    def setUp(self):
        """Set up test data for assignment submission tests"""
        # Create users
        self.student_user = User.objects.create_user(
            username='teststudent',
            email='student@test.com',
            password='testpass123'
        )
        self.student_profile = UserProfile.objects.create(
            user=self.student_user,
            role='student'
        )

        self.teacher_user = User.objects.create_user(
            username='testteacher',
            email='teacher@test.com',
            password='testpass123'
        )
        self.teacher_profile = UserProfile.objects.create(
            user=self.teacher_user,
            role='teacher'
        )

        # Create course
        self.course = Course.objects.create(
            title='Test Course',
            description='Test course for assignments',
            instructor=self.teacher_user
        )

        # Create assignment content
        self.assignment = CourseContent.objects.create(
            course=self.course,
            title='Assignment 1',
            content_type='assignment',
            created_by=self.teacher_user
        )

        # Create enrollment
        self.enrollment = Enrollment.objects.create(
            student=self.student_user,
            course=self.course,
            status='active'
        )

        self.client = APIClient()

    def test_submit_assignment_with_file(self):
        """Test submitting an assignment with a file"""
        self.client.force_authenticate(user=self.student_user)
        
        # Create a test file
        test_file = SimpleUploadedFile(
            "assignment_submission.pdf",
            b"file_content",
            content_type="application/pdf"
        )

        url = f'/api/courses/student/assignments/{self.assignment.id}/submit/'
        response = self.client.post(
            url,
            {'file': test_file},
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('submission', response.data)
        self.assertEqual(response.data['submission']['student'], self.student_user.id)
        self.assertEqual(response.data['submission']['assignment'], self.assignment.id)

    def test_get_assignment_submission_status(self):
        """Test checking submission status for an assignment"""
        self.client.force_authenticate(user=self.student_user)

        # First check before submission
        url = f'/api/courses/student/assignments/{self.assignment.id}/submission/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['submitted'])

        # Create submission
        test_file = SimpleUploadedFile(
            "assignment_submission.pdf",
            b"file_content",
            content_type="application/pdf"
        )
        submit_url = f'/api/courses/student/assignments/{self.assignment.id}/submit/'
        self.client.post(submit_url, {'file': test_file}, format='multipart')

        # Now check after submission
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['submitted'])
        self.assertIn('submission', response.data)
        self.assertIn('submitted_at', response.data['submission'])

    def test_resubmit_assignment(self):
        """Test resubmitting an assignment (updating existing submission)"""
        self.client.force_authenticate(user=self.student_user)

        # First submission
        test_file_1 = SimpleUploadedFile(
            "assignment_v1.pdf",
            b"file_content_v1",
            content_type="application/pdf"
        )
        url = f'/api/courses/student/assignments/{self.assignment.id}/submit/'
        response_1 = self.client.post(url, {'file': test_file_1}, format='multipart')
        submission_1_id = response_1.data['submission']['id']

        # Second submission (resubmit)
        test_file_2 = SimpleUploadedFile(
            "assignment_v2.pdf",
            b"file_content_v2",
            content_type="application/pdf"
        )
        response_2 = self.client.post(url, {'file': test_file_2}, format='multipart')
        submission_2_id = response_2.data['submission']['id']

        # Should be same submission (resubmission, not new one)
        self.assertEqual(submission_1_id, submission_2_id)

        # Should have updated_at changed
        self.assertGreaterEqual(
            response_2.data['submission']['updated_at'],
            response_1.data['submission']['updated_at']
        )

    def test_submit_without_authentication(self):
        """Test that unauthenticated users cannot submit"""
        test_file = SimpleUploadedFile(
            "assignment_submission.pdf",
            b"file_content",
            content_type="application/pdf"
        )

        url = f'/api/courses/student/assignments/{self.assignment.id}/submit/'
        response = self.client.post(url, {'file': test_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_submit_without_enrollment(self):
        """Test that non-enrolled students cannot submit"""
        # Create another student not enrolled in the course
        other_student = User.objects.create_user(
            username='otherstudent',
            email='other@test.com',
            password='testpass123'
        )
        UserProfile.objects.create(user=other_student, role='student')

        self.client.force_authenticate(user=other_student)
        
        test_file = SimpleUploadedFile(
            "assignment_submission.pdf",
            b"file_content",
            content_type="application/pdf"
        )

        url = f'/api/courses/student/assignments/{self.assignment.id}/submit/'
        response = self.client.post(url, {'file': test_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_submit(self):
        """Test that teachers cannot submit assignments"""
        self.client.force_authenticate(user=self.teacher_user)
        
        test_file = SimpleUploadedFile(
            "assignment_submission.pdf",
            b"file_content",
            content_type="application/pdf"
        )

        url = f'/api/courses/student/assignments/{self.assignment.id}/submit/'
        response = self.client.post(url, {'file': test_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_submit_invalid_assignment(self):
        """Test submitting to non-existent assignment"""
        self.client.force_authenticate(user=self.student_user)
        
        test_file = SimpleUploadedFile(
            "assignment_submission.pdf",
            b"file_content",
            content_type="application/pdf"
        )

        url = '/api/courses/student/assignments/99999/submit/'
        response = self.client.post(url, {'file': test_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_submit_without_file(self):
        """Test submitting without a file"""
        self.client.force_authenticate(user=self.student_user)

        url = f'/api/courses/student/assignments/{self.assignment.id}/submit/'
        response = self.client.post(url, {}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AssignmentSubmissionModelTests(TestCase):
    """Tests for AssignmentSubmission model"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            title='Test Course',
            instructor=self.user
        )
        self.assignment = CourseContent.objects.create(
            course=self.course,
            title='Test Assignment',
            content_type='assignment',
            created_by=self.user
        )

    def test_create_assignment_submission(self):
        """Test creating an assignment submission"""
        test_file = SimpleUploadedFile(
            "test_submission.pdf",
            b"test content",
            content_type="application/pdf"
        )
        submission = AssignmentSubmission.objects.create(
            student=self.user,
            assignment=self.assignment,
            course=self.course,
            file=test_file
        )

        self.assertEqual(submission.student, self.user)
        self.assertEqual(submission.assignment, self.assignment)
        self.assertIsNotNone(submission.submitted_at)
        self.assertIsNotNone(submission.updated_at)

    def test_unique_submission_per_student_assignment(self):
        """Test that student can only have one submission per assignment"""
        test_file_1 = SimpleUploadedFile(
            "submission_1.pdf",
            b"content 1",
            content_type="application/pdf"
        )
        submission_1 = AssignmentSubmission.objects.create(
            student=self.user,
            assignment=self.assignment,
            course=self.course,
            file=test_file_1
        )

        # Try to create another submission for same student/assignment
        test_file_2 = SimpleUploadedFile(
            "submission_2.pdf",
            b"content 2",
            content_type="application/pdf"
        )
        
        # This should raise IntegrityError due to unique_together constraint
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            AssignmentSubmission.objects.create(
                student=self.user,
                assignment=self.assignment,
                course=self.course,
                file=test_file_2
            )
