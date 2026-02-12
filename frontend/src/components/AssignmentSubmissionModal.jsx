import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * AssignmentSubmissionModal Component
 * 
 * Allows students to upload assignment files.
 * Features:
 * - File picker
 * - Shows submission status
 * - Allows resubmission
 * - Loading and error states
 */
const AssignmentSubmissionModal = ({ 
    assignment, 
    courseId, 
    onClose, 
    onSubmitSuccess 
}) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [submission, setSubmission] = useState(null);
    const [fetchingSubmission, setFetchingSubmission] = useState(true);

    // Fetch existing submission on mount
    useEffect(() => {
        fetchExistingSubmission();
    }, [assignment.id]);

    const fetchExistingSubmission = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await axios.get(
                `https://edu-village-6j7f.onrender.com/api/courses/student/assignments/${assignment.id}/submission/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.submitted) {
                setSubmission(response.data.submission);
            }
        } catch (err) {
            console.error('Error fetching submission:', err);
        } finally {
            setFetchingSubmission(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setError('Please select a file to submit');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access');
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `https://edu-village-6j7f.onrender.com/api/courses/student/assignments/${assignment.id}/submit/`,
                formData,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    } 
                }
            );

            setSuccess(true);
            setSubmission(response.data.submission);
            setFile(null);

            // Reset success message after 2 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 2000);

            // Notify parent component
            if (onSubmitSuccess) {
                onSubmitSuccess(response.data);
            }
        } catch (err) {
            setError(
                err.response?.data?.error || 
                'Error submitting assignment. Please try again.'
            );
            console.error('Error submitting assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingSubmission) {
        return (
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    <div style={styles.loadingState}>
                        <div style={styles.spinner}></div>
                        <p>Loading submission status...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>{assignment.title}</h2>
                    <button 
                        style={styles.closeButton}
                        onClick={onClose}
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Current Submission Status */}
                {submission && (
                    <div style={styles.submissionStatus}>
                        <div style={styles.statusIcon}>✓</div>
                        <div>
                            <p style={styles.statusText}>Previously Submitted</p>
                            <p style={styles.statusDate}>
                                Submitted on: {new Date(submission.submitted_at).toLocaleDateString()} at {new Date(submission.submitted_at).toLocaleTimeString()}
                            </p>
                            <p style={styles.statusFile}>
                                File: {submission.file.split('/').pop()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={styles.errorBox}>
                        <p style={styles.errorText}>{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div style={styles.successBox}>
                        <p style={styles.successText}>✓ Assignment submitted successfully!</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* File Input */}
                    <div style={styles.fileInputGroup}>
                        <label style={styles.label}>
                            {submission ? 'Replace Submission:' : 'Upload Submission:'}
                        </label>
                        <div style={styles.fileInputWrapper}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={styles.fileInput}
                                disabled={loading}
                                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                            />
                            <span style={styles.fileInputPlaceholder}>
                                {file ? file.name : 'Choose file (PDF, DOC, TXT, ZIP)'}
                            </span>
                        </div>
                        <p style={styles.fileNote}>
                            Supported: PDF, DOC, DOCX, TXT, ZIP (Max 50MB)
                        </p>
                    </div>

                    {/* Buttons */}
                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            style={styles.cancelButton}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={styles.submitButton}
                            disabled={loading || !file}
                        >
                            {loading ? 'Submitting...' : (submission ? 'Update Submission' : 'Submit Assignment')}
                        </button>
                    </div>
                </form>
            </div>

            {/* CSS Animation */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

// Styles
const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },

    modal: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        maxHeight: '90vh',
        overflowY: 'auto',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #E5E7EB',
    },

    title: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#142C52',
        margin: 0,
    },

    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#999',
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    submissionStatus: {
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#ECFDF5',
        border: '1px solid #A7F3D0',
        borderRadius: '6px',
        marginBottom: '1.5rem',
    },

    statusIcon: {
        fontSize: '1.5rem',
        color: '#22C55E',
        fontWeight: 'bold',
        minWidth: '30px',
    },

    statusText: {
        margin: '0 0 0.5rem 0',
        fontWeight: 'bold',
        color: '#22C55E',
        fontSize: '0.95rem',
    },

    statusDate: {
        margin: '0 0 0.25rem 0',
        color: '#666',
        fontSize: '0.85rem',
    },

    statusFile: {
        margin: '0',
        color: '#666',
        fontSize: '0.85rem',
        wordBreak: 'break-word',
    },

    errorBox: {
        padding: '1rem',
        backgroundColor: '#FEE2E2',
        border: '1px solid #FCA5A5',
        borderRadius: '6px',
        marginBottom: '1rem',
    },

    errorText: {
        margin: 0,
        color: '#DC2626',
        fontSize: '0.9rem',
    },

    successBox: {
        padding: '1rem',
        backgroundColor: '#ECFDF5',
        border: '1px solid #A7F3D0',
        borderRadius: '6px',
        marginBottom: '1rem',
    },

    successText: {
        margin: 0,
        color: '#22C55E',
        fontSize: '0.9rem',
        fontWeight: 'bold',
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },

    fileInputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },

    label: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#142C52',
    },

    fileInputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        border: '2px dashed #1B9AAA',
        borderRadius: '6px',
        padding: '1rem',
        backgroundColor: '#F9FAFB',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },

    fileInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer',
    },

    fileInputPlaceholder: {
        color: '#666',
        fontSize: '0.9rem',
        flex: 1,
    },

    fileNote: {
        margin: '0',
        fontSize: '0.8rem',
        color: '#999',
    },

    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
    },

    cancelButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#E5E7EB',
        color: '#666',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },

    submitButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1B9AAA',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },

    loadingState: {
        textAlign: 'center',
        padding: '2rem',
    },

    spinner: {
        display: 'inline-block',
        width: '30px',
        height: '30px',
        border: '3px solid #E5E7EB',
        borderTop: '3px solid #1B9AAA',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
    },
};

export default AssignmentSubmissionModal;
