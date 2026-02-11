import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import "../styles/auth-form.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // STEP 1: Get JWT token
      const tokenResponse = await fetch("https://edu-village-6j7f.onrender.com/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!tokenResponse.ok) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      const tokenData = await tokenResponse.json();

      // Save tokens
      localStorage.setItem("access", tokenData.access);
      localStorage.setItem("refresh", tokenData.refresh);

      // STEP 2: Fetch logged-in user profile (ROLE & TEACHER_STATUS)
      const profileRes = await fetch(
        "http://127.0.0.1:8000/api/users/me/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenData.access}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!profileRes.ok) {
        setError("Failed to fetch user profile");
        setLoading(false);
        return;
      }

      const profile = await profileRes.json();

      // Save user info to localStorage
      localStorage.setItem("user_id", profile.id);
      localStorage.setItem("role", profile.role);
      localStorage.setItem("username", profile.username);
      localStorage.setItem("teacher_status", profile.teacher_status || "");

      // STEP 3: Role-based redirect with teacher_status check
      if (profile.role === "student") {
        window.location.href = "/student/dashboard";
      } else if (profile.role === "teacher") {
        // Check if teacher is approved
        if (profile.teacher_status === "approved") {
          window.location.href = "/teacher/dashboard";
        } else if (profile.teacher_status === "pending") {
          window.location.href = "/teacher/pending-approval";
        } else if (profile.teacher_status === "rejected") {
          setError("Your teacher account has been rejected. Contact admin for more information.");
          setLoading(false);
          return;
        }
      } else if (profile.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        setError("Role not recognized");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back">
      {/* Error message */}
      {error && <div className="auth-error-message">{error}</div>}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Username field */}
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Password field */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          className="form-submit-btn"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Signup link */}
      <div className="auth-footer-link">
        <p className="auth-footer-text">
          Don't have an account?{" "}
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => navigate("/signup")}
            disabled={loading}
          >
            Sign up here
          </button>
        </p>
      </div>

      {/* Demo credentials hint */}
      <div className="auth-hint">
        <p className="auth-hint-text">
          Demo: Use any registered user credentials
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;