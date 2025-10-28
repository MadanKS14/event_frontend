import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Plus, Trash2, Loader2, Info, CheckCircle2 } from 'lucide-react';

export const TaskManager = ({ event, allUsers = [], isUpcoming }) => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [error, setError] = useState('');

  const completedCount = tasks.filter(task => task.status === 'Completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const loadTasks = useCallback(async () => {
    if (!event?._id) return;
    setLoadingTasks(true);
    try {
      const taskData = await api.getEventTasks(event._id);
      setTasks(taskData);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Could not load tasks.');
    } finally {
      setLoadingTasks(false);
    }
  }, [event?._id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskName || !newTaskDeadline || !assignedUserId || !isUpcoming) return;
    setError('');

    try {
      await api.createTask({
        name: newTaskName,
        deadline: newTaskDeadline,
        eventId: event._id,
        assignedAttendeeId: assignedUserId,
      });
      setNewTaskName('');
      setNewTaskDeadline('');
      setAssignedUserId('');
      loadTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err.message || 'Failed to add task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!isUpcoming) return;
    alert('Delete task functionality needs backend implementation.');
  };

  return (
    <div className="space-y-4">
      {!isUpcoming && (
        <div className="flex items-center gap-2 p-3 text-sm text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/30 rounded-md">
          <Info className="w-5 h-5 flex-shrink-0" />
          <span>This event is completed. Tasks can no longer be managed.</span>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Task Completion Progress
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="mt-1 text-right">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end p-4 border dark:border-gray-700 rounded-lg">
        <div>
          <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Name</label>
          <input
            id="taskName"
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="e.g., Prepare slides"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:opacity-50"
            required
            disabled={!isUpcoming}
          />
        </div>
        <div>
          <label htmlFor="taskDeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
          <input
            id="taskDeadline"
            type="datetime-local"
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:opacity-50"
            required
            disabled={!isUpcoming}
          />
        </div>
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
          <select
            id="assignee"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:opacity-50"
            required
            disabled={!isUpcoming}
          >
            <option value="">Select User...</option>
            {allUsers.map(user => (
              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isUpcoming}
          >
            <Plus className="w-5 h-5" /> Add Task
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loadingTasks ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : tasks.length > 0 ? (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <span className={`font-medium text-gray-900 dark:text-gray-100 ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                  {task.name}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Assigned to: {task.assignedAttendee?.name || 'N/A'} - Due: {new Date(task.deadline).toLocaleDateString()}
                  {task.status === 'Completed' ? ' (Completed)' : ''}
                </p>
              </div>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isUpcoming}
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No tasks added yet.</p>
      )}
    </div>
  );
};