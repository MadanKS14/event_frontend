import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Navbar } from '../components/Navbar';
import {
  Grid,
  Calendar as CalendarIcon,
  Loader2,
  Filter,
  ArrowDownUp,
} from "lucide-react";
import { api } from "../utils/api";
import { EventCard } from "../components/EventCard";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { CalendarView } from "../components/CalendarView";
import { AIAssistant } from "../components/AIAssistant";
import io from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5001";
export const UserDashboard = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [socket, setSocket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    loadEvents();
    const newSocket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    newSocket.on("connect", () => console.log("WebSocket connected"));
    newSocket.on("task-updated", loadEvents);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) { console.error("Failed to load events:", error); }
    finally { if (loading) setLoading(false); }
  };

  const handleEventClick = (event) => { setSelectedEventId(event._id); };

  const processedEvents = useMemo(() => {
    let processed = [...events];
    if (filterStatus !== 'all') {
       const now = new Date();
       processed = processed.filter(event => {
           const eventDate = new Date(event.date);
           const isUpcoming = eventDate > now;
           return filterStatus === 'upcoming' ? isUpcoming : !isUpcoming;
       });
    }
    processed.sort((a, b) => {
       const dateA = new Date(a.date); const dateB = new Date(b.date);
       return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return processed;
  }, [events, filterStatus, sortOrder]);


  if (loading) {
     return (<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50/30 dark:from-gray-900 dark:to-gray-800 transition-colors">

      <Navbar
        role="user"
        searchTerm=""
        onSearchChange={() => {}}
        onToggleAI={() => setShowAI(prev => !prev)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Events</h2>
            <p className="text-gray-600 dark:text-gray-400">View your upcoming and past events.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                 <label htmlFor="filterStatusUser" className="sr-only">Filter by status</label>
                 <select id="filterStatusUser" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                   <option value="all">All Statuses</option>
                   <option value="upcoming">Upcoming</option>
                   <option value="completed">Completed</option>
                 </select>
                 <Filter className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                 <label htmlFor="sortOrderUser" className="sr-only">Sort by date</label>
                 <select id="sortOrderUser" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                   <option value="newest">Date (Newest)</option>
                   <option value="oldest">Date (Oldest)</option>
                 </select>
                 <ArrowDownUp className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md p-1">
              <button onClick={() => setView("grid")} aria-label="Grid view" className={`p-2 rounded-md transition-colors ${ view === "grid" ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" }`}><Grid className="w-5 h-5" /></button>
              <button onClick={() => setView("calendar")} aria-label="Calendar view" className={`p-2 rounded-md transition-colors ${ view === "calendar" ? "bg-blue-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" }`}><CalendarIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {view === "grid" ? (
          processedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedEvents.map((event) => (
                <EventCard key={event._id} event={event} onClick={handleEventClick} isUser={true}/>
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
               <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                 <CalendarIcon className="w-10 h-10 text-gray-400" />
               </div>
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                 {filterStatus !== 'all' || sortOrder !== 'newest' ? 'No events match your criteria' : 'No events found'}
               </h3>
               <p className="text-gray-600 dark:text-gray-400">
                 {filterStatus !== 'all' || sortOrder !== 'newest' ? 'Try adjusting your filters.' : "You haven't been added to any events yet."}
               </p>
             </div>
           )
        ) : (
          <CalendarView events={processedEvents} onEventClick={handleEventClick} />
        )}
      </div>

      <EventDetailsModal isOpen={!!selectedEventId} onClose={() => setSelectedEventId(null)} eventId={selectedEventId} isUser={true} />
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} events={events} onRefresh={loadEvents} role="user" />
    </div>
  );
};