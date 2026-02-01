// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
console.log("API BASE URL:", process.env.REACT_APP_API_URL);


// 👉 Interceptor de REQUEST (token)
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 👉 Interceptor de RESPONSE (plano / empresa)
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 403) {
      switch (code) {
        case "TRIAL_EXPIRED":
          window.location.href = "/trial-expired";
          break;

        case "SUBSCRIPTION_EXPIRED":
          window.location.href = "/subscription-expired";
          break;

        case "PLAN_SUSPENDED":
          window.location.href = "/plan-suspended";
          break;

        default:
          window.location.href = "/blocked";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
