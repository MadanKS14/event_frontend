import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { LogIn, UserPlus, Loader2, Mail, KeyRound } from 'lucide-react';

export const Login = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLoginView) {
        data = await login(formData.email, formData.password);
      } else {
        if (!formData.name) throw new Error('Name required for registration');
        const roleToSend = ['user', 'admin'].includes(formData.role) ? formData.role : 'user';
        data = await register(formData.name, formData.email, formData.password, roleToSend);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || (isLoginView ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
            {isLoginView ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Event Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">Streamline your event management</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setIsLoginView(true); setError(''); setFormData({ ...formData, role: 'user' }); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLoginView
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLoginView(false); setError(''); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLoginView
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputClasses} />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClasses} />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input id="password" type="password" name="password" value={formData.password} onChange={handleInputChange} required className={inputClasses} />
            </div>

            {!isLoginView && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className={inputClasses}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {formData.role === 'admin' && (
                   <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Warning: Creating an admin account grants full access.</p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

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