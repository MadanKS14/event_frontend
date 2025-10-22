import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // useAuth might not be needed here directly
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardRedirect from './pages/DashboardRedirect'; // <-- 1. Keep the import (ensure it's default)

// Import page components
import { Login } from './pages/Login'; // Assuming default export
import AdminDashboard from './pages/AdminDashboard'; // Assuming default export
import { UserDashboard } from './pages/UserDashboard'; // Assuming named export
import UserManagementPage from './pages/UserManagementPage'; // Assuming default export

// Import route protection components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// --- 2. DELETE THE INLINE FUNCTION DEFINITION ---
// function DashboardRedirect() {
//   ... (REMOVE THIS ENTIRE FUNCTION BLOCK) ...
// }
// --- END DELETE ---

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            {/* Add register route if needed */}
            {/* <Route path="/register" element={<Register />} /> */}

            {/* Gatekeeper Route - Redirects logged-in users */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardRedirect />} />
            </Route>

            {/* Admin-Only Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              {/* Add other admin routes here */}
            </Route>

            {/* Regular User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              {/* Add other user routes here, e.g., /user/profile */}
            </Route>

            {/* Optional: Add a 404 Not Found route */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;