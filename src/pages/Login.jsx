import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api'; // Assuming api.register is updated
import { LogIn, UserPlus, Loader2, Mail, KeyRound } from 'lucide-react'; // Added Mail, KeyRound for potential OTP use later

export const Login = () => {
  const [isLoginView, setIsLoginView] = useState(true); // State for Login vs Register view
  // Add 'role' to initial formData state, default to 'user'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  // const [role, setRole] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth(); // Assuming context register accepts role
  const navigate = useNavigate();

  // Generic input change handler
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles both Login and Register submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLoginView) {
        // Login Logic
        data = await login(formData.email, formData.password); // Use context login
      } else {
        // Registration Logic
        if (!formData.name) throw new Error('Name required for registration');
        // Ensure role is valid before sending
        // const roleToSend = ['user', 'admin'].includes(formData.role) ? formData.role : 'user';
        // Pass role to the register function (ensure AuthContext.register accepts it)
        console.log(formData);
        data = await register(formData.name, formData.email, formData.password, formData.role);
      }
      navigate('/'); // Navigate to dashboard redirect on success
    } catch (err) {
      setError(err.message || (isLoginView ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  // Basic input styles (can be moved to global CSS)
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
            {/* Show different icon based on view */}
            {isLoginView ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">Streamline your event management</p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors">
          {/* View Toggle Buttons (Login / Register) */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setIsLoginView(true); setError(''); setFormData({ ...formData, role: 'user' }); }} // Reset role on switch
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLoginView
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLoginView(false); setError(''); }} // Keep selected role when switching to register
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLoginView
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Register
            </button>
          </div>

          {/* Login/Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input (Only show on Register view) */}
            {!isLoginView && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputClasses} />
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClasses} />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input id="password" type="password" name="password" value={formData.password} onChange={handleInputChange} required className={inputClasses} />
            </div>

            {/* --- Role Select Dropdown (Only show on Register view) --- */}
            {!isLoginView && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className={inputClasses} // Use same styling as inputs
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {/* Security Warning (Optional but Recommended) */}
                {formData.role === 'admin' && (
                   <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Warning: Creating an admin account grants full access.</p>
                )}
              </div>
            )}
            {/* --- End Role Select --- */}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLoginView ? (
                <> <LogIn className="w-5 h-5" /> Login </>
              ) : (
                <> <UserPlus className="w-5 h-5" /> Register </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
