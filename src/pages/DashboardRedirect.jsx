import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if needed

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  // Show loading indicator while authentication status is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If loading is done but there's no user, redirect to login
  if (!user) {
    console.error("DashboardRedirect: No user found after loading, redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // Log the role for debugging
  console.log("DashboardRedirect: Checking user role:", user.role);

  // Redirect based on the user's role
  if (user.role === 'admin') {
    console.log("Redirecting to /admin/dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === 'user') {
    console.log("Redirecting to /user/dashboard");
    return <Navigate to="/user/dashboard" replace />;
  }

  // Fallback: If role is missing or invalid, log error and redirect to login
  console.error(`DashboardRedirect: Invalid or missing user role "${user.role}", redirecting to login.`);
  // Consider logging the user out here if the role is invalid
  // logout(); // <-- You might need to import logout from useAuth if you do this
  return <Navigate to="/login" replace />;
};

export default DashboardRedirect;