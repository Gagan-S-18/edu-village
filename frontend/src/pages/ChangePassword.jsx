import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match");
            return;
        }

        try {
            const token = localStorage.getItem("access");

            await axios.post(
                "https://edu-village-6j7f.onrender.com//api/users/change-password/",
                {
                    old_password: currentPassword,
                    new_password: newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // ✅ success
            alert("Password changed successfully");

            // ✅ force logout
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

            navigate("/login");
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.detail ||
                "Current password is incorrect"
            );
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "40px auto" }}>
            <h2>Change Password</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" style={{ marginTop: "15px" }}>
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;