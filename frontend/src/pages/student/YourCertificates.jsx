import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const YourCertificates = () => {
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState({});
    const [downloadedCerts, setDownloadedCerts] = useState([]);



    useEffect(() => {
        fetchCertificates();

        // Optionally: Poll for new certificates every 5 seconds when on this page
        const refreshInterval = setInterval(() => {
            fetchCertificates();
        }, 5000);

        return () => clearInterval(refreshInterval);
    }, []);

    const fetchCertificates = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(
                'https://edu-village-6j7f.onrender.com/api/courses/student/certificates/',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCertificates(response.data.certificates || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching certificates:', err);
            setError('Failed to load certificates. Please try again.');
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async (certificateId, certificateName) => {
        console.log("Downloaded certs:", downloadedCerts);
        setDownloading(prev => ({ ...prev, [certificateId]: true }));

        try {
            const token = localStorage.getItem('access');

            const response = await fetch(
                `https://edu-village-6j7f.onrender.com/api/courses/student/certificates/${certificateId}/download/`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            const blob = await response.blob();

            // Verify blob has content
            if (blob.size === 0) {
                throw new Error('Certificate file is empty');
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${certificateName}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            // Show success ONLY after confirmed download
            toast.success('Certificate downloaded successfully!');
            setDownloadedCerts(prev => [...prev, certificateId]);
        } catch (err) {
            console.error('Error downloading certificate:', err);
            toast.error('Failed to download certificate. Please try again.');
        } finally {
            setDownloading(prev => ({ ...prev, [certificateId]: false }));
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <p>Loading your certificates...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button
                    style={styles.backButton}
                    onClick={() => navigate('/student/courses')}
                >
                    ← Back to My Courses
                </button>
                <h1 style={styles.pageTitle}>🏆 Your Certificates</h1>
                <p style={styles.pageSubtitle}>
                    View and download certificates for all completed courses
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div style={styles.errorMessage}>
                    <p>{error}</p>
                </div>
            )}

            {/* Certificates Grid */}
            {certificates.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📜</div>
                    <h2 style={styles.emptyTitle}>No Certificates Yet</h2>
                    <p style={styles.emptyText}>
                        Complete courses to earn certificates. Start by exploring available courses!
                    </p>
                    <button
                        style={styles.explorButton}
                        onClick={() => navigate('/student/courses')}
                    >
                        Explore Courses
                    </button>
                </div>
            ) : (
                <div style={styles.certificatesGrid}>
                    {certificates.map((certificate) => (
                        <div key={certificate.id} style={styles.certificateCard}>
                            <div style={styles.cardHeader}>
                                <div style={styles.certificateIcon}>📜</div>
                                <div style={styles.certificateInfo}>
                                    <h3 style={styles.courseName}>{certificate.course_title}</h3>
                                    <p style={styles.studentName}>
                                        Awarded to: {certificate.student_name}
                                    </p>
                                </div>
                            </div>

                            <div style={styles.cardBody}>
                                <div style={styles.dateBox}>
                                    <p style={styles.dateLabel}>Issued Date</p>
                                    <p style={styles.dateValue}>
                                        {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div style={styles.certificateIdBox}>
                                    <p style={styles.idLabel}>Certificate ID</p>
                                    <p style={styles.idValue}>#{certificate.id}</p>
                                </div>
                            </div>

                            <div style={styles.cardFooter}>
                                <button
                                    type="button"
                                    style={{
                                        ...styles.downloadButton,
                                        backgroundColor: downloadedCerts.includes(certificate.id)
                                            ? '#10B981'   // green
                                            : '#1B9AAA',
                                    }}
                                    title={
                                        downloadedCerts.includes(certificate.id)
                                            ? 'Download PDF'
                                            : 'Download Certificate'
                                    }
                                    onClick={() => handleDownloadCertificate(
                                        certificate.id,
                                        `Certificate_${ certificate.course_title }.pdf`
                                    )}
                                    disabled={downloading[certificate.id]}
                                >
                                    {downloading[certificate.id] ? (
                                        <>⏳ Downloading...</>
                                    ) : downloadedCerts.includes(certificate.id) ? (
                                        <>✅ Downloaded</>
                                    ) : (
                                        <> loadPDF</>
                                    )}
                                </button>                           
                                 </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Stats */}
            {certificates.length > 0 && (
                <div style={styles.summaryCard}>
                    <h3 style={styles.summaryTitle}>Your Achievement Summary</h3>
                    <div style={styles.statsGrid}>
                        <div style={styles.statBox}>
                            <p style={styles.statNumber}>{certificates.length}</p>
                            <p style={styles.statLabel}>Certificates Earned</p>
                        </div>
                        <div style={styles.statBox}>
                            <p style={styles.statNumber}>✓</p>
                            <p style={styles.statLabel}>All Courses Completed</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
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
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '2px solid rgba(27, 154, 170, 0.1)',
    },

    pageTitle: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0.5rem 0 0 0',
    },

    pageSubtitle: {
        fontSize: '1.1rem',
        color: '#666',
        margin: '0.5rem 0 0 0',
    },

    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '1rem',
    },

    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #E0E7FF',
        borderTop: '4px solid #1B9AAA',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },

    errorMessage: {
        backgroundColor: '#FEE2E2',
        border: '1px solid #FECACA',
        color: '#DC2626',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
    },

    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },

    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
    },

    emptyTitle: {
        fontSize: '1.5rem',
        color: '#142C52',
        fontWeight: 'bold',
        margin: '0 0 0.5rem 0',
    },

    emptyText: {
        fontSize: '1rem',
        color: '#666',
        marginBottom: '2rem',
        maxWidth: '500px',
        margin: '0 auto 2rem',
    },

    explorButton: {
        backgroundColor: '#1B9AAA',
        color: 'white',
        border: 'none',
        padding: '0.8rem 2rem',
        borderRadius: '6px',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },

    certificatesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },

    certificateCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        border: '2px solid transparent',
    },

    cardHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.5rem',
        backgroundColor: 'linear-gradient(135deg, #1B9AAA 0%, #142C52 100%)',
        backgroundImage: 'linear-gradient(135deg, #1B9AAA 0%, #142C52 100%)',
        color: 'white',
    },

    certificateIcon: {
        fontSize: '2.5rem',
        flexShrink: 0,
    },

    certificateInfo: {
        flex: 1,
        minWidth: 0,
    },

    courseName: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        margin: '0 0 0.3rem 0',
        color: 'white',
        wordBreak: 'break-word',
    },

    studentName: {
        fontSize: '0.9rem',
        margin: '0',
        opacity: '0.9',
    },

    cardBody: {
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },

    dateBox: {
        padding: '1rem',
        backgroundColor: '#F3F4F6',
        borderRadius: '8px',
        textAlign: 'center',
    },

    dateLabel: {
        fontSize: '0.85rem',
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        margin: '0 0 0.5rem 0',
    },

    dateValue: {
        fontSize: '1rem',
        color: '#142C52',
        fontWeight: 'bold',
        margin: '0',
    },

    certificateIdBox: {
        padding: '1rem',
        backgroundColor: '#F3F4F6',
        borderRadius: '8px',
        textAlign: 'center',
    },

    idLabel: {
        fontSize: '0.85rem',
        color: '#666',
        fontWeight: '600',
        textTransform: 'uppercase',
        margin: '0 0 0.5rem 0',
    },

    idValue: {
        fontSize: '1rem',
        color: '#142C52',
        fontWeight: 'bold',
        margin: '0',
        fontFamily: 'monospace',
    },

    cardFooter: {
        padding: '1.5rem',
        borderTop: '1px solid #E5E7EB',
    },

    downloadButton: {
        width: '100%',
        backgroundColor: '#1B9AAA',
        color: 'white',
        border: 'none',
        padding: '0.8rem 1rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        cursor: 'default',
        fontWeight: '600',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
    },

    summaryCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        marginTop: '2rem',
        border: '2px solid #E0E7FF',
    },

    summaryTitle: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: '0 0 1.5rem 0',
    },

    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
    },

    statBox: {
        padding: '1.5rem',
        backgroundColor: '#F3F4F6',
        borderRadius: '8px',
        textAlign: 'center',
        border: '2px solid #E0E7FF',
    },

    statNumber: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1B9AAA',
        margin: '0 0 0.5rem 0',
    },

    statLabel: {
        fontSize: '0.95rem',
        color: '#666',
        fontWeight: '600',
        margin: '0',
    },
};

export default YourCertificates;
