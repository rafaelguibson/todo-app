import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // ou outro host do backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
