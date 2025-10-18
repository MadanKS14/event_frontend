import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Users, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export const AttendeeManager = ({ event, onUpdate }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAttendee = (userId) => {
    return event.attendees?.some((a) => a._id === userId || a === userId);
  };

  const handleAddAttendee = async (userId) => {
    setActionLoading(userId);
    try {
      await api.addAttendee(event._id, userId);
      onUpdate();
    } catch (error) {
      console.error('Failed to add attendee:', error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAttendee = async (userId) => {
    setActionLoading(userId);
    try {
      await api.removeAttendee(event._id, userId);
      onUpdate();
    } catch (error) {
      console.error('Failed to remove attendee:', error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-500" />
        Manage Attendees
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {allUsers.map((user) => {
          const attending = isAttendee(user._id);
          const isLoading = actionLoading === user._id;

          return (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>

              {attending ? (
                <button
                  onClick={() => handleRemoveAttendee(user._id)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserMinus className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Remove</span>
                </button>
              ) : (
                <button
                  onClick={() => handleAddAttendee(user._id)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Add</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {allUsers.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No users available
        </p>
      )}
    </div>
  );
};
