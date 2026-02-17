// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});


/* ==================================================
   🔐 INTERCEPTOR DE REQUEST (envia token automaticamente)
================================================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ==================================================
   🚨 INTERCEPTOR DE RESPONSE (trata erros globais)
================================================== */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    console.error("Erro global interceptado:", {
      status,
      data: error.response?.data,
    });

    /* ========================
       🔴 401 → Token inválido
    ========================= */
    if (status === 401) {
      console.warn("Token inválido ou expirado. Redirecionando para login...");

      localStorage.removeItem("token");

      // Evita loop infinito se já estiver no login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    /* ========================
       🟠 403 → Bloqueios de plano
    ========================= */
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
