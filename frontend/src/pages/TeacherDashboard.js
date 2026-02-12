import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard-content.css";

/**
 * TeacherDashboard Component
 * Renders the main dashboard content for teachers
 * 
 * Note: This component is wrapped by DashboardLayout in App.js
 * The layout handles navbar, sidebar, and page structure
 */
function TeacherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeAssignments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  const fetchTeacherStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access");
      if (!token) {
        setError("Authentication failed. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch("https://edu-village-6j7f.onrender.com/api/dashboard/teacher/stats/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("dashboard stats", data)
      setStats({
        totalCourses: data.total_courses ?? 0,
        totalStudents: data.total_students ?? 0,
        activeAssignments: data.active_assignments ?? 0,
      });
    } catch (err) {
      console.error("Error fetching teacher stats:", err);
      setError(err.message || "Failed to load dashboard");
      // Set default stats on error
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        activeAssignments: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'courses',
      title: 'My Courses',
      description: 'View and manage your courses',
      icon: '📚',
      action: () => navigate('/teacher/courses'),
      color: 'action-blue'
    },
    {
      id: 'add-content',
      title: 'Add Content',
      description: 'Upload course materials',
      icon: '➕',
      action: () => navigate('/teacher/add-content'),
      color: 'action-teal'
    },
    {
      id: 'student-progress',
      title: 'Student Progress',
      description: 'Track student learning',
      icon: '📊',
          action: () => navigate('/teacher/courses'),
      color: 'action-purple'
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1 className="page-title">Teacher Dashboard</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #1B9AAA',
            borderRadius: '50%',
            margin: '0 auto 1rem auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#666' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }
console.log("dash stats", stats)
  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="page-subtitle">Manage your courses and track student progress</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          <span>⚠️ {error}</span>
          <button
            onClick={fetchTeacherStats}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1B9AAA',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/teacher/courses')}>
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">Courses</div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/teacher/students')}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalStudents ?? 0}</div>
            <div className="stat-label">Students</div>
          </div>
        </div>
        <div
          className="stat-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/teacher/courses?status=active')}
        >
          <div className="stat-icon">📋</div>

          <div className="stat-content">
            <div className="stat-value">{stats.activeAssignments}</div>

            <div className="stat-label">Active</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-cards">
          {quickActions.map(action => (
            <button
              key={action.id}
              className={`action-card ${action.color}`}
              onClick={action.action}
            >
              <div className="card-icon">{action.icon}</div>
              <div className="card-title">{action.title}</div>
              <div className="card-description">{action.description}</div>
              <div className="card-arrow">→</div>
            </button>
          ))}
        </div>
      </section>

      {/* Status Section */}
      <section className="dashboard-section">
        <h2 className="section-title">Quick Stats</h2>
        <div style={{
          backgroundColor: '#F0FFFE',
          border: '1px solid #1B9AAA',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', color: '#142C52', fontWeight: '500' }}>
            ✓ All systems operational • {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>
    </div>
  );
}

export default TeacherDashboard;