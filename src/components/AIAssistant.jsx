import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { api } from "../utils/api";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

export const AIAssistant = ({ isOpen, onClose, events, onRefresh }) => {
  const [user, setUser] = useState(null);
  const fetchUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
      localStorage.setItem("user", userData);
    } catch (err) {
      console.error("AuthContext: Failed to fetch user info:", err.message);
    }
  };
  fetchUser();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI event assistant. I can help you manage events, manage attendees, track tasks, and provide insights about your events. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventDraft, setEventDraft] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const parseEventWithAI = async (userMessage) => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const systemPrompt = `You are an event extraction assistant. Extract event details from user messages and return ONLY a valid JSON object ONLY AND ONLY IF THE USER IS AN ADMIN. The role of the current user is ${user.role}.

Current date: ${todayStr}
Tomorrow's date: ${tomorrowStr}

Return this exact structure:
{
  "hasEvent": true/false,
  "name": "event name",
  "description": "brief description",
  "location": "location",
  "date": "YYYY-MM-DD"
}

Rules:
1. Set hasEvent=true ONLY if user wants to create/schedule/plan an event
2. Extract event name naturally from context
3. For "tomorrow", use: ${tomorrowStr}
4. For "today", use: ${todayStr}
5. For "next Monday/Tuesday", calculate the correct date from ${todayStr}
6. If no date mentioned, use tomorrow: ${tomorrowStr}
7. If no location mentioned, use: "To be determined"
8. Create a brief, relevant description
9. Return ONLY the JSON object, nothing else

Examples:
"Let's meet tomorrow for coffee" -> {"hasEvent": true, "name": "Coffee Meeting", "description": "Coffee meeting", "location": "To be determined", "date": "${tomorrowStr}"}
"Schedule team standup at office on Friday" -> {"hasEvent": true, "name": "Team Standup", "description": "Team standup meeting", "location": "Office", "date": "2025-10-24"}
"Can you show my events?" -> {"hasEvent": false}. 
YOU MUST STRICTLY NOT LET THE USER CREATE OR ADD TASKS OR ASSIGN TASKS OR EDIT TASKS OR DELETE TASKS OR EDIT ANY EVENT DETAILS IF THEY ARE NOT AN ADMIN, REPLY SAYING THAT THEY DONT HAVE PERMISSION. 
The role of the current user is ${user.role}.`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Event Management Dashboard",
          },
          body: JSON.stringify({
            model: "alibaba/tongyi-deepresearch-30b-a3b:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0.1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to parse with AI");
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "";

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      return { hasEvent: false };
    } catch (error) {
      console.error("AI parsing error:", error);
      return { hasEvent: false };
    }
  };

  const createEventFromDraft = async (draft) => {
    try {
      setCreatingEvent(true);
      const eventData = {
        name: draft.name,
        description: draft.description || "Created via AI Assistant",
        location: draft.location,
        date: new Date(draft.date).toISOString(),
      };

      await api.createEvent(eventData);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Event "${draft.name}" has been created successfully!`,
          type: "success",
        },
      ]);

      setEventDraft(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to create event:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn't create the event. ${error.message}`,
          type: "error",
        },
      ]);
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleListEvents = () => {
    if (events.length === 0) {
      return "You don't have any events yet. Would you like to create one? Just tell me what you'd like to plan!";
    }
    const eventsList = events
      .map(
        (e, i) =>
          `${i + 1}. *${e.name}* - ${new Date(
            e.date
          ).toLocaleDateString()} at ${e.location}`
      )
      .join("\n");
    return `Here are your upcoming events:\n\n${eventsList}\n\nWould you like to know more about any of these events?`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const lower = userMessage.toLowerCase();

      if (
        lower.includes("list") ||
        lower.includes("show") ||
        (lower.includes("what") && lower.includes("event"))
      ) {
        const listResponse = handleListEvents();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: listResponse },
        ]);
        setLoading(false);
        return;
      }

      const eventData = await parseEventWithAI(userMessage);

      if (eventData.hasEvent && eventData.name && eventData.date) {
        setEventDraft({
          name: eventData.name,
          description: eventData.description || "Created via AI Assistant",
          location: eventData.location || "To be determined",
          date: eventData.date,
        });

        const message = {
          role: "assistant",
          content: `I've understood your request! Here's what I'll create for you:`,
          draft: {
            name: eventData.name,
            description: eventData.description || "Created via AI Assistant",
            location: eventData.location || "To be determined",
            date: eventData.date,
          },
        };

        setMessages((prev) => [...prev, message]);
        setLoading(false);
        return;
      }

      const context = `You are an AI assistant for an event management dashboard. The user currently has ${events.length} events. You can help them create events IF AND ONLY IF THE USER'S ROLE IS ADMIN (just parse their natural language), list events, manage attendees, track tasks, and provide insights. Be helpful, friendly, concise, and conversational.

If the admin user wants to create an event, acknowledge it and let them know you'll extract the details. For general questions, provide helpful guidance about what you can do. YOU MUST STRICTLY NOT LET THE USER CREATE OR ADD TASKS OR ASSIGN TASKS OR EDIT ANY EVENT DETAILS IF THEY ARE NOT AN ADMIN, REPLY SAYING THAT THEY DONT HAVE PERMISSION. 
The role of the current user is ${user.role}.`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Event Management Dashboard",
          },
          body: JSON.stringify({
            model: "alibaba/tongyi-deepresearch-30b-a3b:free",
            messages: [
              { role: "system", content: context },
              ...messages
                .slice(-5)
                .map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: userMessage },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiResponse =
        data.choices[0]?.message?.content ||
        "I apologize, but I couldn't process that request. Could you please rephrase?";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please ensure the AI service is configured correctly. In the meantime, I can still help you navigate the dashboard!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 transition-all duration-300 animate-slide-in">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 relative overflow-hidden">
        <div className="flex items-center gap-2 text-white relative z-10">
          <div className="relative">
            <Bot className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-all hover:rotate-90 duration-300 text-white relative z-10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  : message.type === "success"
                  ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-700"
                  : message.type === "error"
                  ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {message.draft && (
                <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl space-y-2 backdrop-blur-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Event Name
                      </p>
                      <p className="font-semibold text-sm">
                        {message.draft.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Location
                      </p>
                      <p className="font-semibold text-sm">
                        {message.draft.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 text-purple-600 dark:text-purple-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Date
                      </p>
                      <p className="font-semibold text-sm">
                        {new Date(message.draft.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => createEventFromDraft(message.draft)}
                    disabled={creatingEvent}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {creatingEvent ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm & Create
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <div
                  className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500"
            disabled={loading || creatingEvent}
          />
          <button
            onClick={sendMessage}
            disabled={loading || creatingEvent || !input.trim()}
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};