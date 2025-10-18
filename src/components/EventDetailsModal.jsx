import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, MapPin, Users as UsersIcon, ListTodo, Loader2 } from 'lucide-react';
import { AttendeeManager } from './AttendeeManager';
import { TaskManager } from './TaskManager';
import { api } from '../utils/api';
import { getEventImage, getEventTypeFromName } from '../utils/eventImages';

// --- User-Only Task List Component ---
const UserTaskList = ({ tasks, onStatusChange, loading, isUpcoming }) => { // 1. Accept isUpcoming
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
      {!isUpcoming && ( // 2. Add a message if event is completed
        <p className="text-sm text-yellow-600 dark:text-yellow-400 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          This event is completed. Tasks can no longer be updated.
        </p>
      )}
      {tasks.map((task) => (
        <li
          key={task._id}
          className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-5 w-5 rounded text-blue-500 focus:ring-blue-500 disabled:opacity-50"
              checked={task.status === "Completed"}
              onChange={(e) => onStatusChange(task._id, e.target.checked)}
              disabled={!isUpcoming} // 3. Disable checkbox if not upcoming
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

// --- Main Modal Component ---
export const EventDetailsModal = ({ isOpen, onClose, eventId, allUsers, isUser = false }) => {
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [userTasks, setUserTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // --- NEW: Calculate isUpcoming once event is loaded ---
  const isUpcoming = event ? new Date(event.date) > new Date() : false;

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

  const loadUserTasks = useCallback(async () => {
    if (!eventId || !isUser) return;
    setLoadingTasks(true);
    try {
      const taskData = await api.getEventTasks(eventId);
      setUserTasks(taskData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  }, [eventId, isUser]);

  useEffect(() => {
    if (isOpen && eventId) {
      loadEvent();
      if (isUser) {
        loadUserTasks();
      }
      setActiveTab('details');
    }
  }, [isOpen, eventId, isUser, loadEvent, loadUserTasks]);

  const handleStatusChange = async (taskId, isChecked) => {
    // Prevent change if event is over
    if (!isUpcoming) return; 

    const newStatus = isChecked ? "Completed" : "Pending";
    setUserTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );
    try {
      await api.updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error("Failed to update task:", error);
      loadUserTasks(); // Roll back
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
            <div className="relative h-48">
              <img src={eventImage} alt={event.name} className="w-full h-full object-cover" />
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
              
              {/* Hide Attendee tab for users */}
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
                  {/* Attendee list on details tab */}
                </div>
              )}

              {/* Only show AttendeeManager if admin */}
              {activeTab === 'attendees' && !isUser && (
                // Pass isUpcoming to AttendeeManager
                <AttendeeManager event={event} onUpdate={loadEvent} isUpcoming={isUpcoming} />
              )}
              
              {/* Role-based task content */}
              {activeTab === 'tasks' && (
                isUser ? (
                  // User's View:
                  <UserTaskList 
                    tasks={userTasks} 
                    loading={loadingTasks} 
                    onStatusChange={handleStatusChange} 
                    isUpcoming={isUpcoming} // Pass isUpcoming
                  />
                ) : (
                  // Admin's View:
                  <TaskManager 
                    event={event} 
                    allUsers={allUsers} 
                    isUpcoming={isUpcoming} // Pass isUpcoming
                  />
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