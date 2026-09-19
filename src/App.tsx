import React, { useState, useEffect, useRef } from "react";
import { Screen, Reminder, AppTheme, UserProfile, AppLanguage } from "./types";
import { INITIAL_REMINDERS } from "./data/guides";
import { THEMES } from "./utils/theme";
import { Header } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { CompanionScreen } from "./components/CompanionScreen";
import { RemindersScreen } from "./components/RemindersScreen";
import { SimplifyScreen } from "./components/SimplifyScreen";
import { DocumentsScreen } from "./components/DocumentsScreen";
import { EmergencyScreen } from "./components/EmergencyScreen";
import { HelpAndEmergencyScreen } from "./components/HelpAndEmergencyScreen";
import { ScamCheckerScreen } from "./components/ScamCheckerScreen";
import { BrainGamesScreen } from "./components/BrainGamesScreen";
import { EmergencyConfirmModal } from "./components/EmergencyConfirmModal";
import { SettingsModal } from "./components/SettingsModal";
import { LoginModal } from "./components/LoginModal";
import { ProfileModal } from "./components/ProfileModal";
import { speech } from "./utils/speech";
import { SCREEN_AUDIO_DESCRIPTIONS } from "./utils/translations";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [isLargeText, setIsLargeText] = useState<boolean>(() => {
    return localStorage.getItem("senior_companion_large_text") === "true";
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Language State (English, Hindi, Hinglish)
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("senior_companion_language");
    return (saved as AppLanguage) || "en";
  });

  // Audio Description Mode State
  const [isAudioDescEnabled, setIsAudioDescEnabled] = useState<boolean>(() => {
    return localStorage.getItem("senior_companion_audio_desc") === "true";
  });

  // Theme State (All Light Shades)
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("senior_companion_theme");
    return (saved as AppTheme) || "blue";
  });

  // User Authentication State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("senior_companion_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { isLoggedIn: false };
      }
    }
    return { isLoggedIn: false };
  });

  // Modal States
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Reminders state
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

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("senior_companion_theme", currentTheme);
  }, [currentTheme]);

  // Save user profile
  useEffect(() => {
    localStorage.setItem("senior_companion_user", JSON.stringify(user));
  }, [user]);

  // Reactive speech status listener
  useEffect(() => {
    const unsubscribe = speech.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsubscribe();
  }, []);

  // Sync audio description state and language to speech singleton
  useEffect(() => {
    speech.setAudioDescEnabled(isAudioDescEnabled);
  }, [isAudioDescEnabled]);

  useEffect(() => {
    speech.setLanguage(currentLanguage);
  }, [currentLanguage]);

  const navAudioTimeoutRef = useRef<any>(null);

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

  const playScreenAudioDesc = (screen: Screen, lang: AppLanguage = currentLanguage) => {
    // If currently speaking, toggle off
    if (speech.isSpeaking()) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }
    const desc =
      SCREEN_AUDIO_DESCRIPTIONS[lang]?.[screen] ||
      SCREEN_AUDIO_DESCRIPTIONS.en[screen];
    if (desc) {
      speech.speak(desc.speechText, {
        lang,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleToggleAudioDesc = () => {
    const nextVal = !isAudioDescEnabled;
    setIsAudioDescEnabled(nextVal);
    localStorage.setItem("senior_companion_audio_desc", nextVal.toString());
    speech.setAudioDescEnabled(nextVal);

    if (nextVal) {
      const msg =
        currentLanguage === "hi"
          ? "ऑडियो विवरण चालू कर दिया गया है।"
          : currentLanguage === "hinglish"
          ? "Audio description chalu ho gaya hai."
          : "Audio description enabled.";
      speech.speak(msg, {
        lang: currentLanguage,
        onEnd: () => {
          playScreenAudioDesc(currentScreen, currentLanguage);
        },
      });
    } else {
      if (navAudioTimeoutRef.current) {
        clearTimeout(navAudioTimeoutRef.current);
        navAudioTimeoutRef.current = null;
      }
      speech.stop();
      setIsSpeaking(false);
      // When user turns OFF audio description, remain silent and do not speak announcement
    }
  };

  const handleSelectLanguage = (lang: AppLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem("senior_companion_language", lang);
    speech.setLanguage(lang);
    const confirmation =
      lang === "hi"
        ? "भाषा बदलकर हिंदी कर दी गई है।"
        : lang === "hinglish"
        ? "Language Hinglish me set ho gayi hai."
        : "Language set to English.";
    speech.speak(confirmation, { lang });
  };

  const handleStopSpeaking = () => {
    speech.stop();
    setIsSpeaking(false);
  };

  const handleNavigate = (screen: Screen) => {
    if (navAudioTimeoutRef.current) {
      clearTimeout(navAudioTimeoutRef.current);
      navAudioTimeoutRef.current = null;
    }
    speech.stop();
    setIsSpeaking(false);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (isAudioDescEnabled) {
      navAudioTimeoutRef.current = setTimeout(() => {
        playScreenAudioDesc(screen, currentLanguage);
      }, 450);
    }
  };

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser({ isLoggedIn: false });
    speech.speak("Signed out successfully.");
  };

  const handleGoogleLoginDirect = () => {
    const newUser: UserProfile = {
      isLoggedIn: true,
      email: "siddharthgbbs@gmail.com",
      name: "Siddharth",
      preferredName: "Siddharth",
      authProvider: "google",
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    speech.speak("Signed in with Google. Your account is protected.");
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
  };

  const themeConfig = THEMES[currentTheme] || THEMES.blue;

  return (
    <div
      className={`min-h-screen text-slate-900 flex flex-col font-sans transition-colors duration-200 ${
        isLargeText ? "text-lg" : "text-base"
      }`}
      style={{ backgroundColor: themeConfig.bgHex }}
    >
      {/* Universal Header with Brand, Hug emoji, Red Emergency button, Documents, Settings, Login, and Text Size */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isLargeText={isLargeText}
        onToggleLargeText={() => setIsLargeText(!isLargeText)}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
        onTriggerEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        user={user}
        isAudioDescEnabled={isAudioDescEnabled}
        onToggleAudioDesc={handleToggleAudioDesc}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Main Screen Content */}
      <main className="flex-1 pb-16">
        {currentScreen === "home" && (
          <HomeScreen
            onNavigate={handleNavigate}
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            isLargeText={isLargeText}
            user={user}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            currentLanguage={currentLanguage}
            isAudioDescEnabled={isAudioDescEnabled}
            onPlayAudioDesc={() => playScreenAudioDesc("home", currentLanguage)}
          />
        )}

        {currentScreen === "scam-checker" && (
          <ScamCheckerScreen
            onBackToHome={() => handleNavigate("home")}
            isLargeText={isLargeText}
            isAudioDescEnabled={isAudioDescEnabled}
          />
        )}

        {currentScreen === "games" && (
          <BrainGamesScreen
            onBackToHome={() => handleNavigate("home")}
            isLargeText={isLargeText}
            currentLanguage={currentLanguage}
            isAudioDescEnabled={isAudioDescEnabled}
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
            currentLanguage={currentLanguage}
            isAudioDescEnabled={isAudioDescEnabled}
            onAddReminder={handleAddReminder}
            onNavigateToReminders={() => handleNavigate("reminders")}
            onNavigateToDocuments={() => handleNavigate("documents")}
          />
        )}

        {currentScreen === "documents" && (
          <DocumentsScreen
            onBackToHome={() => handleNavigate("home")}
            isLargeText={isLargeText}
          />
        )}

        {currentScreen === "emergency" && (
          <EmergencyScreen
            onBackToHome={() => handleNavigate("home")}
            isLargeText={isLargeText}
          />
        )}

        {currentScreen === "tasks" && (
          <HelpAndEmergencyScreen
            onBackToHome={() => handleNavigate("home")}
            isLargeText={isLargeText}
            isAudioDescEnabled={isAudioDescEnabled}
          />
        )}
      </main>

      {/* 🚨 EMERGENCY CONFIRMATION MODAL (Missed calls to contacts + dials 112) */}
      <EmergencyConfirmModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* ⚙️ SETTINGS MODAL (Light Theme Switcher, Google Login, Data Privacy Message) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(t) => setCurrentTheme(t)}
        user={user}
        onOpenLogin={() => {
          setIsSettingsModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        isLargeText={isLargeText}
        onToggleLargeText={() => setIsLargeText(!isLargeText)}
        onGoogleLogin={handleGoogleLoginDirect}
        onOpenProfile={() => {
          setIsSettingsModalOpen(false);
          setIsProfileModalOpen(true);
        }}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        isAudioDescEnabled={isAudioDescEnabled}
        onToggleAudioDesc={handleToggleAudioDesc}
        onNavigateToDocuments={() => {
          setIsSettingsModalOpen(false);
          handleNavigate("documents");
        }}
      />

      {/* 📱 LOGIN MODAL (Mobile number primary with OTP, Google sign in, optional profile) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={user}
        onLoginSuccess={handleLoginSuccess}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* 👤 OPTIONAL PROFILE DETAILS MODAL (Not Mandatory) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSaveProfile={handleSaveProfile}
        isLargeText={isLargeText}
      />

      {/* Reassuring Footer with Persistent Home Access */}
      <footer
        className="border-t border-slate-200/80 py-5 px-4 text-center transition-colors"
        style={{ backgroundColor: themeConfig.bgHex }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Another Partner • Made with care for your peace of mind
          </p>

          {currentScreen !== "home" && (
            <button
              onClick={() => handleNavigate("home")}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs sm:text-sm hover:bg-slate-800 transition active:scale-95 shadow-xs cursor-pointer"
            >
              Return to Home Screen
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
