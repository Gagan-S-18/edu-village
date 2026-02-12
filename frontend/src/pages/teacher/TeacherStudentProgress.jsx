import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TeacherStudentProgress = () => {
    const { id } = useParams();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudentProgress();
    }, [id]);

    const fetchStudentProgress = async () => {
        try {
            const token = localStorage.getItem('access');
            const response = await axios.get(`https://edu-village-6j7f.onrender.com/api/courses/teacher/${id}/students-progress/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourseData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching student progress');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!courseData) return <div>Course not found</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>{courseData.course_title}</h1>
            <p><strong>Total Students: {courseData.total_students}</strong></p>

            {courseData.students.length === 0 ? (
                <p>No students enrolled in this course yet.</p>
            ) : (
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Student Name</th>
                            <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Completed</th>
                            <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Total</th>
                            <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Progress %</th>
                            <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courseData.students.map((student, index) => (
                            <tr key={student.student_id} style={{
                                backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                                borderBottom: '1px solid #ddd'
                            }}>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                    {student.student_name}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                                    {student.completed_content}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                                    {student.total_content}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            backgroundColor: '#ddd',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            height: '20px'
                                        }}>
                                            <div style={{
                                                width: `${student.progress_percentage}%`,
                                                backgroundColor: '#4CAF50',
                                                height: '100%',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        <span style={{ minWidth: '40px' }}>
                                            {student.progress_percentage}%
                                        </span>
                                    </div>
                                </td>
                                <td style={{
                                    padding: '12px',
                                    textAlign: 'center',
                                    border: '1px solid #ddd',
                                    color: student.is_completed ? '#4CAF50' : '#FF9800',
                                    fontWeight: 'bold'
                                }}>
                                    {student.is_completed ? '✓ Completed' : 'In Progress'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TeacherStudentProgress;
