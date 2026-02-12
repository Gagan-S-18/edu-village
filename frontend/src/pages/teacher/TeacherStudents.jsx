import { useEffect, useState } from "react";
import "./TeacherStudents.css";

function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await fetch(
          "https://edu-village-6j7f.onrender.com//api/enrollments/teacher/students/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStudents();
  }, []);

  return (
  <div className="teacher-students-page">
    <h2 className="page-title">My Students</h2>

    <div className="table-wrapper">
      <table className="students-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.student_id}>
              <td>{s.student_name}</td>
              <td>{s.course_title}</td>
              <td>
                <span className={`status-badge ${s.status.toLowerCase()}`}>
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}

export default TeacherStudents;