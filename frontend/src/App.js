import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/auth/Signup";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import PendingApproval from "./pages/teacher/PendingApproval";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminCreateCourse from "./pages/admin/AdminCreateCourse";
import AdminUsers from "./pages/admin/AdminUsers";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCourses from "./pages/admin/ManageCourses";
import TeacherMyCourses from "./pages/teacher/MyCourses";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import TeacherAddContent from "./pages/teacher/TeacherAddContent";
import AddContent from "./pages/teacher/AddContent";
import TeacherStudentProgress from "./pages/teacher/TeacherStudentProgress";
import NotificationsPage from "./pages/NotificationsPage";
import "./styles/ui-polish.css";
import StudentMyCourses from "./pages/student/StudentMyCourses";
import StudentCourseContent from "./pages/student/StudentCourseContent";
import BrowseCourses from "./pages/student/BrowseCourses";
import YourCertificates from "./pages/student/YourCertificates";
import { ToastContainer, toast } from 'react-toastify';
import ChangePassword from "./pages/ChangePassword";

// Layout components
import AuthLayout from "./components/layouts/AuthLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";
import TeacherStudents from "./pages/teacher/TeacherStudents";

/**
 * App Component - Main routing configuration with Teacher Approval Flow
 * 
 * Route Structure:
 * 1. Public routes: Landing, Login, Signup
 * 2. Teacher approval: /teacher/pending-approval
 * 3. Protected routes with DashboardLayout: All dashboards and course pages
 * 
 * Teacher Approval Flow:
 * - Student signup: role='student' → immediate dashboard access
 * - Teacher signup: role='teacher', teacher_status='pending' → blocked from dashboard
 * - Pending teacher login: redirected to /teacher/pending-approval
 * - Approved teacher: redirected to /teacher/dashboard
 * - Rejected teacher: cannot login
 */
function App() {
  // Get user info from localStorage for layout props
  const userRole = localStorage.getItem("role") || "student";
  const username = localStorage.getItem("username") || "User";
  const teacherStatus = localStorage.getItem("teacher_status") || "";
  const theme = localStorage.getItem("theme");
  if (theme) document.body.setAttribute("data-theme", theme);
  // ✅ ADD (below your existing theme code)
  const fontSize = localStorage.getItem("fontSize");
  if (fontSize) document.body.setAttribute("data-font", fontSize);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <BrowserRouter>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ==================== TEACHER APPROVAL ROUTE ==================== */}
          <Route
            path="/teacher/pending-approval"
            element={<PendingApproval />}
          />

          {/* ==================== HOME ROUTE ==================== */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <DashboardLayout userRole={userRole} username={username}>
                  <Home />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== NOTIFICATIONS ROUTE ==================== */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <DashboardLayout userRole={userRole} username={username}>
                  <NotificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== DASHBOARD ROUTES ==================== */}
          {/* All dashboard and course pages wrapped with DashboardLayout */}

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="student">
                  <DashboardLayout userRole="student" username={username}>
                    <StudentDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/browse"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="student">
                  <DashboardLayout userRole="student" username={username}>
                    <BrowseCourses />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="student">
                  <DashboardLayout userRole="student" username={username}>
                    <StudentMyCourses />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="student">
                  <DashboardLayout userRole="student" username={username}>
                    <StudentCourseContent />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="teacher">
                  <DashboardLayout userRole="teacher" username={username}>
                    <TeacherDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="teacher">
                  <DashboardLayout userRole="teacher" username={username}>
                    <TeacherMyCourses />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
  path="/teacher/students"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRole="teacher">
        <DashboardLayout userRole="teacher" username={username}>
          <TeacherStudents />
        </DashboardLayout>
      </RoleRoute>
    </ProtectedRoute>
  }
          />
          <Route
            path="/teacher/add-content"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="teacher">
                  <DashboardLayout userRole="teacher" username={username}>
                    <AddContent />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="teacher">
                  <DashboardLayout userRole="teacher" username={username}>
                    <TeacherCourseDetail />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:id/add-content"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="teacher">
                  <DashboardLayout userRole="teacher" username={username}>
                    <TeacherAddContent />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:id/students"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="teacher">
                  <DashboardLayout userRole="teacher" username={username}>
                    <TeacherStudentProgress />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="admin">
                  <DashboardLayout userRole="admin" username={username}>
                    <AdminDashboard />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/enrollments"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="admin">
                  <DashboardLayout userRole="admin" username={username}>
                    <AdminEnrollments />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="admin">
                  <ManageUsers />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          {/* <Route
          path="/admin/manage-users"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <DashboardLayout userRole="admin" username={username}>
                  <ManageUsers />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          } 
        /> */}
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="admin">
                  <DashboardLayout userRole="admin" username={username}>
                    <ManageCourses />
                  </DashboardLayout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-course"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRole="admin">
                  <AdminCreateCourse />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="/change-password" element={<ChangePassword />} />

          {/* ==================== CATCH-ALL ==================== */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;