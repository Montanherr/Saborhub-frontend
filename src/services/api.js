// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://saborhub-backend-f7c4f594841a.herokuapp.com/api", // ajuste se necessário
});

export default api;
