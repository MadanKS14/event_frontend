import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.error("DashboardRedirect: No user found after loading, redirecting to login.");
    return <Navigate to="/login" replace />;
  }


  const role = user.role?.toLowerCase();

  console.log("DashboardRedirect: Checking user role:", role);

  if (role === 'admin') {
    console.log("✅ Redirecting to /admin/dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === 'user') {
    console.log("✅ Redirecting to /user/dashboard");
    return <Navigate to="/user/dashboard" replace />;
  }

  console.error(`DashboardRedirect: Invalid or missing user role "${user.role}", redirecting to login.`);
  return <Navigate to="/login" replace />;
};

export default DashboardRedirect;
