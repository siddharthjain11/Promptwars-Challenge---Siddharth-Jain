import React, { useState, useEffect } from "react";
import { Screen, Reminder } from "./types";
import { INITIAL_REMINDERS } from "./data/guides";
import { Header } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { CompanionScreen } from "./components/CompanionScreen";
import { RemindersScreen } from "./components/RemindersScreen";
import { SimplifyScreen } from "./components/SimplifyScreen";
import { HelpAndEmergencyScreen } from "./components/HelpAndEmergencyScreen";
import { speech } from "./utils/speech";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [isLargeText, setIsLargeText] = useState<boolean>(() => {
    return localStorage.getItem("senior_companion_large_text") === "true";
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem("senior_companion_reminders");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_REMINDERS;
      }
    }
    return INITIAL_REMINDERS;
  });

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem(
      "senior_companion_reminders",
      JSON.stringify(reminders)
    );
  }, [reminders]);

  // Save large text preference
  useEffect(() => {
    localStorage.setItem(
      "senior_companion_large_text",
      isLargeText.toString()
    );
  }, [isLargeText]);

  // Monitor speaking status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(speech.isSpeaking());
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleAddReminder = (
    newRem: Omit<Reminder, "id" | "completed">
  ) => {
    const reminder: Reminder = {
      ...newRem,
      id: "rem-" + Date.now(),
      completed: false,
    };
    setReminders((prev) => [reminder, ...prev]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateReminder = (
    id: string,
    updated: Partial<Omit<Reminder, "id">>
  ) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  const handleStopSpeaking = () => {
    speech.stop();
    setIsSpeaking(false);
  };

  const handleNavigate = (screen: Screen) => {
    speech.stop();
    setIsSpeaking(false);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`min-h-screen bg-[#FAF7F2] text-[#292524] flex flex-col font-sans transition-all duration-200 ${
        isLargeText ? "text-lg" : "text-base"
      }`}
    >
      {/* Universal Header with Brand, Home button, Audio Stop, and Text Size Toggle */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isLargeText={isLargeText}
        onToggleLargeText={() => setIsLargeText(!isLargeText)}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
      />

      {/* Main Screen Content */}
      <main className="flex-1 pb-16">
        {currentScreen === "home" && (
          <HomeScreen
            onNavigate={handleNavigate}
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            isLargeText={isLargeText}
          />
        )}

        {currentScreen === "companion" && (
          <CompanionScreen
            onBackToHome={() => handleNavigate("home")}
            isLargeText={isLargeText}
          />
        )}

        {currentScreen === "reminders" && (
          <RemindersScreen
            onBackToHome={() => handleNavigate("home")}
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            isLargeText={isLargeText}
          />
        )}

        {currentScreen === "simplify" && (
          <SimplifyScreen
            onBackToHome={() => handleNavigate("home")}
            isLargeText={isLargeText}
          />
        )}

        {(currentScreen === "tasks" || currentScreen === "emergency") && (
          <HelpAndEmergencyScreen
            onBackToHome={() => handleNavigate("home")}
            isLargeText={isLargeText}
          />
        )}
      </main>

      {/* Reassuring Footer with Persistent Home Access */}
      <footer className="bg-[#FAF7F2] border-t-2 border-[#E7E2D8] py-6 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#78716C] font-semibold text-base sm:text-lg">
            Another Partner • Made with care for your peace of mind
          </p>

          {currentScreen !== "home" && (
            <button
              onClick={() => handleNavigate("home")}
              className="px-5 py-2.5 rounded-xl bg-[#292524] text-white font-bold text-base hover:bg-[#1C1917] transition active:scale-95 shadow-xs"
            >
              Return to Home Screen
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
