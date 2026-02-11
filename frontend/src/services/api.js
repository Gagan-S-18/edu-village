// API service layer (placeholder for Phase-1)
// To be populated with API calls in Phase-2

import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export default API;