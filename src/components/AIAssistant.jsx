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

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const AIAssistant = ({ isOpen, onClose, events, onRefresh }) => {
  const [user, setUser] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI event assistant. I can help you manage events, attendees and tasks. How can I assist you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventDraft, setEventDraft] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* =====================================================
      ✅ FETCH USER (FIXED)
  ===================================================== */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getMe();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Failed to fetch user:", err.message);
      }
    };
    fetchUser();
  }, []);

  /* =====================================================
      ✅ SCROLL & FOCUS
  ===================================================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  /* =====================================================
      ✅ SAFE OPENROUTER CALL
  ===================================================== */
  const callAI = async (aiMessages) => {
    if (!OPENROUTER_API_KEY) {
      throw new Error("Missing OpenRouter API Key");
    }

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
          model: "openrouter/auto",
          messages: aiMessages,
          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) {
      const txt = await response.text();
      console.error("OpenRouter error:", txt);
      throw new Error("AI request failed");
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  };

  /* =====================================================
      ✅ PARSE EVENT WITH AI (SAFE VERSION)
  ===================================================== */
  const parseEventWithAI = async (userMessage) => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const systemPrompt = `You are an event extraction assistant.

The role of the current user is ${user?.role || "USER"}.

Current date: ${todayStr}
Tomorrow: ${tomorrowStr}

Return ONLY JSON:

{
 "hasEvent": true/false,
 "name": "",
 "description": "",
 "location": "",
 "date": ""
}`;

      const aiResponse = await callAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ]);

      const match = aiResponse.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }

      return { hasEvent: false };
    } catch (err) {
      console.error("Parse AI error:", err);
      return { hasEvent: false };
    }
  };

  /* =====================================================
      ✅ CREATE EVENT FROM DRAFT
  ===================================================== */
  const createEventFromDraft = async (draft) => {
    try {
      setCreatingEvent(true);

      const eventData = {
        name: draft.name,
        description: draft.description || "Created via AI Assistant",
        location: draft.location || "To be determined",
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
      console.error("Create event error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to create event.",
          type: "error",
        },
      ]);
    } finally {
      setCreatingEvent(false);
    }
  };

  /* =====================================================
      ✅ HANDLE LIST EVENTS
  ===================================================== */
  const handleListEvents = () => {
    if (!events.length) {
      return "You don't have any events yet. Want to create one?";
    }

    return events
      .map(
        (e, i) =>
          `${i + 1}. ${e.name} - ${new Date(e.date).toLocaleDateString()} at ${
            e.location
          }`
      )
      .join("\n");
  };

  /* =====================================================
      ✅ SEND MESSAGE (FULLY FIXED)
  ===================================================== */
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
        return;
      }

      /* ---------- EVENT PARSING ---------- */
      const eventData = await parseEventWithAI(userMessage);

      if (eventData.hasEvent && eventData.name && eventData.date) {
        setEventDraft(eventData);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I've understood your request! Here's the draft:",
            draft: eventData,
          },
        ]);
        return;
      }

      /* ---------- NORMAL AI CHAT ---------- */
      const context = `You are an AI assistant.
User role: ${user?.role || "USER"}.
User has ${events.length} events.`;

      const aiResponse = await callAI([
        { role: "system", content: context },
        ...messages.slice(-5).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: userMessage },
      ]);

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
            "AI service failed. Please check OpenRouter API key or network.",
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

  /* =====================================================
      ✅ UI (UNCHANGED STRUCTURE)
  ===================================================== */
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-[80%] rounded-xl px-4 py-3 bg-gray-100 dark:bg-gray-700">
              <p className="text-sm whitespace-pre-wrap">
                {message.content}
              </p>

              {message.draft && (
                <button
                  onClick={() => createEventFromDraft(message.draft)}
                  className="mt-2 px-3 py-2 bg-green-500 text-white rounded-lg flex gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Create
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-3 py-2 border rounded-lg"
          placeholder="Ask me anything..."
        />
        <button onClick={sendMessage} className="px-4 bg-blue-500 text-white rounded-lg">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
