import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import '../../styles/admin-users.css';

/**
 * AdminUsers Component
 * Displays list of users with ability to filter by role
 * 
 * Query Parameters:
 * - ?role=student (show only students)
 * - ?role=teacher (show only teachers)
 * - ?role=admin (show only admins)
 * No parameter: show all users
 */
function AdminUsers() {
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get('role');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('access');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      let url = 'https://edu-village-6j7f.onrender.com//api/users/admin/users/';
      if (roleFilter) {
        url += `?role=${roleFilter}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'student': 'Student',
      'teacher': 'Teacher',
      'admin': 'Admin'
    };
    return labels[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      'student': 'badge-student',
      'teacher': 'badge-teacher',
      'admin': 'badge-admin'
    };
    return classes[role] || 'badge-default';
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-active';
    const classes = {
      'pending': 'badge-pending',
      'approved': 'badge-active',
      'rejected': 'badge-inactive'
    };
    return classes[status] || 'badge-default';
  };

  const getStatusLabel = (role, status) => {
    if (role !== 'teacher') return 'Active';
    if (!status) return 'N/A';
    const labels = {
      'pending': 'Pending Approval',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return labels[status] || status;
  };

  const titleMap = {
    'student': 'Students',
    'teacher': 'Teachers',
    'admin': 'Administrators'
  };

  const pageTitle = roleFilter ? titleMap[roleFilter] || 'Users' : 'All Users';

  return (
    <DashboardLayout>
      <div className="admin-users-container">
        <div className="page-header">
          <h1>{pageTitle}</h1>
          <p>{users.length} user{users.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h2>No users found</h2>
            <p>
              {roleFilter 
                ? `No ${roleFilter}s are available in the system.`
                : 'No users are available in the system.'
              }
            </p>
          </div>
        ) : (
          /* Users Table */
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nameb</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="user-row">
                    <td className="name-cell">{user.username}</td>
                    <td className="email-cell">{user.email}</td>
                    <td className="role-cell">
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span className={`badge ${getStatusBadgeClass(user.teacher_status)}`}>
                        {getStatusLabel(user.role, user.teacher_status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminUsers;
