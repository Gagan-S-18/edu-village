import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/manage-courses.css";

function ManageCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teacher, setTeachers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState(null);

  useEffect(() => {
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");

      if (!token) {
        setError("No token found. Please login again.");
        return;
      }

      const response = await fetch(
        "https://edu-village-6j7f.onrender.com/api/courses/admin/courses",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        setError("Unauthorized - Admin access required");
        return;
      }

      const data = await response.json();
      setCourses(data);
      setError("");
    } catch (error) {
      console.error("Error loading courses:", error);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  fetchCourses();
}, []);



  useEffect(() => {
  const token = localStorage.getItem("access");
  if (!token) return;

  fetch("https://edu-village-6j7f.onrender.com/api/users/admin/teachers/approved/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setTeachers(data);
    })
    .catch(() => {
      console.error("Failed to load approved teachers");
    });
}, []);

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(
        `https://edu-village-6j7f.onrender.com/api/courses/admin/courses/${courseId}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Delete failed");
        setTimeout(() => setError(""), 5000);
        return;
      }

      setCourses(courses.filter((c) => c.id !== courseId));
      setSuccess("Course deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Server error - Failed to delete course");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleAssignTeacher = async (courseId, teacherId) => {
  if (!teacherId) return;

  setAssigningCourse(courseId);
  try {
    const res = await fetch(
      `https://edu-village-6j7f.onrender.com/api/courses/admin/courses/${courseId}/assign-teacher`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacher_id: teacherId }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to assign teacher");
      setTimeout(() => setError(""), 5000);
      setAssigningCourse(null);
      return;
    }

    // Update UI with assigned teacher
    const assignedTeacher = teacher.find((t) => t.id === Number(teacherId));
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              instructor: assignedTeacher?.username || c.instructor,
              instructor_id: assignedTeacher?.id,
            }
          : c
      )
    );

    setSuccess(`Teacher assigned successfully`);
    setTimeout(() => setSuccess(""), 3000);
    setAssigningCourse(null);
  } catch {
    setError("Server error - Failed to assign teacher");
    setTimeout(() => setError(""), 5000);
    setAssigningCourse(null);
  }
};

  return (
    <div className="page">
      <h1>Manage Courses</h1>
      
      {/* Toast Notifications */}
      {success && <div className="toast toast-success">{success}</div>}
      {error && <div className="toast toast-error">{error}</div>}
      
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => navigate('/admin/create-course')}
          className="btn btn-primary"
        >
          ➕ Create New Course
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", fontSize: "1rem", color: "#666" }}>Loading courses...</p>
      ) : !error && (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Instructor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                    No courses found. Create one to get started.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.title}</td>
                    <td>
                      <div className="instructor-cell">
                        <div className="instructor-name">
                          {course.instructor || "Not assigned"}
                        </div>
                        <select
                          className="teacher-select"
                          defaultValue=""
                          onChange={(e) =>
                            handleAssignTeacher(course.id, e.target.value)
                          }
                          disabled={assigningCourse === course.id}
                        >
                          <option value="">Assign teacher</option>
                          {teacher.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(course.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageCourses;