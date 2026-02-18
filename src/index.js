import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Remova o StrictMode para testar a estabilidade da conexão
root.render(
    <App />
);