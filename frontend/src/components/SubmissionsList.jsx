import React, { useState } from 'react';
import '../styles/submissions-list.css';

/**
 * SubmissionsList Component
 * 
 * Displays a read-only list of student assignment submissions for a course.
 * Shows all students and their submission status for each assignment.
 * 
 * Props:
 * - students: Array of student submission objects
 * - totalAssignments: Number of total assignments in the course
 * - loading: Boolean indicating if data is loading
 * - error: Error message if any
 * - onRetry: Function to retry loading
 * - onDownload: Function called with submission object when download is clicked
 */
const SubmissionsList = ({
  students = [],
  totalAssignments = 0,
  loading = false,
  error = null,
  onRetry = null,
  onDownload = null,
}) => {
  const [expandedStudents, setExpandedStudents] = useState({});

  if (loading) {
    return (
      <div className="submissions-container">
        <div className="submissions-loading">
          <div className="spinner"></div>
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submissions-container">
        <div className="submissions-error">
          <p className="error-message">⚠️ {error}</p>
          {onRetry && (
            <button className="retry-button" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="submissions-container">
        <div className="submissions-empty">
          <p>No enrolled students in this course.</p>
        </div>
      </div>
    );
  }

  /**
   * Toggle student submission details
   */
  const toggleStudent = (studentId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  /**
   * Format date to readable format
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get submission status (submitted or not submitted)
   */
  const getSubmissionStatus = (submissions, assignmentTitle) => {
    const submission = submissions.find((s) => s.assignment_title === assignmentTitle);
    return submission ? { submitted: true, submission } : { submitted: false };
  };

  /**
   * Get all unique assignment titles from all students
   */
  const getAllAssignments = () => {
    const assignmentSet = new Set();
    students.forEach((student) => {
      student.submissions.forEach((submission) => {
        assignmentSet.add(submission.assignment_title);
      });
    });
    return Array.from(assignmentSet);
  };

  const assignments = getAllAssignments();

  return (
    <div className="submissions-container">
      <div className="submissions-header">
        <div className="header-stats">
          <p className="stat">
            <strong>{students.length}</strong> Student{students.length !== 1 ? 's' : ''}
          </p>
          <p className="stat">
            <strong>{totalAssignments}</strong> Assignment{totalAssignments !== 1 ? 's' : ''}
          </p>
          <p className="stat">
            <strong>{assignments.length}</strong> Submitted by at least one student
          </p>
        </div>
      </div>

      {assignments.length > 0 && (
        <div className="submissions-grid">
          <div className="grid-header">
            <p className="grid-title">📋 Submissions Overview</p>
            <p className="grid-hint">Click on a student to view their submissions</p>
          </div>

          <div className="students-list">
            {students.map((student) => {
              const isExpanded = expandedStudents[student.student_id];
              const hasSubmissions = student.submissions.length > 0;

              return (
                <div key={student.student_id} className="student-submission-card">
                  {/* Student Header - Clickable */}
                  <div
                    className={`student-submission-header ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleStudent(student.student_id)}
                    role="button"
                    tabIndex="0"
                  >
                    <div className="student-header-left">
                      <div className="expand-icon">{isExpanded ? '▼' : '▶'}</div>
                      <div className="student-avatar">
                        {student.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="student-info-submission">
                        <p className="student-name">{student.student_name}</p>
                        <p className="student-username">@{student.student_username}</p>
                      </div>
                    </div>
                    <div className="student-submission-count">
                      <span className={`submission-badge ${hasSubmissions ? 'has-submissions' : 'no-submissions'}`}>
                        {hasSubmissions ? `${student.submissions.length} submission${student.submissions.length !== 1 ? 's' : ''}` : 'No submissions'}
                      </span>
                    </div>
                  </div>

                  {/* Student Submissions - Expandable */}
                  {isExpanded && (
                    <div className="student-submissions-details">
                      {hasSubmissions ? (
                        <div className="submissions-table">
                          <div className="submissions-table-header">
                            <div className="col-assignment">Assignment</div>
                            <div className="col-submitted">Submitted</div>
                            <div className="col-file">File</div>
                            <div className="col-action">Action</div>
                          </div>

                          {student.submissions.map((submission) => (
                            <div key={submission.submission_id} className="submissions-table-row">
                              <div className="col-assignment">
                                <p className="assignment-title">{submission.assignment_title}</p>
                              </div>
                              <div className="col-submitted">
                                <p className="submission-date">{formatDate(submission.submitted_at)}</p>
                                {submission.updated_at !== submission.submitted_at && (
                                  <p className="submission-updated">
                                    Updated: {formatDate(submission.updated_at)}
                                  </p>
                                )}
                              </div>
                              <div className="col-file">
                                <p className="file-name">📄 {submission.file_name || 'Unknown'}</p>
                              </div>
                              <div className="col-action">
                                {submission.file_url && onDownload && (
                                  <button
                                    className="download-button"
                                    onClick={() => onDownload(submission)}
                                    title="Download submission"
                                  >
                                    ⬇️ Download
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-submissions-message">
                          <p>No submissions from this student yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="submissions-empty">
          <p>No submissions yet. Students will appear here once they submit assignments.</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
