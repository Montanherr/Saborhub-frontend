import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";

import Companies from "../components/Companies/Companies";
import CategoriesScreen from "../components/Menu/Categories";

import Login from "../pages/Login/Login";
import Register from "../pages/Login/Register";
import Home from "../pages/Home/HomePublic";

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/companies" element={<Companies />} />
      <Route path="/companies/:companyId/categories" element={<CategoriesScreen />} />

      <Route
        path="/menu/create"
        element={
          <ProtectedRoute>
            <h1>CRIAR CARDÁPIO</h1>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
