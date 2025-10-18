import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import your new components
import { Login } from './pages/Login'; // Assuming this is the path
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// This is the "gatekeeper" component
function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    // Should be caught by ProtectedRoute, but good fallback
    return <Navigate to="/login" replace />;
  }
  
  // The main logic
  return user.role === 'admin' 
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/user/dashboard" replace />;
}


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Add register route if you have one */}
            {/* <Route path="/register" element={<Register />} /> */}

            {/* Gatekeeper Route */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardRedirect />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* e.g., <Route path="/admin/users" element={<UserManagement />} /> */}
            </Route>
            
            {/* User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              {/* e.g., <Route path="/user/profile" element={<Profile />} /> */}
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;