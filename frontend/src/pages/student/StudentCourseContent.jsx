import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AssignmentSubmissionModal from '../../components/AssignmentSubmissionModal';

import "react-toastify/dist/ReactToastify.css";

/**
 * StudentCourseContent Component (STEP 3: Student Course Details Page)
 * 
 * Renders a complete student course details page with:
 * - Course information header (title, instructor, description)
 * - Tab-based UI: Content | Assignments | Progress
 * - Content Tab: List course materials with view/download actions
 * - Assignments Tab: List assignments with submission status
 * - Progress Tab: Learning progress tracking
 * 
 * Data Flow:
 * 1. Fetch course details via /api/courses/student/<course_id>/contents/
 * 2. Fetch course progress via /api/courses/student/<course_id>/progress/
 * 3. Fetch course metadata (instructor, description) via /api/courses/<course_id>/
 */
const StudentCourseContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('content');
    const [markingComplete, setMarkingComplete] = useState({});
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [studentSubmissions, setStudentSubmissions] = useState({});
    const [downloadingCert, setDownloadingCert] = useState(false);

    useEffect(() => {
        fetchAllCourseData();
    }, [id]);

    useEffect(() => {
        // Fetch submissions when switching to assignments tab
        if (activeTab === 'assignments' && courseData) {
            fetchStudentSubmissions();
        }
    }, [activeTab, courseData]);

    useEffect(() => {
        // Automatically refresh progress periodically to stay in sync
        const progressRefreshInterval = setInterval(() => {
            if (courseData && !loading) {
                fetchProgressData();
            }
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(progressRefreshInterval);
    }, [courseData, loading, id]);

    const fetchAllCourseData = async () => {
        try {
            const token = localStorage.getItem('access');

            // Fetch course content and contents list
            const contentResponse = await axios.get(
                `http://127.0.0.1:8000/api/courses/student/${id}/contents/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCourseData(contentResponse.data);

            // Fetch course progress
            const progressResponse = await axios.get(
                `http://127.0.0.1:8000/api/courses/student/${id}/progress/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProgress(progressResponse.data);

            // Fetch full course details (instructor, description)
            try {
                const courseResponse = await axios.get(
                    `http://127.0.0.1:8000/api/courses/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Find the course matching our course_id
                const course = courseResponse.data.find(c => c.id === parseInt(id));
                if (course) {
                    setCourseInfo(course);
                }
            } catch (err) {
                console.warn('Could not fetch course info:', err);
            }

            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching course content');
            console.error('Error fetching course:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async (contentId) => {
        setMarkingComplete(prev => ({ ...prev, [contentId]: true }));
        try {
            const token = localStorage.getItem('access');
            await axios.post(
                `http://127.0.0.1:8000/api/courses/student/${contentId}/complete/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCourseData(prev => ({
                ...prev,
                contents: prev.contents.map(content =>
                    content.id === contentId ? { ...content, completed: true } : content
                )
            }));

            // Refresh progress after marking content complete
            try {
                const progressResponse = await axios.get(
                    `http://127.0.0.1:8000/api/courses/student/${id}/progress/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProgress(progressResponse.data);

                // If course is now 100% complete, auto-generate certificate
                if (progressResponse.data.is_completed) {
                    try {
                        await axios.post(
                            `http://127.0.0.1:8000/api/courses/student/${id}/generate-certificate/`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        console.log('Certificate auto-generated on course completion');
                    } catch (certErr) {
                        console.warn('Auto-generate certificate (non-blocking):', certErr);
                    }
                }
            } catch (err) {
                console.error('Error fetching updated progress:', err);
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Error marking content as completed');
        } finally {
            setMarkingComplete(prev => ({ ...prev, [contentId]: false }));
        }
    };

    const handleOpenSubmissionModal = (assignment) => {
        setSelectedAssignment(assignment);
        setShowSubmissionModal(true);
    };

    const handleSubmissionSuccess = (data) => {
        // Update submissions cache
        if (selectedAssignment) {
            setStudentSubmissions(prev => ({
                ...prev,
                [selectedAssignment.id]: data.submission
            }));
        }
    };

    const fetchStudentSubmissions = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!courseData || !courseData.contents) return;

            const assignments = courseData.contents.filter(c => c.content_type === 'assignment');
            const submissions = {};

            for (const assignment of assignments) {
                try {
                    const response = await axios.get(
                        `http://127.0.0.1:8000/api/courses/student/assignments/${assignment.id}/submission/`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (response.data.submitted) {
                        submissions[assignment.id] = response.data.submission;
                    }
                } catch (err) {
                    console.log(`No submission for assignment ${assignment.id}`);
                }
            }

            setStudentSubmissions(submissions);
        } catch (err) {
            console.error('Error fetching submissions:', err);
        }
    };

    const fetchProgressData = async () => {
        try {
            const token = localStorage.getItem('access');
            const progressResponse = await axios.get(
                `http://127.0.0.1:8000/api/courses/student/${id}/progress/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProgress(progressResponse.data);
        } catch (err) {
            console.error('Error fetching progress:', err);
        }
    };

    const handleDownloadCertificate = async (courseId) => {
        
        setDownloadingCert(true);
        try {
            const token = localStorage.getItem('access');

            // Step 1: Check if certificate exists for this course
            let certificate = null;
            try {
                const certificatesResponse = await axios.get(
                    'http://127.0.0.1:8000/api/courses/student/certificates/',
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                certificate = certificatesResponse.data.certificates?.find(
                    cert => cert.course === courseId
                );
            } catch (fetchErr) {
                console.error('Error fetching certificates:', fetchErr);
                // Continue to try generation anyway
            }

            if (!certificate) {
                // Certificate doesn't exist yet, generate it
                try {
                    const generateResponse = await axios.post(
                        `http://127.0.0.1:8000/api/courses/student/${courseId}/generate-certificate/`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (generateResponse.data && generateResponse.data.id) {
                        certificate = generateResponse.data;
                    } else {
                        throw new Error('No certificate data returned from generation');
                    }
                } catch (genErr) {
                    toast.error('Certificate download failed. Please try again.');
                    console.error('Certificate generation error:', genErr);
                    setDownloadingCert(false);
                    return;
                }
            }

            // Step 2: Download the certificate file
            if (certificate && certificate.id) {
                try {
                    await downloadCertificateFile(certificate.id, token);
                    toast.success('Certificate downloaded successfully!');
                } catch (err) {
                    toast.error('Certificate download failed. Please try again.');
                }
            } else {
                toast.error('Certificate download failed. Please try again.');
            }
        } catch (err) {
            toast.error('Certificate download failed. Please try again.');
            console.error('Error in handleDownloadCertificate:', err);
        } finally {
            setDownloadingCert(false);
        }
    };

    const downloadCertificateFile = async (certificateId, token) => {
        const downloadUrl = `http://127.0.0.1:8000/api/courses/student/certificates/${certificateId}/download/`;

        const response = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Download failed with status ${response.status}`);
        }

        const blob = await response.blob();

        if (!blob || blob.size === 0) {
            throw new Error('Empty certificate file');
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `Certificate_${certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true; // ONLY return status
    };

    // SUCCESS: Show toast ONLY after file is downloaded
    // setTimeout(() => {
    //     toast.success('Certificate downloaded successfully!');
    // }, 150);

    // resolve();
    //             })
    //             .catch(err => {
    //                 // FAILURE: Show error toast
    //                 toast.error('Certificate download failed. Please try again.');
    //                 console.error('Certificate download error:', err);
    //                 reject(err);
    //             });
    //     });
    // };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <p>Loading course content...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorState}>
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!courseData) {
        return (
            <div style={styles.container}>
                <div style={styles.errorState}>
                    <p>Course not found</p>
                </div>
            </div>
        );
    }

    const assignments = courseData.contents?.filter(c => c.content_type === 'assignment') || [];
    const contentItems = courseData.contents || [];
    const completedCount = contentItems.filter(c => c.completed).length;

    return (
        <div style={styles.container}>
            {/* Course Header with Details */}
            <div style={styles.header}>
                <button
                    style={styles.backButton}
                    onClick={() => navigate('/student/courses')}
                >
                    ← Back to My Courses
                </button>

                <div style={styles.headerContent}>
                    <div style={styles.courseInfoSection}>
                        <h1 style={styles.courseTitle}>{courseData?.course_title || 'Loading...'}</h1>

                        {/* Instructor Info */}
                        {courseInfo && (
                            <div style={styles.instructorInfo}>
                                <span style={styles.instructorLabel}>Instructor: </span>
                                <span style={styles.instructorName}>
                                    {courseInfo.instructor || 'N/A'}
                                </span>
                            </div>
                        )}

                        {/* Course Description */}
                        {courseInfo?.description && (
                            <p style={styles.courseDescription}>
                                {courseInfo.description}
                            </p>
                        )}

                        {/* Completion Badge */}
                        {progress?.is_completed && (
                            <div style={styles.completionBadge}>
                                ✓ Course Completed
                            </div>
                        )}
                    </div>
                </div>

                {progress && (
                    <div style={styles.progressInfo}>
                        <div style={styles.progressCard}>
                            <p style={styles.progressLabel}>Overall Progress</p>
                            <p style={styles.progressValue}>
                                {Math.round(progress.progress_percentage)}%
                            </p>
                            <div style={styles.progressBarContainer}>
                                <div
                                    style={{
                                        ...styles.progressBar,
                                        width: `${progress.progress_percentage}%`
                                    }}
                                ></div>
                            </div>
                            <p style={styles.progressDetails}>
                                {progress.completed_content} of {progress.total_content} completed
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'content' ? styles.tabButtonActive : {})
                    }}
                    onClick={() => setActiveTab('content')}
                >
                    📚 Content ({courseData?.contents?.length || 0})
                </button>
                <button
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'assignments' ? styles.tabButtonActive : {})
                    }}
                    onClick={() => setActiveTab('assignments')}
                >
                    📝 Assignments ({courseData?.contents?.filter(c => c.content_type === 'assignment').length || 0})
                </button>
                <button
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'progress' ? styles.tabButtonActive : {})
                    }}
                    onClick={() => setActiveTab('progress')}
                >
                    📊 Progress
                </button>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div style={styles.tabContent}>
                    {contentItems.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No content available yet</p>
                        </div>
                    ) : (
                        <div style={styles.contentTable}>
                            <div style={styles.tableHeader}>
                                <div style={{ flex: 2 }}>File Name</div>
                                <div style={{ flex: 1 }}>Type</div>
                                <div style={{ flex: 1 }}>Date</div>
                                <div style={{ flex: 1 }}>Status</div>
                                <div style={{ flex: 1 }}>Action</div>
                            </div>

                            {contentItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    style={{
                                        ...styles.tableRow,
                                        backgroundColor: idx % 2 === 0 ? '#F9FAFB' : 'white'
                                    }}
                                >
                                    <div style={{ flex: 2, ...styles.tableCell }}>
                                        {getContentIcon(item.content_type)} {item.title}
                                    </div>
                                    <div style={{ flex: 1, ...styles.tableCell }}>
                                        <span style={getContentTypeBadge(item.content_type)}>
                                            {item.content_type}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1, ...styles.tableCell }}>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ flex: 1, ...styles.tableCell }}>
                                        {item.completed ? (
                                            <span style={styles.statusCompleted}>✓ Completed</span>
                                        ) : (
                                            <span style={styles.statusPending}>○ Pending</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, ...styles.tableCell, gap: '8px' }}>

    {/* Download Button */}
    {item.file && (
        <a
            href={`http://127.0.0.1:8000${item.file}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                backgroundColor: '#2563EB',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                textDecoration: 'none',
                fontWeight: 'bold'
            }}
        >
            View
        </a>
    )}

    {/* Mark Complete Button */}
    {!item.completed && (
        <button
            style={styles.markCompleteButton}
            onClick={() => handleMarkComplete(item.id)}
            disabled={markingComplete[item.id]}
        >
            {markingComplete[item.id] ? '...' : 'Mark Done'}
        </button>
    )}
</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
                <div style={styles.tabContent}>
                    {assignments.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No assignments in this course</p>
                        </div>
                    ) : (
                        <div style={styles.assignmentsList}>
                            {assignments.map(assignment => (
                                <div key={assignment.id} style={styles.assignmentCard}>
                                    <div style={styles.assignmentHeader}>
                                        <h3 style={styles.assignmentTitle}>{assignment.title}</h3>
                                        <div style={styles.assignmentStatus}>
                                            {assignment.completed ? (
                                                <span style={styles.statusSubmitted}>✓ Submitted</span>
                                            ) : (
                                                <span style={styles.statusPendingAssignment}>Pending</span>
                                            )}
                                        </div>
                                    </div>
                                    <p style={styles.assignmentDate}>
                                        Uploaded: {new Date(assignment.created_at).toLocaleDateString()}
                                    </p>
                                    {studentSubmissions[assignment.id] && (
                                        <p style={{ ...styles.assignmentDate, color: '#22C55E', marginTop: '10px' }}>
                                            Submitted: {new Date(studentSubmissions[assignment.id].submitted_at).toLocaleDateString()}
                                        </p>
                                    )}
                                    <button
                                        style={styles.submitButton}
                                        onClick={() => handleOpenSubmissionModal(assignment)}
                                    >
                                        {studentSubmissions[assignment.id] ? 'Update Submission' : 'Submit Assignment'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
                <div style={styles.tabContent}>
                    {progress && (
                        <div style={styles.progressDetails}>
                            <div style={styles.progressDetailCard}>
                                <h3 style={styles.progressDetailTitle}>Course Completion</h3>
                                <div style={styles.progressDetailContent}>
                                    <div style={styles.progressLarge}>
                                        <div style={{ ...styles.progressBarContainerLarge }}>
                                            <div
                                                style={{
                                                    ...styles.progressBarLarge,
                                                    width: `${progress.progress_percentage}%`
                                                }}
                                            ></div>
                                        </div>
                                        <p style={styles.progressLargeText}>
                                            {Math.round(progress.progress_percentage)}%
                                        </p>
                                    </div>
                                    <div style={styles.progressStats}>
                                        <div style={styles.statItem}>
                                            <p style={styles.statLabel}>Total Content</p>
                                            <p style={styles.statValue}>{progress.total_content}</p>
                                        </div>
                                        <div style={styles.statItem}>
                                            <p style={styles.statLabel}>Completed</p>
                                            <p style={{ ...styles.statValue, color: '#22C55E' }}>
                                                {progress.completed_content}
                                            </p>
                                        </div>
                                        <div style={styles.statItem}>
                                            <p style={styles.statLabel}>Remaining</p>
                                            <p style={{ ...styles.statValue, color: '#F59E0B' }}>
                                                {progress.total_content - progress.completed_content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {progress.is_completed && (
                                <div style={styles.certificateCard}>
                                    <h3 style={styles.certificateTitle}>🏆 Course Completed!</h3>
                                    <p style={styles.certificateText}>
                                        Congratulations! You've successfully completed this course. <br/> (Download Your Certificate in "YOUR CERTIFICATES" Section)
                                    
                                        
                                    </p>
                                    {/* <button
                                        type="button"
                                        style={styles.certificateButton}
                                        onClick={() => handleDownloadCertificate(id)}
                                        disabled={downloadingCert}
                                    >
                                        {downloadingCert ? '⏳ Downloading...' : '📥 Download PDF'}
                                    </button> */}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Assignment Submission Modal */}
            {showSubmissionModal && selectedAssignment && (
                <AssignmentSubmissionModal
                    assignment={selectedAssignment}
                    courseId={id}
                    onClose={() => {
                        setShowSubmissionModal(false);
                        setSelectedAssignment(null);
                    }}
                    onSubmitSuccess={handleSubmissionSuccess}
                />
            )}
        </div>
    );
};

// Helper functions
const getContentIcon = (type) => {
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

const getContentTypeBadge = (type) => {
    const badges = {
        video: { backgroundColor: '#FEE2E2', color: '#DC2626' },
        pdf: { backgroundColor: '#DBEAFE', color: '#2563EB' },
        assignment: { backgroundColor: '#FEF3C7', color: '#D97706' },
        document: { backgroundColor: '#E0E7FF', color: '#4F46E5' },
        link: { backgroundColor: '#F3E8FF', color: '#7C3AED' },
        other: { backgroundColor: '#F3F4F6', color: '#6B7280' }
    };
    return {
        ...styles.typeBadge,
        ...(badges[type] || badges.other)
    };
};

// Styles
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#F4F7FA',
        minHeight: '100vh',
    },

    backButton: {
        backgroundColor: 'transparent',
        color: '#1B9AAA',
        border: 'none',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginBottom: '1rem',
    },

    header: {
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '2px solid rgba(27, 154, 170, 0.1)',
    },

    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        gap: '2rem',
    },

    courseTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0 0 0.5rem 0',
    },

    instructorInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: '1rem',
    },

    instructorLabel: {
        fontWeight: '600',
        color: '#666',
    },

    instructorName: {
        color: '#1B9AAA',
        fontWeight: '600',
    },

    courseDescription: {
        fontSize: '0.95rem',
        color: '#555',
        lineHeight: '1.5',
        marginBottom: '1rem',
        maxWidth: '600px',
    },

    courseInfoSection: {
        flex: 1,
    },

    completionBadge: {
        backgroundColor: '#22C55E',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
    },

    progressInfo: {
        marginTop: '1.5rem',
    },

    progressCard: {
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
    },

    progressLabel: {
        margin: '0 0 0.5rem 0',
        fontSize: '0.9rem',
        color: '#666',
        fontWeight: '600',
    },

    progressValue: {
        margin: '0.5rem 0',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1B9AAA',
    },

    progressBarContainer: {
        width: '100%',
        height: '10px',
        backgroundColor: '#E5E7EB',
        borderRadius: '5px',
        overflow: 'hidden',
        marginBottom: '0.5rem',
    },

    progressBar: {
        height: '100%',
        backgroundColor: '#1B9AAA',
        transition: 'width 0.5s ease',
    },

    progressDetails: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '0',
    },

    // Tabs
    tabs: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #E5E7EB',
    },

    tabButton: {
        padding: '1rem 1.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#666',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },

    tabButtonActive: {
        color: '#1B9AAA',
        borderBottomColor: '#1B9AAA',
    },

    tabContent: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        border: '1px solid #E5E7EB',
    },

    // Content Table
    contentTable: {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        overflow: 'hidden',
    },

    tableHeader: {
        display: 'flex',
        backgroundColor: '#142C52',
        color: 'white',
        fontWeight: 'bold',
        padding: '1rem',
        fontSize: '0.9rem',
    },

    tableRow: {
        display: 'flex',
        borderBottom: '1px solid #E5E7EB',
        padding: '1rem',
        alignItems: 'center',
    },

    tableCell: {
        display: 'flex',
        alignItems: 'center',
    },

    typeBadge: {
        padding: '0.3rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-block',
    },

    statusCompleted: {
        color: '#22C55E',
        fontWeight: '600',
    },

    statusPending: {
        color: '#F59E0B',
        fontWeight: '600',
    },

    markCompleteButton: {
        backgroundColor: '#1B9AAA',
        color: 'white',
        border: 'none',
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },

    // Assignments
    assignmentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },

    assignmentCard: {
        padding: '1.5rem',
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
    },

    assignmentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },

    assignmentTitle: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0',
    },

    assignmentStatus: {
        display: 'flex',
        gap: '0.5rem',
    },

    statusSubmitted: {
        backgroundColor: '#ECFDF5',
        color: '#22C55E',
        padding: '0.3rem 0.8rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },

    statusPendingAssignment: {
        backgroundColor: '#FEF3C7',
        color: '#F59E0B',
        padding: '0.3rem 0.8rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },

    assignmentDate: {
        color: '#666',
        fontSize: '0.9rem',
        margin: '0 0 1rem 0',
    },

    submitButton: {
        backgroundColor: '#1B9AAA',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },

    // Progress Details
    progressDetailCard: {
        backgroundColor: '#F9FAFB',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        marginBottom: '1.5rem',
    },

    progressDetailTitle: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0 0 1.5rem 0',
    },

    progressDetailContent: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'center',
    },

    progressLarge: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
    },

    progressBarContainerLarge: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: '#E5E7EB',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    progressBarLarge: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#1B9AAA',
    },

    progressLargeText: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1B9AAA',
    },

    progressStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
    },

    statItem: {
        textAlign: 'center',
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '8px',
    },

    statLabel: {
        fontSize: '0.85rem',
        color: '#666',
        margin: '0 0 0.5rem 0',
    },

    statValue: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0',
    },

    certificateCard: {
        backgroundColor: '#FEF3C7',
        border: '2px solid #F59E0B',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center',
    },

    certificateTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#D97706',
        margin: '0 0 0.5rem 0',
    },

    certificateText: {
        color: '#92400E',
        margin: '0 0 1rem 0',
    },

    certificateButton: {
        backgroundColor: '#D97706',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },

    emptyState: {
        textAlign: 'center',
        padding: '3rem 2rem',
        color: '#666',
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
        padding: '2rem',
        backgroundColor: '#FEE2E2',
        border: '1px solid #FCA5A5',
        borderRadius: '8px',
        color: '#DC2626',
    },
};

export default StudentCourseContent;


