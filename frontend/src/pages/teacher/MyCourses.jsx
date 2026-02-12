import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/teacher-courses.css';

const TeacherMyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [courseProgress, setCourseProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const API_BASE = 'https://edu-village-6j7f.onrender.com//api';

    useEffect(() => {
        const fetchCoursesAndProgress = async () => {
            try {
                const token = localStorage.getItem('access');
                if (!token) {
                    setError('Authentication token not found');
                    setLoading(false);
                    return;
                }

                // Fetch all courses
                const coursesRes = await axios.get(`${API_BASE}/courses/teacher/my-courses/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Courses fetched:', coursesRes.data);
                setCourses(coursesRes.data);

                // Fetch progress for each course
                const progressData = {};
                for (const course of coursesRes.data) {
                    try {
                        const progressRes = await axios.get(
                            `${API_BASE}/courses/teacher/${course.id}/students-progress/`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        console.log(`Progress for course ${course.id}:`, progressRes.data);
                        progressData[course.id] = progressRes.data;
                    } catch (err) {
                        console.warn(`Error fetching progress for course ${course.id}:`, err.response?.status);
                        progressData[course.id] = { total_students: 0, students: [] };
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

        fetchCoursesAndProgress();
    }, []);

    const calculateAverageProgress = (courseId) => {
        const data = courseProgress[courseId];
        if (!data || !data.students || data.students.length === 0) {
            return 0;
        }
        const total = data.students.reduce((sum, s) => sum + s.progress_percentage, 0);
        return Math.round(total / data.students.length);
    };

    const getTotalEnrolled = (courseId) => {
        const data = courseProgress[courseId];
        return data ? data.total_students : 0;
    };

    if (loading) {
        return (
            <div className="teacher-courses-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="teacher-courses-container">
                <div className="error-state">
                    <h2>Error Loading Courses</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="teacher-courses-container">
                <div className="page-header">
                    <h1>My Courses</h1>
                </div>
                <div className="empty-state">
                    <p>You haven't created any courses yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="teacher-courses-container">
            <div className="page-header">
                <h1>Student Progress</h1>
                <p className="subtitle">Manage and track your courses</p>
            </div>

            <div className="courses-grid">
                {courses.map(course => {
                    const avgProgress = calculateAverageProgress(course.id);
                    const totalEnrolled = getTotalEnrolled(course.id);

                    return (
                        <div key={course.id} className="course-card">
                            <div className="card-header">
                                <h2 className="course-title">{course.title}</h2>
                            </div>

                            <div className="card-body">
                                <div className="course-meta">
                                    <span className="meta-item">
                                        <span className="meta-label">Students Enrolled</span>
                                        <span className="meta-value">{totalEnrolled}</span>
                                    </span>
                                </div>

                                {totalEnrolled > 0 ? (
                                    <div className="progress-section">
                                        <div className="progress-header">
                                            <span className="progress-label">Class Progress</span>
                                            <span className="progress-percentage">{avgProgress}%</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${avgProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-students-message">
                                        <p>No students enrolled yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/teacher/courses/${course.id}`)}
                                >
                                    Course Details
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate(`/teacher/courses/${course.id}/students`)}
                                    disabled={totalEnrolled === 0}
                                >
                                    View Students
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeacherMyCourses;