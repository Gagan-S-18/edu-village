import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadContentModal from '../../components/UploadContentModal';

const AddContent = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [activeContentType, setActiveContentType] = useState(null);

    useEffect(() => {
        fetchTeacherCourses();
    }, []);

    const fetchTeacherCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('access');
            if (!token) {
                setError('Authentication token not found');
                setLoading(false);
                return;
            }

            const response = await axios.get('https://edu-village-6j7f.onrender.com//api/courses/teacher/add-content-courses/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVideo = () => {
        setActiveContentType('video');
        setUploadModalOpen(true);
    };

    const handleAddPDF = () => {
        setActiveContentType('pdf');
        setUploadModalOpen(true);
    };

    const handleAddAssignment = () => {
        setActiveContentType('assignment');
        setUploadModalOpen(true);
    };

    const handleUploadSuccess = (data) => {
        // Optionally refresh courses or show success message
        console.log('Content uploaded successfully:', data);
        setUploadModalOpen(false);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Add Course Content</h1>

            {error && (
                <div style={styles.error}>
                    <p>{error}</p>
                    <button onClick={fetchTeacherCourses} style={styles.retryButton}>
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <p style={styles.loading}>Loading courses...</p>
            ) : (
                <>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Select Course:</label>
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            style={styles.select}
                        >
                            <option value="">-- Choose a course --</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {courses.length === 0 && (
                        <p style={styles.noCourses}>
                            No courses found. Create a course first.
                        </p>
                    )}

                    {selectedCourseId && (
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleAddVideo}
                                style={styles.button}
                            >
                                Add Video
                            </button>
                            <button
                                onClick={handleAddPDF}
                                style={styles.button}
                            >
                                Add PDF
                            </button>
                            <button
                                onClick={handleAddAssignment}
                                style={styles.button}
                            >
                                Add Assignment
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Upload Modal */}
            <UploadContentModal
                isOpen={uploadModalOpen && !!selectedCourseId}
                courseId={selectedCourseId}
                contentType={activeContentType}
                onClose={() => setUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
};



const styles = {
    container: {
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
    },
    heading: {
        fontSize: '2rem',
        marginBottom: '1.5rem',
        color: '#333',
    },
    error: {
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        padding: '1rem',
        marginBottom: '1rem',
        color: '#c33',
    },
    retryButton: {
        backgroundColor: '#c33',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '0.5rem',
        fontSize: '0.9rem',
    },
    loading: {
        fontSize: '1rem',
        color: '#666',
        textAlign: 'center',
        margin: '2rem 0',
    },
    formGroup: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 'bold',
        color: '#333',
    },
    select: {
        width: '100%',
        padding: '0.75rem',
        fontSize: '1rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box',
    },
    noCourses: {
        backgroundColor: '#efefef',
        padding: '1rem',
        borderRadius: '4px',
        color: '#666',
        textAlign: 'center',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1.5rem',
        flexWrap: 'wrap',
    },
    button: {
        flex: '1',
        minWidth: '120px',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
};

export default AddContent;
