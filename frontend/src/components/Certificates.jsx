import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/certificates.css';

/**
 * Certificates Component
 * 
 * Displays student's earned certificates and allows downloading them.
 * Shows certificate generation status for completed courses.
 */
const Certificates = ({ studentDashboardCourses = [] }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingCertificates, setGeneratingCertificates] = useState({});
  const [successMessages, setSuccessMessages] = useState({});
  const [downloadedCertificates, setDownloadedCertificates] = useState({});
  const [downloaded, setDownloaded] = useState({});
  const [downloading, setDownloading] = useState({});

  const token = localStorage.getItem('access');

  // Fetch user's certificates on component mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  /**
   * Fetch all certificates for the student
   */
  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        'https://edu-village-6j7f.onrender.com//api/courses/student/certificates/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCertificates(response.data.certificates || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load certificates');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate certificate for a completed course
   */
  const handleGenerateCertificate = async (courseId) => {
    setGeneratingCertificates((prev) => ({ ...prev, [courseId]: true }));
    setDownloadedCertificates(prev => ({
      ...prev,
      [courseId]: true
    }));
    setError(null);
    setSuccessMessages((prev) => ({ ...prev, [courseId]: null }));

    try {
      const response = await axios.post(
        `https://edu-village-6j7f.onrender.com//api/courses/student/${courseId}/generate-certificate/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add new certificate to list
      setCertificates((prev) => [...prev, response.data.certificate]);
      setSuccessMessages((prev) => ({
        ...prev,
        [courseId]: 'Certificate generated successfully!',
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessages((prev) => ({ ...prev, [courseId]: null }));
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to generate certificate'
      );
    } finally {
      setGeneratingCertificates((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  /**
   * Download certificate PDF
   * 
   * Fetches certificate file from backend and triggers browser download.
   * Shows toast only after confirmed download.
   */
  const handleDownloadCertificate = async (certificate) => {
    try {
      const token = localStorage.getItem('access');
      const certificateId = certificate.id;
      const certificateName = `Certificate_${certificate.course_title}`;

      // Fetch PDF from backend
      const response = await fetch(
        `https://edu-village-6j7f.onrender.com//api/courses/student/certificates/${certificateId}/download/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();

      // Verify blob is valid and has content
      if (!blob || blob.size === 0) {
        throw new Error('Certificate file is empty or invalid');
      }

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificateName}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup after download
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setDownloaded(prev => ({
        ...prev,
        [certificate.id]: true
      }));



      // SUCCESS: Show toast ONLY after confirmed download
      setTimeout(() => {
        toast.success('Certificate downloaded successfully!');
      }, 150);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      toast.error('Certificate download failed. Please try again.');
    }
  };

  /**
   * Format date to readable format
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Find courses that are 100% complete but don't have certificates yet
  const certificateIds = certificates.map((cert) => cert.course);
  const completedCoursesNoCert = (studentDashboardCourses || []).filter(
    (course) => course.progress_percentage === 100 && !certificateIds.includes(course.id)
  );

  const hasCertificates = certificates.length > 0;
  const hasCompletedCourses = completedCoursesNoCert.length > 0;

  return (
    <div className="certificates-container">
      <div className="certificates-header">
        <h2>🏆 Your Certificates</h2>
        <p className="certificates-subtitle">
          Earn certificates by completing courses
        </p>
      </div>

      {error && (
        <div className="certificates-error">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="certificates-loading">
          <div className="spinner"></div>
          <p>Loading your certificates...</p>
        </div>
      ) : (
        <>
          {/* Earned Certificates */}
          {hasCertificates && (
            <section className="certificates-section">
              <h3 className="section-title">✓ Earned Certificates</h3>
              <div className="certificates-grid">
                {certificates.map((certificate) => (
                  <div key={certificate.id} className="certificate-card">
                    <div className="certificate-badge">
                      <span className="badge-icon">🎓</span>
                    </div>
                    <div className="certificate-content">
                      <h4 className="certificate-course">{certificate.course_title}</h4>
                      <p className="certificate-student">
                        Issued to: <strong>{certificate.student_name}</strong>
                      </p>
                      <p className="certificate-date">
                        Completed: {formatDate(certificate.issued_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={ ` download - certificate - btn ${
    downloaded[certificate.id] ? "downloaded" : ""
                      }` }
                    onClick={() => handleDownloadCertificate(certificate)}
                    disabled={downloading[certificate.id]}
>
                    {downloading[certificate.id] ? (
                      "⏳ Downloading..."
                    ) : downloaded[certificate.id] ? (
                      <>
                        <span className="btn-text-default"></span>
                        <span className="btn-text-hover">Download again</span>
                      </>
                    ) : (
                      "⬇ Download PDF"
                    )}
                  </button>
                  </div>
                ))}
            </div>
            </section>
          )}

      {/* Courses Ready for Certificate */}
      {hasCompletedCourses && (
        <section className="certificates-section">
          <h3 className="section-title">🎉 Ready for Certificate</h3>
          <p className="section-description">
            You've completed these courses! Generate your certificate now.
          </p>
          <div className="certificates-grid">
            {completedCoursesNoCert.map((course) => (
              <div key={course.id} className="certificate-card pending">
                <div className="certificate-badge pending">
                  <span className="badge-icon">✨</span>
                </div>
                <div className="certificate-content">
                  <h4 className="certificate-course">{course.title}</h4>
                  <p className="certificate-progress">
                    <strong>100% Complete</strong>
                  </p>
                  <p className="certificate-date">
                    Ready to generate certificate
                  </p>
                </div>
                {successMessages[course.id] && (
                  <div className="success-message">
                    {successMessages[course.id]}
                  </div>
                )}
                <button
                  type="button"
                  className={`generate - certificate - btn ${downloadedCertificates[course.id] ? 'downloaded' : ''
                    }`}
                  onClick={() => handleGenerateCertificate(course.id)}
                  disabled={generatingCertificates[course.id]}
                  title="Download PDF"
                >
                  {generatingCertificates[course.id]
                    ? '⏳ Generating...'
                    : downloadedCertificates[course.id]
                      ? '✓ Downloaded'
                      : '⬇ Download PDF'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasCertificates && !hasCompletedCourses && (
        <div className="certificates-empty">
          <div className="empty-icon">📚</div>
          <p className="empty-title">No Certificates Yet</p>
          <p className="empty-description">
            Complete 100% of a course to earn and download your certificate
          </p>
        </div>
      )}
    </>
  )
}



    </div >

    
  );
};



export default Certificates;
