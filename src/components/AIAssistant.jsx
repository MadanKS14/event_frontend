import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  CheckCircle2,
} from "lucide-react";

import { api } from "../utils/api";

/* =====================================================
    ✅ OPENROUTER CONFIG
===================================================== */
const OPENROUTER_API_KEY =
  import.meta.env.VITE_OPENROUTER_API_KEY;

export const AIAssistant = ({
  isOpen,
  onClose,
  events,
  onRefresh,
}) => {
  const [user, setUser] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI event assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] =
    useState(false);

  const [creatingEvent, setCreatingEvent] =
    useState(false);

  const [eventDraft, setEventDraft] =
    useState(null);

  const messagesEndRef = useRef(null);

  const inputRef = useRef(null);

  /* =====================================================
      ✅ FETCH USER
  ===================================================== */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData =
          await api.getMe();

        setUser(userData);

        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );
      } catch (err) {
        console.error(
          "Failed to fetch user:",
          err.message
        );
      }
    };

    fetchUser();
  }, []);

  /* =====================================================
      ✅ AUTO SCROLL
  ===================================================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* =====================================================
      ✅ AUTO FOCUS
  ===================================================== */
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  /* =====================================================
      ✅ OPENROUTER AI CALL
  ===================================================== */
  const callAI = async (
    systemPrompt,
    userMessage
  ) => {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type":
              "application/json",
            "HTTP-Referer":
              window.location.origin,
            "X-Title":
              "AI Event Management System",
          },

          body: JSON.stringify({
            model:
              "meta-llama/llama-3.1-8b-instruct",

            messages: [
              {
                role: "system",
                content: systemPrompt,
              },

              {
                role: "user",
                content: userMessage,
              },
            ],

            temperature: 0.3,
          }),
        }
      );

      if (!response.ok) {
        const err =
          await response.text();

        console.error(
          "OpenRouter Error:",
          err
        );

        throw new Error(
          "AI request failed"
        );
      }

      const data =
        await response.json();

      return (
        data.choices?.[0]?.message
          ?.content || ""
      );
    } catch (error) {
      console.error(
        "OpenRouter AI Error:",
        error
      );

      throw error;
    }
  };

  /* =====================================================
      ✅ EVENT PARSER
  ===================================================== */
  const parseEventWithAI =
    async (userMessage) => {
      try {
        const today = new Date();

        const todayStr = today
          .toISOString()
          .split("T")[0];

        const tomorrow = new Date(
          today
        );

        tomorrow.setDate(
          tomorrow.getDate() + 1
        );

        const tomorrowStr =
          tomorrow
            .toISOString()
            .split("T")[0];

        const systemPrompt = `
You are an event extraction assistant.

Current date: ${todayStr}
Tomorrow: ${tomorrowStr}

Return ONLY JSON in this format:

{
  "hasEvent": true/false,
  "name": "",
  "description": "",
  "location": "",
  "date": ""
}

Rules:
1. Detect if user wants to create event.
2. If no date, use tomorrow.
3. If no location, use "To be determined".
4. Return ONLY JSON.
`;

        const aiResponse =
          await callAI(
            systemPrompt,
            userMessage
          );

        const match =
          aiResponse.match(
            /\{[\s\S]*\}/
          );

        if (match) {
          return JSON.parse(match[0]);
        }

        return {
          hasEvent: false,
        };
      } catch (err) {
        console.error(
          "Parse AI error:",
          err
        );

        return {
          hasEvent: false,
        };
      }
    };

  /* =====================================================
      ✅ CREATE EVENT
  ===================================================== */
  const createEventFromDraft =
    async (draft) => {
      try {
        setCreatingEvent(true);

        const eventData = {
          name: draft.name,

          description:
            draft.description ||
            "Created via AI Assistant",

          location:
            draft.location ||
            "To be determined",

          date: new Date(
            draft.date
          ).toISOString(),
        };

        await api.createEvent(
          eventData
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",

            content: `Event "${draft.name}" created successfully!`,
          },
        ]);

        setEventDraft(null);

        onRefresh();
      } catch (error) {
        console.error(error);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",

            content:
              "Failed to create event.",
          },
        ]);
      } finally {
        setCreatingEvent(false);
      }
    };

  /* =====================================================
      ✅ LIST EVENTS
  ===================================================== */
  const handleListEvents = () => {
    if (!events.length) {
      return "You don't have any events yet.";
    }

    return events
      .map(
        (e, i) =>
          `${i + 1}. ${e.name} - ${new Date(
            e.date
          ).toLocaleDateString()}`
      )
      .join("\n");
  };

  /* =====================================================
      ✅ SEND MESSAGE
  ===================================================== */
  const sendMessage = async () => {
    if (!input.trim() || loading)
      return;

    const userMessage =
      input.trim();

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setLoading(true);

    try {
      const lower =
        userMessage.toLowerCase();

      /* ---------- LIST ---------- */
      if (
        lower.includes("list") ||
        lower.includes("show")
      ) {
        const listResponse =
          handleListEvents();

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: listResponse,
          },
        ]);

        return;
      }

      /* ---------- EVENT ---------- */
      const eventData =
        await parseEventWithAI(
          userMessage
        );

      if (
        eventData.hasEvent &&
        eventData.name
      ) {
        setEventDraft(eventData);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",

            content:
              "I've prepared an event draft for you.",

            draft: eventData,
          },
        ]);

        return;
      }

      /* ---------- NORMAL CHAT ---------- */
      const context = `
You are an AI assistant for an event management system.

User Role:
${user?.role || "USER"}

User has ${
        events.length
      } events.
`;

      const aiResponse =
        await callAI(
          context,
          userMessage
        );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
        },
      ]);
    } catch (error) {
      console.error(
        "AI Error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",

          content:
            "AI service failed. Please check OpenRouter configuration.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
      ✅ ENTER KEY
  ===================================================== */
  const handleKeyPress = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      sendMessage();
    }
  };

  if (!isOpen) return null;

  /* =====================================================
      ✅ UI
  ===================================================== */
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />

          <span className="font-semibold">
            AI Assistant
          </span>
        </div>

        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(
          (message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="max-w-[80%] rounded-xl px-4 py-3 bg-gray-100 dark:bg-gray-700">
                <p className="text-sm whitespace-pre-wrap">
                  {message.content}
                </p>

                {message.draft && (
                  <button
                    onClick={() =>
                      createEventFromDraft(
                        message.draft
                      )
                    }
                    className="mt-3 px-3 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />

                    {creatingEvent
                      ? "Creating..."
                      : "Confirm & Create"}
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="text-sm text-gray-500">
            AI is thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyPress}
          className="flex-1 px-3 py-2 border rounded-lg"
          placeholder="Ask me anything..."
        />

        <button
          onClick={sendMessage}
          className="px-4 bg-blue-500 text-white rounded-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};