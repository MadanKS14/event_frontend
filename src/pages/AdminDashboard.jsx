import { useState, useEffect, useMemo } from "react"; // <-- Import useMemo
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ProfileDropdown } from "../components/ProfileDropdown";
import { Link } from 'react-router-dom';
import {
  Plus,
  Grid,
  Calendar as CalendarIcon,
  Moon,
  Sun,
  Loader2,
  Bot,
  LayoutGrid,
  Users,
  Search, // <-- Import Search icon
} from "lucide-react";
import { api } from "../utils/api";
import { EventCard } from "../components/EventCard";
import { EventModal } from "../components/EventModal";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { CalendarView } from "../components/CalendarView";
import { AIAssistant } from "../components/AIAssistant";
import io from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5000";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [events, setEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // <-- 1. Add search state

  useEffect(() => {
    loadEvents();
    loadUsers();

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => console.log("WebSocket connected"));
    newSocket.on("task-created", loadEvents);
    newSocket.on("task-updated", loadEvents);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const loadEvents = async () => {
    // setLoading(true); // Maybe only set loading on initial load?
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      if (loading) setLoading(false); // Only stop initial loading spinner
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setAllUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent._id, eventData);
      } else {
        await api.createEvent(eventData);
      }
      setShowEventModal(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error) {
      console.error("Failed to save event:", error);
      alert(error.message || 'Failed to save event');
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) return;
    try {
      await api.deleteEvent(event._id);
      loadEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert(error.message || 'Failed to delete event');
    }
  };

  const handleEventClick = (event) => {
    setSelectedEventId(event._id);
  };

  // --- Filter Events based on searchTerm ---
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) {
      return events; // Return all if search is empty
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return events.filter(event =>
      event.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      (event.description && event.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (event.location && event.location.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [events, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Welcome */}
            <div className="flex items-center gap-3 flex-shrink-0"> {/* Added flex-shrink-0 */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Event Manager
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Welcome, {user?.name} (Admin)
                </p>
              </div>
            </div>

            {/* --- Search Input --- */}
            <div className="flex-1 max-w-lg mx-4"> {/* Adjusted width/margins */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events by name, description, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            {/* --- End Search Input --- */}

            {/* Navbar Controls (Right side) */}
            <div className="flex items-center gap-3 flex-shrink-0"> {/* Added flex-shrink-0 */}
              <Link
                to="/admin/users"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                title="Manage Users"
              >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">Users</span>
              </Link>
              <button
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <Bot className="w-5 h-5" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and organize all events
            </p>
          </div>
          <div className="flex gap-3">
             <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 transition-colors">
                <button onClick={() => setView("grid")} className={`p-2 rounded-md transition-colors ${ view === "grid" ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" }`}>
                  <Grid className="w-5 h-5" />
                </button>
                <button onClick={() => setView("calendar")} className={`p-2 rounded-md transition-colors ${ view === "calendar" ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" }`}>
                  <CalendarIcon className="w-5 h-5" />
                </button>
             </div>
             <button onClick={handleCreateEvent} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
               <Plus className="w-5 h-5" />
               <span className="font-medium">Create Event</span>
             </button>
          </div>
        </div>

        {/* --- Event Display (Uses filteredEvents) --- */}
        {view === "grid" ? (
          filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => ( // <-- Use filteredEvents
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onClick={handleEventClick}
                  isUser={false} // Admin view
                />
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
               <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                 <CalendarIcon className="w-10 h-10 text-gray-400" />
               </div>
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                 {searchTerm ? 'No events match your search' : 'No events yet'}
               </h3>
               {!searchTerm && ( // Only show create button if not searching
                 <>
                   <p className="text-gray-600 dark:text-gray-400 mb-6">
                     Create your first event to get started
                   </p>
                   <button
                     onClick={handleCreateEvent}
                     className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
                   >
                     <Plus className="w-5 h-5" />
                     Create Event
                   </button>
                 </>
               )}
             </div>
           )
        ) : (
          <CalendarView events={filteredEvents} onEventClick={handleEventClick} /> // <-- Use filteredEvents
        )}
      </div>

      {/* --- Modals --- */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        event={editingEvent}
      />
      <EventDetailsModal
        isOpen={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
        eventId={selectedEventId}
        allUsers={allUsers}
        isUser={false} // Admin view
      />
      <AIAssistant
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        events={events} // Pass original events to AI for context if needed
        onRefresh={loadEvents}
        role="admin" // Admin role for AI
      />
    </div>
  );
};