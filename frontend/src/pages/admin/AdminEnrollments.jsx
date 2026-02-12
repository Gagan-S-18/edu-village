import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";



function AdminEnrollments() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await axios.get(
        "https://edu-village-6j7f.onrender.com//api/enrollments/admin/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEnrollments(res.data);
    } catch (err) {
      console.error("Failed to fetch enrollments", err);
    } finally {
      setLoading(false);
    }
  };

  fetchEnrollments();
}, []);

  <tbody>
  {loading ? (
    <tr>
      <td colSpan="5">Loading enrollments...</td>
    </tr>
  ) : enrollments.length === 0 ? (
    <tr>
      <td colSpan="5">No enrollments found</td>
    </tr>
  ) : (
    enrollments.map((e) => (
      <tr key={e.id}>
        <td>{e.student}</td>
        <td>{e.course}</td>
        <td>{e.status}</td>
        <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
      </tr>
    ))
  )}
</tbody>

  return (
    <div className="admin-enrollments-page">
      <h2>Admin Enrollments</h2>

      {/* ✅ Back button (already discussed) */}
      <button
        className="back-btn"
        onClick={() => navigate("/admin/dashboard")}
      >
        ← Back to Dashboard
      </button>

      {/* ✅ ADD: Enrollments Table */}
      <div className="enrollments-table-wrapper">
        <table className="enrollments-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Teacher</th>
              <th>Status</th>
              <th>Enrolled Date</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id}>
                <td>{e.student}</td>
                <td>{e.course}</td>
                <td>{e.teacher}</td>
                <td>
                  <span className={`status ${e.status.toLowerCase()} `}>
                    {e.status}
                  </span>
                </td>
                <td>{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminEnrollments;