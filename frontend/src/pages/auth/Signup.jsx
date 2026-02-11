import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layouts/AuthLayout";
import "../../styles/auth-form.css";

/**
 * Signup Page - User registration with role selection
 * Features:
 * - Student signup: Immediate activation
 * - Teacher signup: Requires admin approval (with qualification details)
 * - Password validation
 */
function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    role: "student",
    qualification: "",
    subject: "",
    experience: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("Username, email, and password are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Teacher validation
    if (formData.role === "teacher") {
      if (!formData.qualification || !formData.subject || !formData.experience) {
        setError("All teacher fields are required");
        setLoading(false);
        return;
      }
    }

    try {
      // Send registration data
      const response = await fetch("http://127.0.0.1:8000/api/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password_confirm,
          role: formData.role,
          qualification: formData.role === "teacher" ? formData.qualification : null,
          subject: formData.role === "teacher" ? formData.subject : null,
          experience: formData.role === "teacher" ? parseInt(formData.experience) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg =
          typeof errorData === "object"
            ? Object.values(errorData).flat().join(", ")
            : "Registration failed";
        setError(errorMsg);
        setLoading(false);
        return;
      }

      setSuccess(
        formData.role === "teacher"
          ? "✓ Teacher account created! Admin approval required. Redirecting to login..."
          : "✓ Student account created! Redirecting to login..."
      );

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = formData.role === "teacher";

  return (
    <AuthLayout title="Create Account">
      {/* Error message */}
      {error && <div className="auth-error-message">{error}</div>}

      {/* Success message */}
      {success && <div className="auth-success-message">{success}</div>}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Role Selection */}
        <div className="form-group">
          <label htmlFor="role" className="form-label">
            Sign up as
          </label>
          <select
            id="role"
            name="role"
            className="form-input form-select"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {isTeacher && (
            <p className="form-note">
              📋 Teacher accounts require admin approval before activation
            </p>
          )}
        </div>

        {/* Username field */}
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            className="form-input"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Email field */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className="form-input"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
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
            name="password"
            className="form-input"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Confirm Password field */}
        <div className="form-group">
          <label htmlFor="password_confirm" className="form-label">
            Confirm Password
          </label>
          <input
            id="password_confirm"
            type="password"
            name="password_confirm"
            className="form-input"
            placeholder="Repeat password"
            value={formData.password_confirm}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Teacher-specific fields */}
        {isTeacher && (
          <>
            <div className="form-group">
              <label htmlFor="qualification" className="form-label">
                Qualification
              </label>
              <input
                id="qualification"
                type="text"
                name="qualification"
                className="form-input"
                placeholder="e.g., Bachelor's in Mathematics"
                value={formData.qualification}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject" className="form-label">
                Subject/Expertise
              </label>
              <input
                id="subject"
                type="text"
                name="subject"
                className="form-input"
                placeholder="e.g., Mathematics, Physics"
                value={formData.subject}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience" className="form-label">
                Years of Experience
              </label>
              <input
                id="experience"
                type="number"
                name="experience"
                className="form-input"
                placeholder="e.g., 5"
                min="0"
                max="50"
                value={formData.experience}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="form-submit-btn"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      {/* Login link */}
      <div className="auth-footer-link">
        <p className="auth-footer-text">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Login here
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Signup;
