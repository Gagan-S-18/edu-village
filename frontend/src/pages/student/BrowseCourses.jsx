import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../../components/ProgressBar';

/**
 * BrowseCourses Component
 * Display all available courses for student enrollment
 * Professional LMS-style layout with EduVillage branding
 */
const BrowseCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(null); // Track which course is being enrolled
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAvailableCourses();
    }, []);

    const fetchAvailableCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('access');
            if (!token) {
                setError('Authentication failed. Please login again.');
                setLoading(false);
                return;
            }

            const response = await axios.get(
                'http://127.0.0.1:8000/api/enrollments/courses/browse/',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCourses(response.data.courses || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.response?.data?.error || 'Failed to load courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrolling(courseId);
            setError(null);

            const token = localStorage.getItem('access');
            const response = await axios.post(
                'http://127.0.0.1:8000/api/enrollments/',
                { course: courseId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Show success message
            setSuccessMessage(`Successfully enrolled in course!`);
            
            // Update course enrollment status
            setCourses(courses.map(course =>
                course.id === courseId ? { ...course, is_enrolled: true } : course
            ));

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error enrolling in course:', err);
            if (err.response?.status === 400) {
                setError('You are already enrolled in this course');
            } else {
                setError(err.response?.data?.error || 'Failed to enroll in course');
            }
        } finally {
            setEnrolling(null);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingWrapper}>
                    <div style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading available courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Browse Courses</h1>
                    <p style={styles.subtitle}>
                        Explore and enroll in courses to expand your knowledge
                    </p>
                </div>
                <button
                    style={styles.backButton}
                    onClick={() => navigate('/student/dashboard')}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div style={styles.successAlert}>
                    <span>✓ {successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={styles.errorAlert}>
                    <span>⚠️ {error}</span>
                    <button
                        style={styles.dismissButton}
                        onClick={() => setError(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📚</div>
                    <p style={styles.emptyText}>No courses available</p>
                    <p style={styles.emptySubtext}>
                        Check back later for new courses
                    </p>
                </div>
            ) : (
                <>
                    <p style={styles.courseCount}>
                        {courses.filter(c => !c.is_enrolled).length} courses available
                    </p>
                    <div style={styles.courseGrid}>
                        {courses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onEnroll={handleEnroll}
                                enrolling={enrolling === course.id}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Course Card Component
const CourseCard = ({ course, onEnroll, enrolling }) => (
    <div style={styles.courseCard}>
        <div style={styles.cardHeader}>
            <h3 style={styles.courseTitle}>{course.title}</h3>
            {course.is_enrolled && (
                <div style={styles.enrolledBadge}>✓ Enrolled</div>
            )}
        </div>

        <p style={styles.courseDescription}>
            {course.description || 'No description available'}
        </p>

        <div style={styles.courseFooter}>
            <div style={styles.instructorInfo}>
                <span style={styles.instructorLabel}>Instructor:</span>
                <span style={styles.instructorName}>{course.instructor_name}</span>
            </div>
            <button
                style={{
                    ...styles.enrollButton,
                    ...(course.is_enrolled ? styles.enrolledButton : {}),
                    ...(enrolling ? styles.enrollingButton : {})
                }}
                onClick={() => !course.is_enrolled && onEnroll(course.id)}
                disabled={course.is_enrolled || enrolling}
            >
                {enrolling ? (
                    <>
                        <span style={styles.spinner2}></span>
                        Enrolling...
                    </>
                ) : course.is_enrolled ? (
                    '✓ Enrolled'
                ) : (
                    'Enroll Now'
                )}
            </button>
        </div>
    </div>
);

// Styles
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        backgroundColor: '#F4F7FA',
        minHeight: '100vh',
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '2px solid rgba(27, 154, 170, 0.1)',
    },

    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0 0 0.5rem 0',
    },

    subtitle: {
        fontSize: '1rem',
        color: '#666',
        margin: '0',
    },

    backButton: {
        backgroundColor: 'transparent',
        color: '#1B9AAA',
        border: '2px solid #1B9AAA',
        padding: '0.6rem 1.2rem',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },

    courseCount: {
        fontSize: '1rem',
        color: '#666',
        margin: '0 0 1.5rem 0',
        fontWeight: '500',
    },

    courseGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
    },

    courseCard: {
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '1.5rem',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
    },

    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        gap: '1rem',
    },

    courseTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0',
        flex: 1,
    },

    enrolledBadge: {
        backgroundColor: '#DCFCE7',
        color: '#16A34A',
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        border: '1px solid #BBF7D0',
    },

    courseDescription: {
        fontSize: '0.95rem',
        color: '#666',
        lineHeight: '1.5',
        margin: '0 0 1rem 0',
        flex: 1,
    },

    courseFooter: {
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
    },

    instructorInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },

    instructorLabel: {
        fontSize: '0.8rem',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },

    instructorName: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#142C52',
    },

    enrollButton: {
        backgroundColor: '#1B9AAA',
        color: 'white',
        border: 'none',
        padding: '0.6rem 1.5rem',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap',
    },

    enrolledButton: {
        backgroundColor: '#22C55E',
        cursor: 'default',
    },

    enrollingButton: {
        opacity: 0.7,
        cursor: 'not-allowed',
    },

    successAlert: {
        backgroundColor: '#DCFCE7',
        border: '1px solid #BBF7D0',
        borderRadius: '8px',
        color: '#16A34A',
        padding: '1rem',
        marginBottom: '1.5rem',
        fontWeight: '500',
        animation: 'slideDown 0.3s ease',
    },

    errorAlert: {
        backgroundColor: '#FEE2E2',
        border: '1px solid #FECACA',
        borderRadius: '8px',
        color: '#DC2626',
        padding: '1rem',
        marginBottom: '1.5rem',
        fontWeight: '500',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        animation: 'slideDown 0.3s ease',
    },

    dismissButton: {
        backgroundColor: 'transparent',
        color: '#DC2626',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '0 0.5rem',
    },

    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
    },

    emptyIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },

    emptyText: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0 0 0.5rem 0',
    },

    emptySubtext: {
        fontSize: '1rem',
        color: '#666',
        margin: '0',
    },

    loadingWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
    },

    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #E5E7EB',
        borderTop: '4px solid #1B9AAA',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
    },

    spinner2: {
        display: 'inline-block',
        width: '14px',
        height: '14px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
    },

    loadingText: {
        fontSize: '1.1rem',
        color: '#666',
        fontWeight: '500',
    },
};

export default BrowseCourses;
