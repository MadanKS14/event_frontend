import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus, Clock, User, Loader2, TrendingUp } from 'lucide-react';
import { api } from '../utils/api';

export const TaskManager = ({ event, allUsers }) => {
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    deadline: '',
    assignedAttendeeId: '',
  });

  useEffect(() => {
    loadTasks();
    loadProgress();
  }, [event._id]);

  const loadTasks = async () => {
    try {
      const data = await api.getEventTasks(event._id);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const data = await api.getEventProgress(event._id);
      setProgress(data.progress || 0);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
      await api.updateTaskStatus(task._id, newStatus);
      loadTasks();
      loadProgress();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.name || !newTask.deadline || !newTask.assignedAttendeeId) {
      alert('Please fill all fields');
      return;
    }

    try {
      await api.createTask({
        ...newTask,
        eventId: event._id,
      });
      setNewTask({ name: '', deadline: '', assignedAttendeeId: '' });
      setShowAddTask(false);
      loadTasks();
      loadProgress();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert(error.message);
    }
  };

  const eventAttendees = event.attendees || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showAddTask && (
        <form onSubmit={handleAddTask} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Task name"
            value={newTask.name}
            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            type="datetime-local"
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <select
            value={newTask.assignedAttendeeId}
            onChange={(e) => setNewTask({ ...newTask, assignedAttendeeId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select attendee</option>
            {eventAttendees.map((attendee) => (
              <option key={attendee._id} value={attendee._id}>
                {attendee.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all"
          >
            <button
              onClick={() => handleToggleStatus(task)}
              className="mt-1 flex-shrink-0"
            >
              {task.status === 'Completed' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {task.name}
              </p>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(task.deadline).toLocaleString()}
                </span>
                {task.assignedAttendee && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {task.assignedAttendee.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No tasks yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
};
