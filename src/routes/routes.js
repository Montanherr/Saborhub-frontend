import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";

import Companies from "../components/Companies/Companies";
import CategoriesScreen from "../components/Menu/Categories";
import MenuCreate from "../pages/Menu/MenuCreate";

import Login from "../pages/Login/Login";
import Reports from "../pages/Reports/Reports.jsx";
import Register from "../pages/Login/Register.jsx";
import Tables from "../pages/Table/Table.jsx";
import Administrator from "../pages/Administrator/Index";
import Home from "../pages/Home/HomePublic";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/companies" element={<Companies />} />
      <Route
        path="/companies/:companyId/categories"
        element={<CategoriesScreen />}
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={["admin", "manager"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/administrator"
        element={
          <ProtectedRoute roles={["admin", "manager"]}>
            <Administrator />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tables"
        element={
          <ProtectedRoute roles={["admin", "manager", "waiter"]}>
            <Tables />
          </ProtectedRoute>
        }
      />

      <Route
        path="/menu/create"
        element={
          <ProtectedRoute  roles={["admin", "manager"]}>
            <MenuCreate />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
