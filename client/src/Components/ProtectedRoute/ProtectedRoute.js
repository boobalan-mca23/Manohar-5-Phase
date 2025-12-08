import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredAccess }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const access = user.access || user.access?.[0] || {};

  // If route requires a permission and the user doesn't have it → block
  if (requiredAccess && !access[requiredAccess]) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
