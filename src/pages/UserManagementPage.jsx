import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext'; // To verify admin role (optional, route protects anyway)
import { Loader2, Plus, X, Save, Info, Users, ShieldCheck, User } from 'lucide-react';

// --- Create User Modal Component ---
const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setError('');
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Assuming you added 'createUserByAdmin' to api.js
      await api.createUserByAdmin(formData); 
      setLoading(false);
      onUserCreated(); // Tell the parent page to refresh the user list
      onClose(); // Close the modal
    } catch (err) {
      setError(err.message || 'Failed to create user.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full input-style">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Create User
            </button>
          </div>
        </form>
      </div>
      {/* Basic input style definition (add to your global CSS or keep here if preferred) */}
      <style jsx>{`
        .input-style {
          padding: 0.5rem 0.75rem;
          border-width: 1px;
          border-color: #d1d5db; /* gray-300 */
          border-radius: 0.375rem; /* rounded-md */
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
          background-color: white;
          color: #111827; /* gray-900 */
        }
        .dark .input-style {
          border-color: #4b5563; /* dark:border-gray-600 */
          background-color: #374151; /* dark:bg-gray-700 */
           color: #f9fafb; /* dark:text-gray-100 */
        }
        .input-style:focus {
          outline: none;
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
          border-color: #3b82f6; /* focus:border-blue-500 */
           --tw-ring-color: #3b82f6; /* focus:ring-blue-500 */
        }
      `}</style>
    </div>
  );
};

// --- Main User Management Page ---
export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth(); // Get current user info

  // Fetch users function
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Use the correct API function name
      const data = await api.getUsers(); 
      // Filter out the current admin from the list (optional)
      setUsers(data.filter(u => u._id !== user._id)); 
    } catch (err) {
      console.error("Failed to load users:", err);
      setError('Could not load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user._id]); // Depend on user._id to refilter if user changes (unlikely here)

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> Create User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded-md flex items-center gap-2">
           <Info className="w-5 h-5 flex-shrink-0" />
           {error}
        </div>
       )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                {/* Add Actions column if implementing edit/delete */}
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {u.role === 'admin' ? (
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                         <ShieldCheck className="w-3 h-3" /> Admin
                       </span>
                    ) : (
                       <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                         <User className="w-3 h-3" /> User
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                   {/* Actions (Edit/Delete - placeholders for future implementation) */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                     <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                     <button className="text-red-600 hover:text-red-900">Delete</button>
                   </td> */}
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && (
             <p className="text-center py-10 text-gray-500 dark:text-gray-400">No other users found.</p>
           )}
        </div>
      )}

      {/* Render the Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={loadUsers} // Refresh list after creation
      />
    </div>
  );
};

