import React from 'react';
import '../styles/student-progress-table.css';

/**
 * StudentProgressTable Component
 * 
 * Displays a read-only table of student progress for a course.
 * Teacher-only view showing all enrolled students and their completion status.
 * 
 * Props:
 * - students: Array of student progress objects
 * - loading: Boolean indicating if data is loading
 * - error: Error message if any
 * - onRetry: Function to retry loading
 */
const StudentProgressTable = ({ students = [], loading = false, error = null, onRetry = null }) => {
  if (loading) {
    return (
      <div className="progress-table-container">
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading student progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-table-container">
        <div className="table-error">
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
      <div className="progress-table-container">
        <div className="table-empty">
          <p>No students enrolled in this course yet.</p>
        </div>
      </div>
    );
  }

  /**
   * Get progress color based on percentage
   * Red (0-25%), Orange (25-50%), Cyan (50-75%), Teal (75-100%), Green (100%)
   */
  const getProgressColor = (percentage) => {
    if (percentage === 100) return '#22C55E'; // Green
    if (percentage >= 75) return '#1B9AAA'; // Teal
    if (percentage >= 50) return '#06B6D4'; // Cyan
    if (percentage >= 25) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  /**
   * Get progress status label
   */
  const getProgressStatus = (percentage, isCompleted) => {
    if (isCompleted) return 'Completed ✓';
    if (percentage >= 75) return 'On Track';
    if (percentage >= 50) return 'In Progress';
    if (percentage > 0) return 'Started';
    return 'Not Started';
  };

  return (
    <div className="progress-table-container">
      <div className="table-header-info">
        <p className="student-count">
          Showing <strong>{students.length}</strong> student{students.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="table-wrapper">
        <table className="progress-table">
          <thead>
            <tr className="table-head-row">
              <th className="col-student">Student</th>
              <th className="col-completed">Completed</th>
              <th className="col-progress">Progress</th>
              <th className="col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const percentage = student.progress_percentage || 0;
              const completed = student.completed_content || 0;
              const total = student.total_content || 0;
              const isCompleted = student.is_completed || false;
              const status = getProgressStatus(percentage, isCompleted);
              const progressColor = getProgressColor(percentage);

              return (
                <tr key={student.student_id} className="table-body-row">
                  {/* Student Name */}
                  <td className="col-student">
                    <div className="student-info">
                      <div className="student-avatar">
                        {student.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="student-details">
                        <p className="student-name">{student.student_name}</p>
                        <p className="student-username">@{student.student_username}</p>
                      </div>
                    </div>
                  </td>

                  {/* Completed Items */}
                  <td className="col-completed">
                    <span className="completed-count">
                      {completed}/{total}
                    </span>
                  </td>

                  {/* Progress Bar */}
                  <td className="col-progress">
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: progressColor,
                          }}
                        ></div>
                      </div>
                      <span className="progress-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="col-status">
                    <span
                      className={`status-badge status-${
                        isCompleted ? 'completed' : percentage >= 75 ? 'on-track' : 
                        percentage >= 50 ? 'in-progress' : percentage > 0 ? 'started' : 'not-started'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="progress-table-stats">
        <div className="stat-item">
          <span className="stat-label">Average Progress:</span>
          <span className="stat-value">
            {(
              students.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) /
              students.length
            ).toFixed(1)}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed:</span>
          <span className="stat-value">
            {students.filter((s) => s.is_completed).length}/{students.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentProgressTable;
