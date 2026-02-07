import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user profile from localStorage (already stored from login)
        const token = localStorage.getItem('access');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');

        if (!token) {
            navigate('/login');
            return;
        }

        setUser({
            username: username || 'User',
            role: role || 'student'
        });
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    // Role-based greeting message
    const getRoleMessage = () => {
        const messages = {
            student: "Ready to continue your learning journey?",
            teacher: "Manage your courses and track student progress.",
            admin: "Oversee the entire EduVillage platform."
        };
        return messages[user.role] || messages.student;
    };

    // Role-based quick actions
    const getQuickActions = () => {
        const baseActions = [
            {
                id: 'my-courses',
                title: 'My Courses',
                icon: '📚',
                route: user.role === 'teacher' ? '/teacher/courses' : '/student/courses',
                color: 'action-teal'
            },
            {
                id: 'profile',
                title: 'Profile',
                icon: '👤',
                route: '/profile',
                color: 'action-blue'
            }
        ];

        if (user.role === 'teacher') {
            baseActions.push({
                id: 'dashboard',
                title: 'Dashboard',
                icon: '📊',
                route: '/teacher/dashboard',
                color: 'action-purple'
            });
        } else if (user.role === 'student') {
            baseActions.push({
                id: 'dashboard',
                title: 'Dashboard',
                icon: '🎯',
                route: '/student/dashboard',
                color: 'action-purple'
            });
        } else if (user.role === 'admin') {
            baseActions.push({
                id: 'dashboard',
                title: 'Admin Panel',
                icon: '⚙️',
                route: '/admin/dashboard',
                color: 'action-purple'
            });
        }

        return baseActions;
    };

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="home-page">
            {/* Top Navigation */}
            {/* <nav className="home-navbar">
                <div className="navbar-container"> */}
                    <div className="navbar-logo">
                        {/* <span className="logo-icon">🎓</span>
                        <span className="logo-text">EduVillage</span> */}
                    </div>
                    <div className="navbar-user">
                        {/* <span className="user-name">{user.username}</span> */}
                        {/* <button 
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logouttt
                        </button> */}
                    </div>
                {/* </div>
            </nav> */}

            {/* Welcome Section */}
            <section className="welcome-section">
                <div className="welcome-container">
                    <div className="welcome-content">
                        <h1 className="welcome-title">
                            Welcome back, <span className="username">{user.username}</span>!
                        </h1>
                        <p className="welcome-message">
                            {getRoleMessage()}
                        </p>
                    </div>
                    <div className="welcome-decorative">
                        <div className="decoration-shape shape-1"></div>
                        <div className="decoration-shape shape-2"></div>
                    </div>
                </div>
             </section> 

            {/* Quick Actions Section */}
            <section className="quick-actions-section">
                <div className="section-container">
                    <h2 className="section-heading">Quick Actions</h2>
                    <div className="actions-grid">
                        {getQuickActions().map(action => (
                            <button
                                key={action.id}
                                className={`action-card ${action.color}`}
                                onClick={() => navigate(action.route)}
                            >
                                <div className="action-icon">{action.icon}</div>
                                <div className="action-title">{action.title}</div>
                                <div className="action-arrow">→</div>
                            </button>
                        ))}
                    </div>
                </div>
           </section>

            {/* Role-Specific Content Section */}
            <section className="content-section">
                <div className="section-container">
                    <h2 className="section-heading">
                        {user.role === 'student' ? 'Continue Learning' : 
                         user.role === 'teacher' ? 'Your Teaching Dashboard' :
                         'Platform Overview'}
                    </h2>
                    <div className="content-info">
                        <div className="info-box">
                            <h3 className="info-title">Get Started</h3>
                            <p className="info-text">
                                {user.role === 'student' 
                                    ? 'Browse available courses and enroll in subjects that interest you. Track your progress and earn certificates upon completion.'
                                    : user.role === 'teacher'
                                    ? 'Create new courses, upload learning materials, and monitor your students\' progress in real-time.'
                                    : 'Manage users, courses, and monitor platform activity to ensure smooth operations.'}
                            </p>
                            <button 
                                className="info-btn"
                                onClick={() => navigate(user.role === 'teacher' ? '/teacher/dashboard' : 
                                                       user.role === 'admin' ? '/admin/dashboard' :
                                                       '/student/dashboard')}
                            >
                                Go to Dashboard →
                            </button>
                        </div>
                    </div>
                </div>
            </section> 

            {/* Footer */}
            <footer className="home-footer">
                <p>&copy; 2024 EduVillage. Your platform for learning and growth.</p>
            </footer>
        </div>
    );
};

export default Home;
