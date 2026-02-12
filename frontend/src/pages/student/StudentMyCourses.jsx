import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../../components/ProgressBar';

/**
 * StudentMyCourses Component
 * Display all enrolled courses with progress tracking
 * Professional LMS-style layout with EduVillage branding
 */
const StudentMyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [courseProgress, setCourseProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCoursesAndProgress();
    }, []);

    const fetchCoursesAndProgress = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) {
                setError('Authentication token not found');
                setLoading(false);
                return;
            }

            // Fetch enrolled courses
            const coursesRes = await axios.get(
                'https://edu-village-6j7f.onrender.com//api/courses/student/my-courses/',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCourses(coursesRes.data);

            // Fetch progress for each course
            const progressData = {};
            for (const course of coursesRes.data) {
                try {
                    const progressRes = await axios.get(
                        `https://edu-village-6j7f.onrender.com//api/courses/student/${course.id}/progress/`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    progressData[course.id] = progressRes.data;
                } catch (err) {
                    console.warn(`Error fetching progress for course ${course.id}:`, err);
                    progressData[course.id] = { progress_percentage: 0, is_completed: false };
                }
            }
            setCourseProgress(progressData);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.response?.data?.error || err.message || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const getProgress = (courseId) => {
        return courseProgress[courseId]?.progress_percentage || 0;
    };

    const isCompleted = (courseId) => {
        return courseProgress[courseId]?.is_completed || false;
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <p>Loading your courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorState}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button
                        style={styles.retryButton}
                        onClick={fetchCoursesAndProgress}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div style={styles.container}>
                <h1 style={styles.pageTitle}>My Courses</h1>
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📚</div>
                    <p style={styles.emptyText}>No courses yet</p>
                    <p style={styles.emptySubtext}>
                        You haven't enrolled in any courses yet. Browse our catalog to get started!
                    </p>
                    <button
                        style={styles.browseButton}
                        onClick={() => navigate('/student/browse')}
                    >
                        Browse Courses →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.pageTitle}>My Courses ({courses.length})</h1>
                    <p style={styles.pageSubtitle}>Track your learning progress</p>
                </div>
                <div style={styles.headerButtons}>
                    {/* <button
                        style={styles.certificatesButton}
                        onClick={() => navigate('/student/certificates')}
                    >
                        🏆 My Certificates
                    </button> */}
                    <button
                        style={styles.browseLinkButton}
                        onClick={() => navigate('/student/browse')}
                    >
                        + Browse More Courses
                    </button>
                </div>
            </div>

            <div style={styles.coursesGrid}>
                {courses.map(course => {
                    const progress = getProgress(course.id);
                    const completed = isCompleted(course.id);

                    return (
                        <div key={course.id} style={styles.courseCard}>
                            {completed && (
                                <div style={styles.completedBadge}>✓ Completed</div>
                            )}

                            <div style={styles.courseCardContent}>
                                <h2 style={{
                                    ...styles.courseTitle,
                                    paddingRight: completed ? '80px' : '0'
                                }}>
                                    {course.title}
                                </h2>
                                <p style={styles.instructor}>
                                    <span style={styles.instructorLabel}>Instructor:</span> {course.instructor}
                                </p>
                                {/* Progress Section */}
                                <div style={styles.progressSection}>
                                    <ProgressBar 
                                        percentage={progress}
                                        label="Progress"
                                        size="medium"
                                        completed={completed}
                                        animated={true}
                                    />
                                </div>

                                {/* Course Status */}
                                <div style={styles.statusSection}>
                                    {completed ? (
                                        <div style={styles.statusBadgeCompleted}>
                                            🏆 Course Completed
                                        </div>
                                    ) : progress > 0 ? (
                                        <div style={styles.statusBadgeInProgress}>
                                            ▶ In Progress
                                        </div>
                                    ) : (
                                        <div style={styles.statusBadgeNotStarted}>
                                            ◯ Not Started
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={styles.actions}>
                                    <button
                                        style={{...styles.button, ...styles.primaryButton}}
                                        onClick={() => navigate(`/student/courses/${course.id}`)}
                                    >
                                        {completed ? 'Review Course' : 'Continue Learning'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
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

    pageTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0 0 0.5rem 0',
    },

    pageSubtitle: {
        fontSize: '1rem',
        color: '#666',
        margin: '0',
    },

    headerButtons: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },

    certificatesButton: {
        backgroundColor: '#FFB800',
        color: '#142C52',
        border: 'none',
        padding: '0.75rem 1.5rem',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },

    coursesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem',
    },

    courseCard: {
        position: 'relative',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s, transform 0.3s',
        cursor: 'pointer',
    },

    completedBadge: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        backgroundColor: '#22C55E',
        color: 'white',
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    },

    courseCardContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },

    courseTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0',
    },

    instructor: {
        fontSize: '0.9rem',
        color: '#666',
        margin: '0',
    },

    instructorLabel: {
        fontWeight: 'bold',
        color: '#1B9AAA',
    },

    progressSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },

    progressHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    progressLabel: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#666',
    },

    progressPercentage: {
        fontSize: '0.85rem',
        fontWeight: 'bold',
        color: '#1B9AAA',
    },

    progressBarContainer: {
        width: '100%',
        height: '8px',
        backgroundColor: '#E5E7EB',
        borderRadius: '4px',
        overflow: 'hidden',
    },

    progressBar: {
        height: '100%',
        backgroundColor: '#1B9AAA',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
    },

    statusSection: {
        display: 'flex',
        gap: '0.5rem',
    },

    statusBadgeCompleted: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#ECFDF5',
        color: '#22C55E',
        padding: '0.5rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600',
    },

    statusBadgeInProgress: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#FEF3C7',
        color: '#F59E0B',
        padding: '0.5rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600',
    },

    statusBadgeNotStarted: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
        padding: '0.5rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600',
    },

    browseLinkButton: {
        backgroundColor: '#1B9AAA',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    },

    browseButton: {
        backgroundColor: '#1B9AAA',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: '1rem',
    },

    actions: {
        display: 'flex',
        gap: '0.75rem',
    },

    button: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },

    primaryButton: {
        backgroundColor: '#1B9AAA',
        color: 'white',
    },

    loadingState: {
        textAlign: 'center',
        padding: '4rem 2rem',
    },

    spinner: {
        display: 'inline-block',
        width: '40px',
        height: '40px',
        border: '4px solid #E5E7EB',
        borderTop: '4px solid #1B9AAA',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
    },

    errorState: {
        padding: '3rem 2rem',
        backgroundColor: '#FEE2E2',
        borderRadius: '8px',
        border: '1px solid #FCA5A5',
        textAlign: 'center',
    },

    retryButton: {
        backgroundColor: '#EF4444',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '1rem',
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
};

export default StudentMyCourses;
