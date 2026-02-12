import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherAddContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content_type: 'video',
        file_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access');
            await axios.post(`https://edu-village-6j7f.onrender.com//api/courses/teacher/${id}/content/`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/teacher/courses/${id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Error uploading content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Add Course Content</h1>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Content Type:</label>
                    <select name="content_type" value={formData.content_type} onChange={handleChange}>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="link">Link</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label>File URL:</label>
                    <input
                        type="url"
                        name="file_url"
                        value={formData.file_url}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Add Content'}
                </button>
            </form>
        </div>
    );
};

export default TeacherAddContent;
