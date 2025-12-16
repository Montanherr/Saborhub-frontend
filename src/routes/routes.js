import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";

import Companies from "../components/Companies/Companies";
import CategoriesScreen from "../components/Menu/Categories";
import MenuCreate from "../pages/Menu/MenuCreate";

import Login from "../pages/Login/Login";
import Reports from "../pages/Reports/Reports.jsx";
import Register from "../pages/Login/Register";
import Categories from "../pages/Menu/Categories/CategoryList.jsx";
import Products from "../pages/Menu/Products/ProductList.jsx";
import Home from "../pages/Home/HomePublic";

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/companies" element={<Companies />} />
      <Route path="/companies/:companyId/categories" element={<CategoriesScreen />} />

      <Route path="/reports" element={
  <ProtectedRoute>
    <Reports />
  </ProtectedRoute>} />

        <Route path="/products" element={
  <ProtectedRoute>
    <Products />
  </ProtectedRoute>} />

        <Route path="/categories" element={
  <ProtectedRoute>
    <Categories />
  </ProtectedRoute>} />

<Route path="/menu/create" element={
  <ProtectedRoute>
    <MenuCreate />
  </ProtectedRoute>} />


      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
