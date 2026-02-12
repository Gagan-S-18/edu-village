import React, { useState, useEffect } from "react";
import "../../styles/teacher-approval.css";

/**
 * TeacherApproval Component
 * Admin interface to view and approve/reject pending teacher registrations
 */
function TeacherApproval() {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionInProgress, setActionInProgress] = useState(null);

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://edu-village-6j7f.onrender.com//api/users/admin/teachers/pending/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending teachers");
      }

      const data = await response.json();
      setPendingTeachers(data);
    } catch (err) {
      console.error("Error fetching pending teachers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId) => {
    setActionInProgress(teacherId);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        `https://edu-village-6j7f.onrender.com//api/users/admin/teachers/${teacherId}/approve/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve teacher");
      }

      setSuccess("✓ Teacher approved successfully!");
      setPendingTeachers(pendingTeachers.filter(t => t.id !== teacherId));
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error approving teacher:", err);
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (teacherId) => {
    if (!window.confirm("Are you sure you want to reject this teacher? They will not be able to login.")) {
      return;
    }

    setActionInProgress(teacherId);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        `https://edu-village-6j7f.onrender.com//api/users/admin/teachers/${teacherId}/reject/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject teacher");
      }

      setSuccess("✓ Teacher rejected successfully!");
      setPendingTeachers(pendingTeachers.filter(t => t.id !== teacherId));
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error rejecting teacher:", err);
      setError(err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="teacher-approval-section">
        <h2 className="section-title">👨‍🏫 Pending Teacher Approvals</h2>
        <div className="loading-message">Loading pending teachers...</div>
      </div>
    );
  }

  return (
    <div className="teacher-approval-section">
      <h2 className="section-title">👨‍🏫 Pending Teacher Approvals</h2>

      {/* Error message */}
      {error && <div className="approval-error-message">{error}</div>}

      {/* Success message */}
      {success && <div className="approval-success-message">{success}</div>}

      {/* No pending teachers */}
      {pendingTeachers.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">✓</p>
          <p className="empty-text">All caught up! No pending teacher approvals.</p>
        </div>
      ) : (
        /* Teachers list */
        <div className="teachers-container">
          <p className="pending-count">
            {pendingTeachers.length} teacher{pendingTeachers.length !== 1 ? 's' : ''} waiting for approval
          </p>

          <div className="teachers-table-wrapper">
            <table className="teachers-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Qualification</th>
                  <th>Subject</th>
                  <th>Experience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTeachers.map(teacher => (
                  <tr key={teacher.id} className="teacher-row">
                    <td className="cell-name">
                      <strong>{teacher.username}</strong>
                    </td>
                    <td className="cell-email">{teacher.email}</td>
                    <td className="cell-qualification">{teacher.qualification}</td>
                    <td className="cell-subject">{teacher.subject}</td>
                    <td className="cell-experience">{teacher.experience} years</td>
                    <td className="cell-actions">
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleApprove(teacher.id)}
                        disabled={actionInProgress === teacher.id}
                        title="Approve teacher"
                        style={{
                          opacity: actionInProgress === teacher.id ? 0.6 : 1,
                          cursor: actionInProgress === teacher.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {actionInProgress === teacher.id ? '⏳ Processing...' : '✓ Approve'}
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleReject(teacher.id)}
                        disabled={actionInProgress === teacher.id}
                        title="Reject teacher"
                        style={{
                          opacity: actionInProgress === teacher.id ? 0.6 : 1,
                          cursor: actionInProgress === teacher.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {actionInProgress === teacher.id ? '⏳ Processing...' : '✕ Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherApproval;
