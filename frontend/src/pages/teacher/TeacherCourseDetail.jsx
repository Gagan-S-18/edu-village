import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import StudentProgressTable from '../../components/StudentProgressTable';
import SubmissionsList from '../../components/SubmissionsList';

const TeacherCourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, progress, submissions
    const [progressData, setProgressData] = useState(null);
    const [submissionsData, setSubmissionsData] = useState(null);
    const [progressLoading, setProgressLoading] = useState(false);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [progressError, setProgressError] = useState(null);
    const [submissionsError, setSubmissionsError] = useState(null);

    const token = localStorage.getItem('access');

    // Fetch course details
    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                const response = await axios.get(`https://edu-village-6j7f.onrender.com//api/courses/teacher/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourse(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Error fetching course details');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetail();
    }, [id, token]);

    // Fetch student progress when tab is activated
    const fetchStudentProgress = async () => {
        setProgressLoading(true);
        setProgressError(null);
        try {
            const response = await axios.get(
                `https://edu-village-6j7f.onrender.com//api/courses/teacher/${id}/students-progress/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProgressData(response.data.students || []);
        } catch (err) {
            setProgressError(err.response?.data?.error || 'Error fetching student progress');
        } finally {
            setProgressLoading(false);
        }
    };

    // Fetch submissions when tab is activated
    const fetchSubmissions = async () => {
        setSubmissionsLoading(true);
        setSubmissionsError(null);
        try {
            const response = await axios.get(
                `https://edu-village-6j7f.onrender.com//api/courses/teacher/${id}/submissions/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmissionsData(response.data);
        } catch (err) {
            setSubmissionsError(err.response?.data?.error || 'Error fetching submissions');
        } finally {
            setSubmissionsLoading(false);
        }
    };

    // Handle tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'progress' && !progressData) {
            fetchStudentProgress();
        } else if (tab === 'submissions' && !submissionsData) {
            fetchSubmissions();
        }
    };

    // Handle download submission
    const handleDownloadSubmission = (submission) => {
        if (submission.file_url) {
            window.open(submission.file_url, '_blank');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getContentTypeColor = (type) => {
        const colors = {
            video: '#e74c3c',
            pdf: '#3498db',
            assignment: '#2ecc71',
            document: '#f39c12',
            link: '#9b59b6',
            other: '#95a5a6'
        };
        return colors[type] || '#95a5a6';
    };

    const getContentTypeIcon = (type) => {
        const icons = {
            video: '🎥',
            pdf: '📄',
            assignment: '📝',
            document: '📃',
            link: '🔗',
            other: '📦'
        };
        return icons[type] || '📦';
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <p style={styles.loading}>Loading course details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <p>Course not found</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Course Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>{course.title}</h1>
                <p style={styles.description}>{course.description}</p>
                <div style={styles.metaInfo}>
                    <span style={styles.metaItem}>
                        <strong>Status:</strong> {course.status}
                    </span>
                    <span style={styles.metaItem}>
                        <strong>Duration:</strong> {course.duration} hours
                    </span>
                    <span style={styles.metaItem}>
                        <strong>Created:</strong> {formatDate(course.created_at)}
                    </span>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div style={styles.tabsNav}>
                <button
                    style={{
                        ...styles.tabButton,
                        ...{ borderBottomColor: activeTab === 'overview' ? '#1B9AAA' : 'transparent' }
                    }}
                    onClick={() => handleTabChange('overview')}
                >
                    📚 Overview
                </button>
                <button
                    style={{
                        ...styles.tabButton,
                        ...{ borderBottomColor: activeTab === 'progress' ? '#1B9AAA' : 'transparent' }
                    }}
                    onClick={() => handleTabChange('progress')}
                >
                    📊 Students Progress
                </button>
                <button
                    style={{
                        ...styles.tabButton,
                        ...{ borderBottomColor: activeTab === 'submissions' ? '#1B9AAA' : 'transparent' }
                    }}
                    onClick={() => handleTabChange('submissions')}
                >
                    📝 Submissions
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Content Section */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>📚 Course Content ({course.content?.length || 0})</h2>
                        {course.content && course.content.length > 0 ? (
                            <div style={styles.contentGrid}>
                                {course.content.map((item) => (
                                    <div key={item.id} style={styles.contentCard}>
                                        <div style={{
                                            ...styles.contentHeader,
                                            borderLeftColor: getContentTypeColor(item.content_type)
                                        }}>
                                            <span style={styles.contentIcon}>
                                                {getContentTypeIcon(item.content_type)}
                                            </span>
                                            <div style={styles.contentInfo}>
                                                <h3 style={styles.contentTitle}>{item.title}</h3>
                                                <p style={styles.contentType}>
                                                    {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={styles.contentMeta}>
                                            <small style={styles.contentDate}>
                                                Uploaded: {formatDate(item.created_at)}
                                            </small>
                                            {item.file && (
                                                <small style={styles.fileSize}>
                                                    📦 File attached
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={styles.emptyMessage}>No content uploaded yet</p>
                        )}
                    </section>

                    {/* Students Section */}
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>👥 Enrolled Students ({course.total_students || 0})</h2>
                        {course.students && course.students.length > 0 ? (
                            <div style={styles.studentsTable}>
                                <div style={styles.tableHeader}>
                                    <div style={{...styles.tableCell, flex: 2}}>Name</div>
                                    <div style={{...styles.tableCell, flex: 1.5}}>Username</div>
                                    <div style={{...styles.tableCell, flex: 2}}>Email</div>
                                    <div style={{...styles.tableCell, flex: 1.5}}>Enrolled Date</div>
                                </div>
                                {course.students.map((student, idx) => (
                                    <div key={student.id} style={{
                                        ...styles.tableRow,
                                        backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white'
                                    }}>
                                        <div style={{...styles.tableCell, flex: 2}}>
                                            {student.first_name} {student.last_name}
                                        </div>
                                        <div style={{...styles.tableCell, flex: 1.5}}>
                                            {student.username}
                                        </div>
                                        <div style={{...styles.tableCell, flex: 2}}>
                                            {student.email}
                                        </div>
                                        <div style={{...styles.tableCell, flex: 1.5}}>
                                            {formatDate(student.enrolled_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={styles.emptyMessage}>No students enrolled yet</p>
                        )}
                    </section>
                </>
            )}

            {activeTab === 'progress' && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>📊 Student Progress</h2>
                    <StudentProgressTable
                        students={progressData || []}
                        loading={progressLoading}
                        error={progressError}
                        onRetry={fetchStudentProgress}
                    />
                </section>
            )}

            {activeTab === 'submissions' && (
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>📝 Assignment Submissions</h2>
                    <SubmissionsList
                        students={submissionsData?.students || []}
                        totalAssignments={submissionsData?.total_assignments || 0}
                        loading={submissionsLoading}
                        error={submissionsError}
                        onRetry={fetchSubmissions}
                        onDownload={handleDownloadSubmission}
                    />
                </section>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
    },
    header: {
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '2px solid #eee',
    },
    title: {
        fontSize: '2.5rem',
        margin: '0 0 0.5rem 0',
        color: '#2c3e50',
    },
    description: {
        fontSize: '1rem',
        color: '#555',
        margin: '0.5rem 0 1rem 0',
        lineHeight: '1.6',
    },
    metaInfo: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        fontSize: '0.9rem',
    },
    metaItem: {
        color: '#666',
    },
    tabsNav: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #eee',
    },
    tabButton: {
        padding: '1rem 1.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        color: '#666',
        transition: 'all 0.3s ease',
        marginBottom: '-2px',
    },
    section: {
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #eee',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#2c3e50',
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
    },
    contentCard: {
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s',
    },
    contentHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        borderLeft: '4px solid #3498db',
        backgroundColor: '#f8f9fa',
    },
    contentIcon: {
        fontSize: '2rem',
    },
    contentInfo: {
        flex: 1,
        minWidth: 0,
    },
    contentTitle: {
        margin: '0',
        fontSize: '1rem',
        fontWeight: 'bold',
        wordBreak: 'break-word',
    },
    contentType: {
        margin: '0.25rem 0 0 0',
        fontSize: '0.8rem',
        color: '#666',
    },
    contentMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: '#fafafa',
        fontSize: '0.8rem',
        color: '#666',
    },
    contentDate: {
        display: 'block',
    },
    fileSize: {
        display: 'block',
    },
    emptyMessage: {
        padding: '2rem',
        textAlign: 'center',
        color: '#999',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
    },
    studentsTable: {
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    tableHeader: {
        display: 'flex',
        backgroundColor: '#2c3e50',
        color: 'white',
        fontWeight: 'bold',
        borderBottom: '2px solid #ddd',
    },
    tableRow: {
        display: 'flex',
        borderBottom: '1px solid #ddd',
        transition: 'background-color 0.2s',
    },
    tableCell: {
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    loading: {
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#666',
        padding: '2rem',
    },
    error: {
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        padding: '1rem',
        color: '#c33',
    },
};

export default TeacherCourseDetail;
