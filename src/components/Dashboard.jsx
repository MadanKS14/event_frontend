import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  LogOut,
  Plus,
  Grid,
  Calendar as CalendarIcon,
  Moon,
  Sun,
  Loader2,
  Bot,
  LayoutGrid,
} from "lucide-react";
import { api } from "../utils/api";
import { EventCard } from "./EventCard";
import { EventModal } from "./EventModal";
import { EventDetailsModal } from "./EventDetailsModal";
import { CalendarView } from "./CalendarView";
import { AIAssistant } from "./AIAssistant";
import io from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5000";

export const Dashboard = () => {
  const { user, logout } = useAuth();
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

  useEffect(() => {
    loadEvents();
    loadUsers();

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("WebSocket connected");
    });

    newSocket.on("task-created", () => {
      console.log("Task created, refreshing...");
    });

    newSocket.on("task-updated", () => {
      console.log("Task updated, refreshing...");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
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
      alert(error.message);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) return;

    try {
      await api.deleteEvent(event._id);
      loadEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert(error.message);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEventId(event._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Events
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and organize your events effortlessly
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 transition-colors">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-md transition-colors ${
                  view === "grid"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`p-2 rounded-md transition-colors ${
                  view === "calendar"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create Event</span>
            </button>
          </div>
        </div>

        {view === "grid" ? (
          events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <CalendarIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No events yet
              </h3>
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
            </div>
          )
        ) : (
          <CalendarView events={events} onEventClick={handleEventClick} />
        )}
      </div>

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
      />

      <AIAssistant
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        events={events}
        onRefresh={loadEvents}
      />
    </div>
  );
};
