import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} />;
  }

  if (requireAdmin && user?.role !== "admin") {
    // Tampilkan notifikasi ditolak
    Swal.fire({
      icon: 'error',
      title: 'Akses Ditolak',
      text: 'Halaman ini khusus Admin!',
      background: '#1E293B',
      color: '#F8FAFC'
    });
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
