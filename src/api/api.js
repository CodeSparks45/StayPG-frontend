import axios from "axios";

const API = axios.create({
  // Ye raha tumhara live backend URL
  baseURL: "https://staypg-backend.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;