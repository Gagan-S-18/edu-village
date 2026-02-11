import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const AdminCreateCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('access');
      const response = await fetch('http://127.0.0.1:8000/api/courses/admin/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          duration: parseInt(formData.duration),
          status: formData.status
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.detail || 'Failed to create course' });
        }
        return;
      }

      setSuccessMessage('Course created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        duration: '',
        status: 'draft'
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/admin/manage-courses');
      }, 1500);

    } catch (error) {
      console.error('Error creating course:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-create-course-container">
        <div className="form-header">
          <h1>Create New Course</h1>
          <p>Add a new course to the platform</p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit} className="course-form">
            {/* General Error */}
            {errors.general && (
              <div className="alert alert-error">
                <span>⚠️</span> {errors.general}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="alert alert-success">
                <span>✓</span> {successMessage}
              </div>
            )}

            {/* Title Field */}
            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter course title"
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label htmlFor="description">Course Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter course description"
                rows="4"
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            {/* Duration Field */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration (hours) *</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 40"
                  min="1"
                  className={errors.duration ? 'input-error' : ''}
                />
                {errors.duration && <span className="field-error">{errors.duration}</span>}
              </div>

              {/* Status Field */}
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .admin-create-course-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-header h1 {
          font-size: 2rem;
          color: #142c52;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #666;
          font-size: 1rem;
        }

        .form-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .course-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #142c52;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1b9aaa;
          box-shadow: 0 0 0 3px rgba(27, 154, 170, 0.1);
        }

        .form-group input.input-error,
        .form-group textarea.input-error,
        .form-group select.input-error {
          border-color: #e74c3c;
          background-color: #fadbd8;
        }

        .field-error {
          color: #e74c3c;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        .alert-error {
          background-color: #fadbd8;
          color: #c0392b;
          border-left: 4px solid #e74c3c;
        }

        .alert-success {
          background-color: #d5f4e6;
          color: #27ae60;
          border-left: 4px solid #27ae60;
        }

        .alert span {
          font-size: 1.2rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background-color: #1b9aaa;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #158a97;
          box-shadow: 0 4px 12px rgba(27, 154, 170, 0.3);
        }

        .btn-secondary {
          background-color: #e0e0e0;
          color: #333;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #d0d0d0;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .admin-create-course-container {
            padding: 1rem;
          }

          .form-card {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminCreateCourse;
