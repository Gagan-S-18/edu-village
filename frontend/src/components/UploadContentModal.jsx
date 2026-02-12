import React, { useState } from 'react';
import axios from 'axios';

const UploadContentModal = ({ isOpen, courseId, contentType, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const getContentLabel = () => {
        const labels = {
            video: 'Video',
            pdf: 'PDF Document',
            assignment: 'Assignment'
        };
        return labels[contentType] || contentType;
    };

    const getFileAccept = () => {
        const accepts = {
            video: 'video/*',
            pdf: 'application/pdf',
            assignment: '*'
        };
        return accepts[contentType] || '*';
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            if (contentType === 'pdf' && !selectedFile.type.includes('pdf')) {
                setError('Please select a PDF file');
                setFile(null);
                return;
            }
            if (contentType === 'video' && !selectedFile.type.includes('video')) {
                setError('Please select a video file');
                setFile(null);
                return;
            }
            
            // Validate file size (max 100MB)
            if (selectedFile.size > 100 * 1024 * 1024) {
                setError('File size must be less than 100MB');
                setFile(null);
                return;
            }
            
            setError(null);
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Validate inputs
            if (!title.trim()) {
                setError('Title is required');
                setUploading(false);
                return;
            }

            if (!file && contentType !== 'link') {
                setError(`File is required for ${getContentLabel()}`);
                setUploading(false);
                return;
            }

            if (contentType === 'link' && !fileUrl.trim()) {
                setError('URL is required for link content');
                setUploading(false);
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('content_type', contentType);
            
            if (file) {
                formData.append('file', file);
            }
            
            if (fileUrl) {
                formData.append('file_url', fileUrl.trim());
            }

            // Send to backend
            const token = localStorage.getItem('access');
            const response = await axios.post(
                `https://edu-village-6j7f.onrender.com/api/courses/teacher/${courseId}/content/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Success
            setSuccessMessage(`${getContentLabel()} uploaded successfully!`);
            setTitle('');
            setFile(null);
            setFileUrl('');
            
            // Reset file input
            const fileInput = document.querySelector(`#file-input-${contentType}`);
            if (fileInput) fileInput.value = '';

            // Call success callback after short delay
            setTimeout(() => {
                if (onSuccess) onSuccess(response.data);
                handleClose();
            }, 1500);

        } catch (err) {
            const errorMessage = err.response?.data?.error || 
                                err.message || 
                                'Failed to upload content';
            setError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setFile(null);
        setFileUrl('');
        setError(null);
        setSuccessMessage(null);
        if (onClose) onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>Upload {getContentLabel()}</h2>
                    <button
                        onClick={handleClose}
                        style={styles.closeButton}
                        disabled={uploading}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Title Input */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Title:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={`Enter ${getContentLabel().toLowerCase()} title`}
                            style={styles.input}
                            disabled={uploading}
                        />
                    </div>

                    {/* File Input (for file types) */}
                    {contentType !== 'link' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Select {getContentLabel()} File:</label>
                            <input
                                id={`file-input-${contentType}`}
                                type="file"
                                accept={getFileAccept()}
                                onChange={handleFileChange}
                                style={styles.fileInput}
                                disabled={uploading}
                            />
                            {file && (
                                <p style={styles.fileName}>
                                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>
                    )}

                    {/* URL Input (for link type) */}
                    {contentType === 'link' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Link URL:</label>
                            <input
                                type="url"
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                                placeholder="https://example.com"
                                style={styles.input}
                                disabled={uploading}
                            />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div style={styles.error}>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div style={styles.success}>
                            <p>{successMessage}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={handleClose}
                            style={styles.cancelButton}
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={styles.submitButton}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : `Upload ${getContentLabel()}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        borderBottom: '1px solid #eee',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        color: '#333',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#666',
        padding: '0.25rem 0.5rem',
    },
    form: {
        padding: '1.5rem',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bold',
        color: '#333',
        fontSize: '0.95rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
    },
    fileInput: {
        width: '100%',
        padding: '0.75rem',
        border: '2px dashed #ddd',
        borderRadius: '4px',
        fontSize: '0.95rem',
        boxSizing: 'border-box',
    },
    fileName: {
        marginTop: '0.5rem',
        fontSize: '0.85rem',
        color: '#666',
    },
    error: {
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        padding: '0.75rem',
        marginBottom: '1rem',
        color: '#c33',
    },
    success: {
        backgroundColor: '#efe',
        border: '1px solid #cfc',
        borderRadius: '4px',
        padding: '0.75rem',
        marginBottom: '1rem',
        color: '#3c3',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        color: '#333',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
    },
    submitButton: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
    },
};

export default UploadContentModal;
