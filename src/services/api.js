// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://saborhub-backend-f7c4f594841a.herokuapp.com/api", // ajuste se necessário
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
