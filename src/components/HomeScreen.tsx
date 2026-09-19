import React, { useState, useEffect } from "react";
import { Screen, Reminder, UserProfile, AppLanguage } from "../types";
import {
  MessageSquareHeart,
  FileText,
  CalendarCheck,
  LifeBuoy,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Sparkles,
  FolderHeart,
  ShieldAlert,
  ShieldCheck,
  Ambulance,
  Brain,
  ArrowRight,
  UserCheck,
  Headphones,
} from "lucide-react";
import { speech } from "../utils/speech";
import { UI_TRANSLATIONS } from "../utils/translations";

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  isLargeText: boolean;
  user?: UserProfile;
  onOpenProfile?: () => void;
  currentLanguage?: AppLanguage;
  isAudioDescEnabled?: boolean;
  onPlayAudioDesc?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  reminders,
  onToggleReminder,
  isLargeText,
  user,
  onOpenProfile,
  currentLanguage = "en",
  isAudioDescEnabled = false,
  onPlayAudioDesc,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [greeting, setGreeting] = useState<string>("Good morning");
  const [suggestion, setSuggestion] = useState<string>(
    "It is a lovely day. Remember to enjoy a warm drink and check your morning medicine."
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

  const friendlyName = user?.preferredName || user?.name || "friend";

  // Fetch proactive greeting based on time of day
  useEffect(() => {
    const hour = currentTime.getHours();
    let baseGreeting = "Good morning";
    let defaultSuggestion =
      "Have you taken your morning medication and had a warm sip of tea or water?";

    if (hour >= 12 && hour < 17) {
      baseGreeting = "Good afternoon";
      defaultSuggestion =
        "Time for a gentle afternoon pause. A glass of fresh water and resting your eyes would be wonderful.";
    } else if (hour >= 17) {
      baseGreeting = "Good evening";
      defaultSuggestion =
        "As the day winds down, remember to check your evening medicine and relax your shoulders.";
    }

    setGreeting(`${baseGreeting}, ${friendlyName}!`);
    setSuggestion(defaultSuggestion);

    // Proactive AI greeting
    async function fetchAiGreeting() {
      try {
        setIsLoadingGreeting(true);
        const res = await fetch("/api/companion/greeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hour, userName: friendlyName }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.greeting) setGreeting(data.greeting);
          if (data.suggestion) setSuggestion(data.suggestion);
        }
      } catch (err) {
        console.warn("Using default greeting:", err);
      } finally {
        setIsLoadingGreeting(false);
      }
    }

    fetchAiGreeting();
  }, [friendlyName]);

  // Keep greeting speaking state synced with global speech
  useEffect(() => {
    const unsubscribe = speech.subscribe((speaking) => {
      if (!speaking) {
        setIsSpeakingGreeting(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Count uncompleted reminders
  const uncompletedCount = reminders.filter((r) => !r.completed).length;

  // Read aloud greeting and suggestion with toggle support
  const handleSpeakGreeting = () => {
    if (isSpeakingGreeting || speech.isSpeaking()) {
      speech.stop();
      setIsSpeakingGreeting(false);
      return;
    }

    const fullText = `${greeting} Here is your thought for today: ${suggestion}`;
    setIsSpeakingGreeting(true);
    speech.speak(fullText, {
      lang: currentLanguage,
      onStart: () => setIsSpeakingGreeting(true),
      onEnd: () => setIsSpeakingGreeting(false),
      onError: () => setIsSpeakingGreeting(false),
    });
  };

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Welcoming Banner (Clean & Serene) */}
      <section
        id="welcome-banner"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl" role="img" aria-label="Hug">
                🤗
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Another Partner • Daily Companion
              </span>
            </div>
            <h1
              className={`font-serif font-bold text-slate-900 tracking-tight ${
                isLargeText ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              }`}
            >
              {greeting}
            </h1>
            <p
              className={`text-slate-500 mt-1 font-normal ${
                isLargeText ? "text-lg sm:text-xl" : "text-base"
              }`}
            >
              Take your time today. Everything here is simple and stress-free.
            </p>
          </div>

          {/* Clean Clock & Date Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3.5 flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 text-slate-900">
              <Clock className="w-4 h-4 text-sky-600" />
              <span className="text-xl font-bold tracking-tight">
                {formattedTime}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-slate-600 text-xs sm:text-sm font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Proactive Suggestion Pill */}
        <div className="mt-5 bg-sky-50/60 border border-sky-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
                {t.dailyThought}
              </span>
              <p
                className={`text-slate-800 font-medium leading-snug mt-0.5 ${
                  isLargeText ? "text-lg sm:text-xl" : "text-sm sm:text-base"
                }`}
              >
                {isLoadingGreeting ? "Thinking of a warm thought for you..." : suggestion}
              </p>
            </div>
          </div>

          <button
            onClick={handleSpeakGreeting}
            id="listen-greeting-button"
            className={`self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer shrink-0 ${
              isSpeakingGreeting
                ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 ring-1 ring-rose-300"
                : "bg-white hover:bg-sky-50 text-sky-800 border-sky-200"
            }`}
          >
            {isSpeakingGreeting ? (
              <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-600" />
            )}
            <span>{isSpeakingGreeting ? t.stopVoice : t.readToMe}</span>
          </button>
        </div>

        {/* Audio Description Banner (when enabled) */}
        {isAudioDescEnabled && onPlayAudioDesc && (
          <div className="mt-4 bg-sky-100/90 border-2 border-sky-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sky-950 text-sm sm:text-base">
                  {currentLanguage === "hi"
                    ? "ऑडियो विवरण चालू है"
                    : currentLanguage === "hinglish"
                    ? "Audio Description Active Hai"
                    : "Audio Description is Active"}
                </p>
                <p className="text-sky-800 text-xs sm:text-sm">
                  {currentLanguage === "hi"
                    ? "मुख्य स्क्रीन और उपलब्ध विकल्पों का ऑडियो सुनने के लिए टैप करें।"
                    : currentLanguage === "hinglish"
                    ? "Home screen aur saare main features ka audio sunne ke liye tap karein."
                    : "Tap to listen to a clear spoken description of your screen and options."}
                </p>
              </div>
            </div>
            <button
              onClick={onPlayAudioDesc}
              id="home-play-audio-desc-btn"
              className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs sm:text-sm shadow-2xs transition active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.readScreenDesc}</span>
            </button>
          </div>
        )}

        {/* Optional Profile Reminder Chip (Discrete & Clean) */}
        {(!user?.preferredName && !user?.name) && onOpenProfile && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>Would you like to tell us your name or emergency contact?</span>
            </div>
            <button
              onClick={onOpenProfile}
              className="text-sky-700 font-bold hover:underline cursor-pointer ml-2 shrink-0"
            >
              Add Profile Details (Optional) →
            </button>
          </div>
        )}
      </section>

      {/* 2. THE PRIMARY SERVICES GRID (CLEAN, MINIMALIST & SPACIOUS) */}
      <section aria-label="Main Daily Tasks">
        <h2 className="sr-only">Main Daily Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* CARD 1: SCAM & FRAUD CHECKER */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("scam-checker");
            }}
            id="nav-scam-checker-button"
            className="group text-left bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[210px] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Fraud Check
                </span>
              </div>

              <h3
                className={`font-bold text-slate-900 group-hover:text-amber-950 transition ${
                  isLargeText ? "text-xl sm:text-2xl" : "text-lg"
                }`}
              >
                {t.scamCardTitle}
              </h3>
              <p
                className={`text-slate-500 font-normal mt-1 leading-relaxed ${
                  isLargeText ? "text-base" : "text-xs sm:text-sm"
                }`}
              >
                {t.scamCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-amber-800 font-bold text-xs sm:text-sm">
              <span>{t.checkMessage}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* CARD 2: BRAIN & MEMORY GAMES */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("games");
            }}
            id="nav-brain-games-button"
            className="group text-left bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[210px] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Daily Play
                </span>
              </div>

              <h3
                className={`font-bold text-slate-900 group-hover:text-emerald-950 transition ${
                  isLargeText ? "text-xl sm:text-2xl" : "text-lg"
                }`}
              >
                {t.gamesCardTitle}
              </h3>
              <p
                className={`text-slate-500 font-normal mt-1 leading-relaxed ${
                  isLargeText ? "text-base" : "text-xs sm:text-sm"
                }`}
              >
                {t.gamesCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-800 font-bold text-xs sm:text-sm">
              <span>{t.playGames}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* CARD 3: TALK WITH COMPANION */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("companion");
            }}
            id="nav-talk-companion-button"
            className="group text-left bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-sky-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[210px] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200/60">
                  <MessageSquareHeart className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  Voice & Chat
                </span>
              </div>

              <h3
                className={`font-bold text-slate-900 group-hover:text-sky-900 transition ${
                  isLargeText ? "text-xl sm:text-2xl" : "text-lg"
                }`}
              >
                {t.companionCardTitle}
              </h3>
              <p
                className={`text-slate-500 font-normal mt-1 leading-relaxed ${
                  isLargeText ? "text-base" : "text-xs sm:text-sm"
                }`}
              >
                {t.companionCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sky-700 font-bold text-xs sm:text-sm">
              <span>{t.openChat}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* CARD 4: DAILY REMINDERS */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("reminders");
            }}
            id="nav-daily-reminders-button"
            className="group text-left bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-sky-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[210px] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    uncompletedCount > 0
                      ? "bg-amber-50 text-amber-900 border border-amber-200"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  }`}
                >
                  {uncompletedCount > 0 ? `${uncompletedCount} to do` : "All Done ✓"}
                </span>
              </div>

              <h3
                className={`font-bold text-slate-900 group-hover:text-blue-900 transition ${
                  isLargeText ? "text-xl sm:text-2xl" : "text-lg"
                }`}
              >
                {t.remindersCardTitle}
              </h3>
              <p
                className={`text-slate-500 font-normal mt-1 leading-relaxed ${
                  isLargeText ? "text-base" : "text-xs sm:text-sm"
                }`}
              >
                {t.remindersCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-blue-700 font-bold text-xs sm:text-sm">
              <span>{t.viewReminders}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* CARD 5: READ & SIMPLIFY LETTERS */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("simplify");
            }}
            id="nav-read-simplify-button"
            className="group text-left bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-teal-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[210px] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/60">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Plain Words
                </span>
              </div>

              <h3
                className={`font-bold text-slate-900 group-hover:text-teal-900 transition ${
                  isLargeText ? "text-xl sm:text-2xl" : "text-lg"
                }`}
              >
                {t.simplifyCardTitle}
              </h3>
              <p
                className={`text-slate-500 font-normal mt-1 leading-relaxed ${
                  isLargeText ? "text-base" : "text-xs sm:text-sm"
                }`}
              >
                {t.simplifyCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-teal-700 font-bold text-xs sm:text-sm">
              <span>{t.readSimplify}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* CARD 6: IMPORTANT DOCUMENTS */}
          <button
            onClick={() => {
              speech.stop();
              onNavigate("documents");
            }}
            id="nav-important-documents-button"
            className="group text-left bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-sky-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between min-h-[210px] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/60">
                  <FolderHeart className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  Documents
                </span>
              </div>

              <h3
                className={`font-bold text-slate-900 group-hover:text-indigo-900 transition ${
                  isLargeText ? "text-xl sm:text-2xl" : "text-lg"
                }`}
              >
                {t.documentsCardTitle}
              </h3>
              <p
                className={`text-slate-500 font-normal mt-1 leading-relaxed ${
                  isLargeText ? "text-base" : "text-xs sm:text-sm"
                }`}
              >
                {t.documentsCardDesc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-indigo-700 font-bold text-xs sm:text-sm">
              <span>{t.openDocuments}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>
        </div>

        {/* DIGITAL LITERACY BANNER (CLEAN & MINIMALIST) */}
        <div className="mt-5">
          <button
            onClick={() => {
              speech.stop();
              onNavigate("tasks");
            }}
            id="nav-help-tasks-button"
            className="w-full text-left bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-3xl p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {t.guidesTitle}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  {t.guidesDesc}
                </p>
              </div>
            </div>
            <span className="text-sky-700 font-bold text-xs sm:text-sm shrink-0 flex items-center gap-1">
              <span>{t.viewGuides}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </section>

      {/* 3. Reassuring Calm Helpline & Emergency Contacts (Bottom of Page) */}
      <section
        id="emergency-bottom-banner"
        className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Emergency & Helplines (Police 112 • Senior Citizens Helpline 14567)
            </h3>
            <p className="text-slate-500 text-xs font-medium">
              Quick access to 112 emergency services, doctor numbers, and family contacts.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            speech.stop();
            onNavigate("emergency");
          }}
          id="bottom-open-emergency-screen"
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200 transition cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1.5"
        >
          <Ambulance className="w-4 h-4 text-rose-600" />
          <span>Emergency Contacts</span>
        </button>
      </section>
    </div>
  );
};
