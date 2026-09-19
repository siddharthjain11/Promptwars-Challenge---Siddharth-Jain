import React, { useState, useEffect } from "react";
import { Screen, Reminder } from "../types";
import {
  MessageSquareHeart,
  FileText,
  CalendarCheck,
  LifeBuoy,
  Volume2,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { speech } from "../utils/speech";

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  isLargeText: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  reminders,
  onToggleReminder,
  isLargeText,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState<string>("Good morning, friend!");
  const [suggestion, setSuggestion] = useState<string>(
    "It is a lovely morning. Remember to enjoy a warm drink and check your morning medicine."
  );
  const [isLoadingGreeting, setIsLoadingGreeting] = useState<boolean>(false);
  const [isSpeakingGreeting, setIsSpeakingGreeting] = useState<boolean>(false);

  // Update real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch proactive greeting based on time of day
  useEffect(() => {
    const hour = currentTime.getHours();
    let defaultGreeting = "Good morning, friend!";
    let defaultSuggestion =
      "Have you taken your morning medication and had a warm sip of tea or water?";

    if (hour >= 12 && hour < 17) {
      defaultGreeting = "Good afternoon, friend!";
      defaultSuggestion =
        "Time for a gentle afternoon pause. A glass of fresh water and resting your eyes would be wonderful.";
    } else if (hour >= 17) {
      defaultGreeting = "Good evening, friend!";
      defaultSuggestion =
        "As the day winds down, remember to check your evening medicine and relax your shoulders.";
    }

    setGreeting(defaultGreeting);
    setSuggestion(defaultSuggestion);

    // Fetch proactive AI greeting from server
    async function fetchAiGreeting() {
      try {
        setIsLoadingGreeting(true);
        const res = await fetch("/api/companion/greeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hour, userName: "friend" }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.greeting) setGreeting(data.greeting);
          if (data.suggestion) setSuggestion(data.suggestion);
        }
      } catch (err) {
        console.warn("Could not load AI greeting, using default warm greeting:", err);
      } finally {
        setIsLoadingGreeting(false);
      }
    }

    fetchAiGreeting();
  }, []);

  // Count uncompleted reminders
  const uncompletedCount = reminders.filter((r) => !r.completed).length;
  const firstUncompleted = reminders.find((r) => !r.completed);

  // Read aloud greeting and suggestion
  const handleSpeakGreeting = () => {
    const fullText = `${greeting}. Here is your gentle suggestion for today: ${suggestion}`;
    setIsSpeakingGreeting(true);
    speech.speak(fullText, {
      onStart: () => setIsSpeakingGreeting(true),
      onEnd: () => setIsSpeakingGreeting(false),
      onError: () => setIsSpeakingGreeting(false),
    });
  };

  // Format date nicely: e.g. "Friday, September 19, 2026"
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Welcoming Banner with Date & Time */}
      <section
        id="welcome-banner"
        className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#E7E2D8] shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0EBE1] pb-6">
          <div>
            <h1
              className={`font-serif font-semibold text-[#1C1917] tracking-tight ${
                isLargeText ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl"
              }`}
            >
              {greeting}
            </h1>
            <p
              className={`text-[#78716C] mt-2 font-medium ${
                isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
              }`}
            >
              Take your time today. We are here to help with everything.
            </p>
          </div>

          {/* Big, Clear Clock & Date Box */}
          <div className="bg-[#FAF7F2] border-2 border-[#E7E2D8] rounded-2xl p-4 sm:p-5 flex flex-col items-start md:items-end justify-center min-w-[220px]">
            <div className="flex items-center gap-2 text-[#B45309] font-bold">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {formattedTime}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#57534E] font-semibold text-base sm:text-lg mt-1">
              <Calendar className="w-4 h-4 text-[#78716C]" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Proactive Suggestion Card */}
        <div className="mt-6 bg-[#FEF3C7]/60 border-2 border-[#FDE68A] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#92400E]">
                Today's Friendly Thought
              </span>
              <p
                className={`font-semibold text-[#78350F] leading-snug mt-1 ${
                  isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                }`}
              >
                {isLoadingGreeting ? "Thinking of a warm thought for you..." : suggestion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={handleSpeakGreeting}
              id="listen-greeting-button"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-base sm:text-lg shadow-sm transition active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-amber-400"
            >
              <Volume2
                className={`w-6 h-6 ${isSpeakingGreeting ? "animate-bounce" : ""}`}
              />
              <span>{isSpeakingGreeting ? "Reading..." : "Read to Me"}</span>
            </button>

            {firstUncompleted && (
              <button
                onClick={() => onToggleReminder(firstUncompleted.id)}
                id="quick-complete-reminder-button"
                className="hidden lg:flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-400 font-bold text-base transition shadow-xs"
                title={`Mark '${firstUncompleted.title}' as done`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Mark 1st Task Done</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. THE 4 BIG PRIMARY BUTTONS */}
      <section aria-label="Main Daily Tasks">
        <h2 className="sr-only">Main Daily Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* BUTTON 1: TALK TO MY COMPANION */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("companion");
            }}
            id="nav-talk-companion-button"
            className="group text-left bg-white hover:bg-[#FFFBEB] active:bg-[#FEF3C7] border-3 border-[#E7E2D8] hover:border-[#D97706] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] focus:outline-hidden focus:ring-4 focus:ring-amber-400"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 group-hover:bg-amber-500 text-amber-900 group-hover:text-white flex items-center justify-center transition shadow-xs">
                <MessageSquareHeart className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-sm sm:text-base">
                Voice & Text
              </span>
            </div>

            <div className="mt-4">
              <h3
                className={`font-bold text-[#1C1917] group-hover:text-[#B45309] transition ${
                  isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                Talk to My Companion
              </h3>
              <p
                className={`text-[#57534E] font-medium mt-1.5 leading-relaxed ${
                  isLargeText ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                }`}
              >
                Ask any question in plain words, or enjoy a friendly, reassuring chat anytime.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center text-[#B45309] font-bold text-lg sm:text-xl">
              <span>Press to Start Chatting →</span>
            </div>
          </button>

          {/* BUTTON 2: READ THIS FOR ME */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("simplify");
            }}
            id="nav-read-simplify-button"
            className="group text-left bg-white hover:bg-[#F0FDF4] active:bg-[#DCFCE7] border-3 border-[#E7E2D8] hover:border-emerald-600 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] focus:outline-hidden focus:ring-4 focus:ring-emerald-400"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-900 group-hover:text-white flex items-center justify-center transition shadow-xs">
                <FileText className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-sm sm:text-base">
                Reads Out Loud
              </span>
            </div>

            <div className="mt-4">
              <h3
                className={`font-bold text-[#1C1917] group-hover:text-emerald-800 transition ${
                  isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                Read This for Me
              </h3>
              <p
                className={`text-[#57534E] font-medium mt-1.5 leading-relaxed ${
                  isLargeText ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                }`}
              >
                Confusing letter, bill, or pill bottle? We simplify it into 3 clear points and read it out loud.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center text-emerald-800 font-bold text-lg sm:text-xl">
              <span>Press to Read & Simplify →</span>
            </div>
          </button>

          {/* BUTTON 3: DAILY REMINDERS */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("reminders");
            }}
            id="nav-daily-reminders-button"
            className="group text-left bg-white hover:bg-[#EFF6FF] active:bg-[#DBEAFE] border-3 border-[#E7E2D8] hover:border-sky-600 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] focus:outline-hidden focus:ring-4 focus:ring-sky-400"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-100 group-hover:bg-sky-600 text-sky-900 group-hover:text-white flex items-center justify-center transition shadow-xs">
                <CalendarCheck className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
              <span
                className={`px-3.5 py-1.5 rounded-full font-bold text-sm sm:text-base ${
                  uncompletedCount > 0
                    ? "bg-amber-100 text-amber-900"
                    : "bg-emerald-100 text-emerald-900"
                }`}
              >
                {uncompletedCount > 0
                  ? `${uncompletedCount} to do`
                  : "All Done Today! ✓"}
              </span>
            </div>

            <div className="mt-4">
              <h3
                className={`font-bold text-[#1C1917] group-hover:text-sky-800 transition ${
                  isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                Daily Reminders
              </h3>
              <p
                className={`text-[#57534E] font-medium mt-1.5 leading-relaxed ${
                  isLargeText ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                }`}
              >
                Your medicine, appointments, and water reminders. Big buttons, no confusing calendars.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center text-sky-800 font-bold text-lg sm:text-xl">
              <span>View Reminders →</span>
            </div>
          </button>

          {/* BUTTON 4: HELP WITH A TASK & FAMILY CONTACT */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("tasks");
            }}
            id="nav-help-emergency-button"
            className="group text-left bg-white hover:bg-[#FFF1F2] active:bg-[#FFE4E6] border-3 border-[#E7E2D8] hover:border-rose-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[220px] sm:min-h-[250px] focus:outline-hidden focus:ring-4 focus:ring-rose-400"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-100 group-hover:bg-rose-600 text-rose-900 group-hover:text-white flex items-center justify-center transition shadow-xs">
                <LifeBuoy className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 font-bold text-sm sm:text-base">
                Call Family & Guides
              </span>
            </div>

            <div className="mt-4">
              <h3
                className={`font-bold text-[#1C1917] group-hover:text-rose-800 transition ${
                  isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                Help with a Task & Family
              </h3>
              <p
                className={`text-[#57534E] font-medium mt-1.5 leading-relaxed ${
                  isLargeText ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                }`}
              >
                One-tap to call your daughter or son, plus easy step-by-step guides for video calls and phone tasks.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center text-rose-800 font-bold text-lg sm:text-xl">
              <span>Open Help & Contacts →</span>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Reassurance Footer Box */}
      <section
        id="peace-of-mind-box"
        className="bg-[#FAF7F2] border-2 border-[#E7E2D8] rounded-2xl p-5 text-center"
      >
        <p className="text-[#78716C] font-semibold text-base sm:text-lg">
          🌿 You are safe here. Nothing can be broken. Press any button anytime to explore.
        </p>
      </section>
    </div>
  );
};
