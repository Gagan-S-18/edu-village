// src/utils/auth.js

const API_BASE = "https://edu-village-6j7f.onrender.com/api";

// get token
export const getToken = () => {
  return localStorage.getItem("access");
};

// check login
export const isLoggedIn = () => {
  return !!getToken();
};

// get current user (role, username)
export const getCurrentUser = async () => {
  const token = getToken();

  if (!token) {
    console.log("DEBUG auth - No token found");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log("DEBUG auth - API response not ok, status:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("DEBUG auth - User data from API:", data);
    return data; // { id, username, role }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// logout
export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};