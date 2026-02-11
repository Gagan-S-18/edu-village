import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/layouts.css';
import NotificationBell from '../../components/NotificationBell';
import SettingsModal from "../SettingsModal";
import "../../styles/profile-dropdown.css";


/**
 * DashboardLayout - Wrapper for all Dashboard pages (Student, Teacher, Admin)
 * Features:
 * - Top navigation bar with user info and logout
 * - Left sidebar with role-based navigation
 * - Main content area for children components
 * - Responsive design (sidebar collapses on mobile)
 * - Active route highlighting
 */
const DashboardLayout = ({ userRole = 'student', username = 'User', children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);




    // ✅ ADD: get logged-in user safely
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    // ✅ ADD THIS FUNCTION (DO NOT CHANGE ANYTHING ELSE)
    const toggleProfile = () => {
        setProfileOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            console.log("clicked:", e.target)
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login');
    };

    // ✅ ADD: change password
    const handleChangePassword = () => {
        navigate("/change-password"); // route later if needed
        setProfileOpen(false);
    };

    // ✅ ADD: settings
    const handleSettings = () => {
        navigate("/settings"); // or open modal later
        setProfileOpen(false);
    };

    const handleLogoClick = () => {
        navigate('/home');
    };

    // Role-based navigation menu items
    const getMenuItems = () => {
        const baseMenu = [
            { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
            // { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
        ];

        if (userRole === 'student') {
            return [
                ...baseMenu,
                { id: 'courses', label: 'My Courses', icon: '📚', path: '/student/courses' },
                { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/student/dashboard' },
            ];
        } else if (userRole === 'teacher') {
            return [
                ...baseMenu,
                { id: 'courses', label: 'My Courses', icon: '📚', path: '/teacher/courses' },
                { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/teacher/dashboard' },
            ];
        } else if (userRole === 'admin') {
            return [
                ...baseMenu,
                { id: 'users', label: 'Manage Users', icon: '👥', path: '/admin/users' },
                { id: 'courses', label: 'Manage Courses', icon: '📚', path: '/admin/courses' },
                { id: 'dashboard', label: 'Dashboard', icon: '⚙️', path: '/admin/dashboard' },
            ];
        }
        return baseMenu;
    };

    const menuItems = getMenuItems();

    // Helper function to check if current route is active
    const isActive = (path) => {
        if (path === '/home') {
            return location.pathname === '/home';
        }
        return location.pathname.startsWith(path) && path !== '/profile';
    };



    // Close sidebar on mobile when route changes
    React.useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="dashboard-layout">
            {/* Top Navigation Bar */}
            <nav className="dashboard-navbar">
                <div className="navbar-left">
                    {/* Mobile menu toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title="Toggle menu"
                    >
                        ☰
                    </button>

                    {/* Logo */}
                    <button
                        className="dashboard-logo-btn"
                        onClick={handleLogoClick}
                        type="button"
                    >
                        <span className="dashboard-logo-icon">🎓</span>
                        <span className="dashboard-logo-text">EduVillage</span>
                    </button>
                </div>

                {/* Navbar right (user info) */}
                <div className="navbar-right">
                    {/* <div className="user-info"> */}

                    {/* <span className="user-role">{userRole}</span> */}
                    {/* <span className="user-name">{username}</span> */}


                    <div className="notification-bell-container">
                        <NotificationBell />



                        <div className="profile-wrapper">
                            <button
                                className="profile-btn"
                                onClick={() => setProfileOpen((prev) => !prev)}
                                aria-label="Profile"
                            >
                                👤
                            </button>
                            {profileOpen && (
                                <div className="profile-dropdown" ref={profileRef}>
                                    <div className="profile-header">
                                        <div className="role">Role: admin</div>
                                        <div className="email">Email: admin@gmail.com</div>
                                    </div>

                                    <div className="profile-item" onClick={() => {
                                        setProfileOpen(false);
                                        navigate("/change-password");
                                    }}> Change Password </div>

                                    <div className="profile-item" onClick={() => {
                                        setSettingsOpen(true);
                                    }}> Settings </div>

                                    <div className="profile-divider" />
                                    <div>
                                        {/* ✅ Settings Modal */}
                                        <SettingsModal
                                            open={settingsOpen}
                                            onClose={() => setSettingsOpen(false)}
                                        />
                                    </div>

                                    <button className="profile-logout" onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Layout Container */}
            <div className="dashboard-main">
                {/* Left Sidebar */}
                <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-content">
                        <h3 className="sidebar-title">Navigation</h3>
                        <ul className="sidebar-menu">
                            {menuItems.map(item => (
                                <li key={item.id} className="sidebar-menu-item">
                                    <button
                                        className={`sidebar-menu-link ${isActive(item.path) ? 'active' : ''}`}
                                        onClick={() => {
                                            navigate(item.path);
                                            setSidebarOpen(false); // Close on mobile
                                        }}
                                    >
                                        <span className="menu-icon">{item.icon}</span>
                                        <span className="menu-label">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sidebar footer info */}
                    <div className="sidebar-footer">
                        <button
                            className="sidebar-logout-btn"
                            onClick={handleLogout}
                            title="Logout from EduVillage"
                        >
                            <span className="menu-icon">🚪</span>
                            <span>Logout</span>
                        </button>
                        <p className="sidebar-footer-text">EduVillage v1.0</p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="dashboard-content">
                    <div className="content-wrapper">
                        {/* Render children components */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
