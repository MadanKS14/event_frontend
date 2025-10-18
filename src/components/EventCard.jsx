import { Calendar, MapPin, Users, Edit2, Trash2, Clock, CheckCircle } from 'lucide-react'; // 1. Import 'CheckCircle'
import { getEventImage, getEventTypeFromName } from '../utils/eventImages';

export const EventCard = ({ event, onEdit, onDelete, onClick, isUser = false }) => {
  const eventImage = getEventImage(event.name, getEventTypeFromName(event.name));
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date(); // 2. This logic is already correct

  return (
    <div
      onClick={() => onClick(event)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100 dark:border-gray-700"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={eventImage}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{event.name}</h3>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* --- 3. THIS IS THE UPDATED LOGIC --- */}
        {isUpcoming ? (
          // If event is in the future, show "Upcoming"
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Upcoming
          </div>
        ) : (
          // Otherwise, show "Completed"
          <div className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Completed
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {event.description || 'No description provided'}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="line-clamp-1">{event.location || 'Location TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <Users className="w-4 h-4 text-cyan-500" />
            <span>{event.attendees?.length || 0} attendees</span>
          </div>
        </div>

        {/* Admin-only buttons (this logic is correct) */}
        {!isUser && (
          <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="font-medium">Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};