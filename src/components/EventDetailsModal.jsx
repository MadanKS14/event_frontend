import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, MapPin, Users as UsersIcon, ListTodo, Loader2 } from 'lucide-react';
import { AttendeeManager } from './AttendeeManager';
import { TaskManager } from './TaskManager';
import { api } from '../utils/api';
import { getEventImage, getEventTypeFromName } from '../utils/eventImages';

// --- 1. NEW COMPONENT: User-Only Task List ---
// A simple list component just for the user's view.
const UserTaskList = ({ tasks, onStatusChange, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        You have no tasks assigned for this event.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task._id}
          className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-5 w-5 rounded text-blue-500 focus:ring-blue-500"
              checked={task.status === "Completed"}
              onChange={(e) => onStatusChange(task._id, e.target.checked)}
            />
            <span
              className={`text-gray-900 dark:text-gray-100 ${
                task.status === "Completed" ? "line-through text-gray-500" : ""
              }`}
            >
              {task.name}
            </span>
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Due: {new Date(task.deadline).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
};

// --- 2. UPDATED MODAL: Now accepts 'isUser' prop ---
export const EventDetailsModal = ({ isOpen, onClose, eventId, allUsers, isUser = false }) => {
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);

  // --- 3. NEW STATE: For user's tasks ---
  const [userTasks, setUserTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // --- 4. UPDATED: Load event data ---
  const loadEvent = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const data = await api.getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // --- 5. NEW: Load tasks ONLY for the user ---
  const loadUserTasks = useCallback(async () => {
    if (!eventId || !isUser) return; // Only run if we are a user
    setLoadingTasks(true);
    try {
      // This API call is role-aware!
      // The backend will only send tasks for this user.
      const taskData = await api.getEventTasks(eventId);
      setUserTasks(taskData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  }, [eventId, isUser]);

  // --- 6. UPDATED: useEffect to load data ---
  useEffect(() => {
    if (isOpen && eventId) {
      loadEvent();
      if (isUser) {
        // If we are a user, load our tasks
        loadUserTasks();
      }
      setActiveTab('details'); // Reset tab on open
    }
  }, [isOpen, eventId, isUser, loadEvent, loadUserTasks]); // Added dependencies

  // --- 7. NEW: Handler for user to update task status ---
  const handleStatusChange = async (taskId, isChecked) => {
    const newStatus = isChecked ? "Completed" : "Pending";

    // Optimistic UI update for instant feedback
    setUserTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      // Call the API
      await api.updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error("Failed to update task:", error);
      // On error, roll back by refetching
      loadUserTasks();
    }
  };

  if (!isOpen) return null;

  const eventImage = event ? getEventImage(event.name, getEventTypeFromName(event.name)) : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : event ? (
          <>
            {/* --- Header / Image Section (No changes) --- */}
            <div className="relative h-48">
              <img
                src={eventImage}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-2">{event.name}</h2>
                <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.date).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>

            {/* --- 8. UPDATED: Tabs (Attendee tab is hidden for user) --- */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === 'details'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Details
                {activeTab === 'details' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
              
              {/* --- 9. HIDE ATTENDEE TAB FOR USER --- */}
              {!isUser && (
                <button
                  onClick={() => setActiveTab('attendees')}
                  className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === 'attendees'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <UsersIcon className="w-4 h-4" />
                  Attendees ({event.attendees?.length || 0})
                  {activeTab === 'attendees' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'tasks'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                Tasks
                {activeTab === 'tasks' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            </div>

            {/* --- 10. UPDATED: Tab Content (Role-based) --- */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {event.description || 'No description provided'}
                    </p>
                  </div>

                  {event.attendees && event.attendees.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Attendees
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {event.attendees.map((attendee) => (
                          <div
                            key={attendee._id}
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                          >
                            {attendee.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- HIDE ATTENDEE MANAGER FOR USER --- */}
              {activeTab === 'attendees' && !isUser && (
                <AttendeeManager event={event} onUpdate={loadEvent} />
              )}
              
              {/* --- ROLE-BASED TASK CONTENT --- */}
              {activeTab === 'tasks' && (
                isUser ? (
                  // User's View:
                  <UserTaskList 
                    tasks={userTasks} 
                    loading={loadingTasks} 
                    onStatusChange={handleStatusChange} 
                  />
                ) : (
                  // Admin's View:
                  <TaskManager event={event} allUsers={allUsers} />
                )
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500 dark:text-gray-400">Event not found</p>
          </div>
        )}
      </div>
    </div>
  );
};