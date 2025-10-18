import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../utils/api';
import { UserPlus, XCircle, Loader2, Info } from 'lucide-react';

export const AttendeeManager = ({ event, onUpdate, isUpcoming }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');

  // Fetch all users to populate the dropdown
  const loadAllUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const users = await api.getUsers();
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Could not load user list.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  // Handle adding an attendee
  const handleAddAttendee = async () => {
    if (!selectedUserId || !isUpcoming) return;
    setError('');
    try {
      await api.addAttendee(event._id, selectedUserId);
      setSelectedUserId(''); // Reset dropdown
      onUpdate(); // Trigger parent (EventDetailsModal) to reload event data
    } catch (err) {
      console.error('Failed to add attendee:', err);
      setError(err.message || 'Failed to add attendee.');
    }
  };

  // Handle removing an attendee
  const handleRemoveAttendee = async (userIdToRemove) => {
    if (!isUpcoming) return;
     // Prevent removing the event creator (optional rule)
    // if (userIdToRemove === event.createdBy) {
    //   setError("Cannot remove the event creator.");
    //   return;
    // }
    setError('');
    try {
      await api.removeAttendee(event._id, userIdToRemove);
      onUpdate(); // Trigger parent to reload event data
    } catch (err) {
      console.error('Failed to remove attendee:', err);
      setError(err.message || 'Failed to remove attendee.');
    }
  };

  // Filter out users who are already attendees to show in the dropdown
  const usersToAdd = useMemo(() => {
    const attendeeIds = event?.attendees?.map(att => att._id) || [];
    return allUsers.filter(user => !attendeeIds.includes(user._id));
  }, [allUsers, event?.attendees]);

  return (
    <div className="space-y-4">
       {/* Warning message if event is completed */}
       {!isUpcoming && (
        <div className="flex items-center gap-2 p-3 text-sm text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/30 rounded-md">
          <Info className="w-5 h-5 flex-shrink-0" />
          <span>This event is completed. Attendees can no longer be managed.</span>
        </div>
      )}

      {/* --- Add Attendee Section (Admin only) --- */}
      <div className="flex gap-2 items-end p-4 border dark:border-gray-700 rounded-lg">
        <div className="flex-1">
          <label htmlFor="attendeeSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Attendee</label>
          {loadingUsers ? (
             <div className="flex items-center justify-center h-10">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
             </div>
          ) : (
            <select
              id="attendeeSelect"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:opacity-50"
              disabled={!isUpcoming || usersToAdd.length === 0}
            >
              <option value="">{usersToAdd.length > 0 ? 'Select user...' : 'No users to add'}</option>
              {usersToAdd.map(user => (
                <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={handleAddAttendee}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isUpcoming || !selectedUserId}
        >
          <UserPlus className="w-5 h-5" /> Add
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* --- Current Attendee List --- */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Current Attendees ({event?.attendees?.length || 0})</h4>
        {event?.attendees?.length > 0 ? (
          <ul className="space-y-2">
            {event.attendees.map(attendee => (
              <li key={attendee._id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                <span className="text-sm text-gray-800 dark:text-gray-200">{attendee.name} ({attendee.email})</span>
                <button
                  onClick={() => handleRemoveAttendee(attendee._id)}
                  className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isUpcoming} // Disable remove if event completed
                  aria-label={`Remove ${attendee.name}`}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No attendees added yet.</p>
        )}
      </div>
    </div>
  );
};