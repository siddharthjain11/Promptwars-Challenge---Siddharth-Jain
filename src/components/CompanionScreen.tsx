import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { speech } from "../utils/speech";

interface CompanionScreenProps {
  onBackToHome: () => void;
  isLargeText: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "companion",
    text: "Hello! It is so good to be with you today. You can ask me anything at all in plain words, or just say hello. What would you like to talk about?",
    timestamp: "Just now",
  },
];

const SUGGESTED_QUESTIONS = [
  "Tell me a cheerful thought for today",
  "How do I send a picture on my phone?",
  "What is a simple, healthy lunch idea?",
  "What does 'browser' mean in plain English?",
];

export const CompanionScreen: React.FC<CompanionScreenProps> = ({
  onBackToHome,
  isLargeText,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("senior_companion_chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MESSAGES;
      }
    }
    return INITIAL_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoReadAloud, setAutoReadAloud] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Save messages to local storage
  useEffect(() => {
    localStorage.setItem("senior_companion_chat", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone permission was not granted. You can still type below!");
        } else {
          setSpeechError("Could not hear clearly. Please try pressing the microphone again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      speech.stop();
    };
  }, []);

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported on this browser. You can type your message in the box below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      speech.stop();
      setSpeakingMessageId(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition start failed:", e);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    speech.stop();
    setSpeakingMessageId(null);

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-6).map((m) => ({
            sender: m.sender === "user" ? "Senior Citizen" : "Companion",
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        "I am right here with you. Take a comfortable breath and let me know if you would like me to repeat that.";

      const companionMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        sender: "companion",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, companionMsg]);

      // Auto-read aloud if enabled
      if (autoReadAloud) {
        handleReadAloud(companionMsg.id, replyText);
      }
    } catch (error) {
      console.warn("Chat notice:", error);
      const errorMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        sender: "companion",
        text: "I am having a moment of trouble connecting, but you are doing wonderfully. Please ask again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = (id: string, text: string) => {
    if (speakingMessageId === id) {
      speech.stop();
      setSpeakingMessageId(null);
    } else {
      speech.stop();
      setSpeakingMessageId(id);
      speech.speak(text, {
        onStart: () => setSpeakingMessageId(id),
        onEnd: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null),
      });
    }
  };

  const handleClearChat = () => {
    speech.stop();
    setSpeakingMessageId(null);
    setMessages(INITIAL_MESSAGES);
    localStorage.removeItem("senior_companion_chat");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Navigation & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border-2 border-[#E7E2D8] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="companion-back-to-home"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEAE1] text-[#292524] font-bold text-base sm:text-lg border border-[#D6D0C4] transition focus:outline-hidden focus:ring-4 focus:ring-amber-400"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go to Home</span>
          </button>
          <div>
            <h1
              className={`font-serif font-bold text-[#1C1917] ${
                isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
              }`}
            >
              Talk to My Companion
            </h1>
            <p className="text-[#78716C] font-medium text-sm sm:text-base">
              Patient, friendly, and always happy to help
            </p>
          </div>
        </div>

        {/* Read Aloud Toggle & Reset */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoReadAloud(!autoReadAloud)}
            id="toggle-auto-read-button"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm sm:text-base font-bold border-2 transition ${
              autoReadAloud
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-[#FAF7F2] text-[#78716C] border-[#E7E2D8]"
            }`}
            title="Automatically read companion responses out loud"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>Auto-read aloud: {autoReadAloud ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={handleClearChat}
            id="clear-chat-button"
            className="p-2.5 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E7E2D8] transition"
            title="Start a fresh conversation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggested Questions Pill Row */}
      <div className="bg-[#FAF7F2] p-4 rounded-2xl border-2 border-[#E7E2D8]">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#78716C] block mb-2.5">
          Tap any of these to ask easily:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-left bg-white hover:bg-amber-50 active:bg-amber-100 text-[#292524] hover:text-[#92400E] border-2 border-[#E7E2D8] hover:border-amber-400 font-semibold px-4 py-2.5 rounded-xl text-base sm:text-lg transition shadow-2xs focus:outline-hidden focus:ring-4 focus:ring-amber-300"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        id="chat-messages-container"
        className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-[#E7E2D8] shadow-xs min-h-[380px] max-h-[550px] overflow-y-auto space-y-5"
      >
        {messages.map((msg) => {
          const isCompanion = msg.sender === "companion";
          const isPlaying = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isCompanion ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[80%] rounded-3xl p-5 sm:p-6 shadow-xs border-2 ${
                  isCompanion
                    ? "bg-[#FAF7F2] border-[#E7E2D8] text-[#1C1917]"
                    : "bg-[#D97706] border-[#B45309] text-white"
                }`}
              >
                {/* Sender Header */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-black/10">
                  <span
                    className={`font-bold text-sm sm:text-base flex items-center gap-1.5 ${
                      isCompanion ? "text-[#B45309]" : "text-amber-100"
                    }`}
                  >
                    {isCompanion ? (
                      <>
                        <Sparkles className="w-4 h-4 text-[#D97706]" />
                        <span>Your Companion</span>
                      </>
                    ) : (
                      <span>You</span>
                    )}
                  </span>
                  <span
                    className={`text-xs sm:text-sm ${
                      isCompanion ? "text-[#78716C]" : "text-amber-200"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Body */}
                <p
                  className={`leading-relaxed whitespace-pre-wrap font-medium ${
                    isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                  }`}
                >
                  {msg.text}
                </p>

                {/* Companion Action: Big "Read Aloud" Button */}
                {isCompanion && (
                  <div className="mt-4 pt-3 border-t border-[#E7E2D8] flex items-center">
                    <button
                      onClick={() => handleReadAloud(msg.id, msg.text)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base sm:text-lg transition shadow-2xs focus:outline-hidden focus:ring-4 focus:ring-amber-400 ${
                        isPlaying
                          ? "bg-amber-600 text-white animate-pulse"
                          : "bg-white hover:bg-amber-100 text-[#92400E] border-2 border-amber-300"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-5 h-5" />
                          <span>Stop Reading</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5 text-amber-700" />
                          <span>Listen Out Loud</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="bg-[#FAF7F2] border-2 border-[#E7E2D8] rounded-3xl p-5 text-[#78716C] flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
              <span className="font-semibold text-lg">
                Your companion is thinking of a friendly answer...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Alert if error */}
      {speechError && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-900 font-semibold text-base flex items-center justify-between">
          <span>{speechError}</span>
          <button
            onClick={() => setSpeechError(null)}
            className="text-amber-700 font-bold px-3 py-1 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Microphone Listening Banner */}
      {isListening && (
        <div className="bg-rose-500 text-white p-4 rounded-2xl flex items-center justify-center gap-3 animate-pulse shadow-md">
          <Mic className="w-6 h-6" />
          <span className="font-bold text-lg sm:text-xl">
            I am listening! Speak clearly into your device...
          </span>
          <button
            onClick={handleToggleMic}
            className="ml-4 px-3 py-1.5 rounded-lg bg-white text-rose-700 font-bold text-sm"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Input Form with Big Text Box and Prominent Buttons */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-[#E7E2D8] shadow-sm space-y-3"
      >
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your question here, or press the 'Speak' button..."
            rows={2}
            id="chat-input-textarea"
            className={`w-full p-4 rounded-2xl border-2 border-[#D6D0C4] focus:border-[#D97706] focus:ring-4 focus:ring-amber-300 font-medium text-[#1C1917] placeholder:text-[#A8A29E] resize-none outline-hidden ${
              isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
            }`}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Microphone Speak Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            id="mic-speech-button"
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-lg sm:text-xl transition shadow-xs focus:outline-hidden focus:ring-4 focus:ring-amber-400 ${
              isListening
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-2 border-[#F59E0B]"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 text-amber-700" />
                <span>Speak with Voice</span>
              </>
            )}
          </button>

          {/* Send Message Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            id="send-chat-button"
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] disabled:bg-[#E7E2D8] text-white disabled:text-[#A8A29E] font-bold text-lg sm:text-xl shadow-md transition active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-amber-400 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6" />
            <span>Send Message</span>
          </button>
        </div>
      </form>

      {/* Gentle Reassurance Note */}
      <div className="text-center py-2">
        <p className="text-[#78716C] font-medium text-base sm:text-lg">
          Remember: There are no silly questions. Ask whatever comes to mind!
        </p>
      </div>
    </div>
  );
};
