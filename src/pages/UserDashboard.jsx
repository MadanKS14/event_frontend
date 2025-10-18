import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  LogOut,
  Grid,
  Calendar as CalendarIcon,
  Moon,
  Sun,
  Loader2,
  Bot,
  LayoutGrid,
} from "lucide-react";
import { api } from "../utils/api";
import { EventCard } from "../components/EventCard";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { CalendarView } from "../components/CalendarView";
import { AIAssistant } from "../components/AIAssistant";
import io from "socket.io-client";

// Connect to the socket URL from your .env file
const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5000";

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [socket, setSocket] = useState(null);

  // Load events and set up socket on component mount
  useEffect(() => {
    loadEvents();

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => console.log("WebSocket connected"));
    newSocket.on("task-updated", () => loadEvents()); // Refresh on updates

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch events. The backend will automatically send only the user's events.
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open the event details modal when an event is clicked
  const handleEventClick = (event) => {
    setSelectedEventId(event._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50/30 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* --- Navbar --- */}
      <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Welcome */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Event Manager
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Welcome, {user?.name}
                </p>
              </div>
            </div>

            {/* Navbar Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <Bot className="w-5 h-5" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Events
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View your upcoming and past events.
            </p>
          </div>

          {/* View Toggles (No "Create" button) */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md p-1">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-md ${
                view === "grid"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`p-2 rounded-md ${
                view === "calendar"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Event List / Calendar --- */}
        {view === "grid" ? (
          events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={handleEventClick}
                  isUser={true} // <-- IMPORTANT: Pass isUser prop to hide admin buttons
                />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <CalendarIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't been added to any events yet.
              </p>
            </div>
          )
        ) : (
          <CalendarView events={events} onEventClick={handleEventClick} />
        )}
      </div>

      {/* --- Modals --- */}
      {/* Note: EventModal (for creating) is NOT rendered */}
      <EventDetailsModal
        isOpen={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
        eventId={selectedEventId}
        isUser={true} // <-- IMPORTANT: Pass isUser to show the user task view
      />
      <AIAssistant
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        events={events}
        onRefresh={loadEvents}
        role="user" // <-- IMPORTANT: Tell AI assistant the role
      />
    </div>
  );
};