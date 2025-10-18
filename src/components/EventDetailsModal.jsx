import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users as UsersIcon, ListTodo } from 'lucide-react';
import { AttendeeManager } from './AttendeeManager';
import { TaskManager } from './TaskManager';
import { api } from '../utils/api';
import { getEventImage, getEventTypeFromName } from '../utils/eventImages';

export const EventDetailsModal = ({ isOpen, onClose, eventId, allUsers }) => {
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && eventId) {
      loadEvent();
    }
  }, [isOpen, eventId]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await api.getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const eventImage = event ? getEventImage(event.name, getEventTypeFromName(event.name)) : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-colors">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : event ? (
          <>
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

              {activeTab === 'attendees' && (
                <AttendeeManager event={event} onUpdate={loadEvent} />
              )}

              {activeTab === 'tasks' && (
                <TaskManager event={event} allUsers={allUsers} />
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
