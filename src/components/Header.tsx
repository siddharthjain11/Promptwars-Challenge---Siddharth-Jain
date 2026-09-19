import React from "react";
import { Screen } from "../types";
import { Home, VolumeX, Type, Heart } from "lucide-react";
import { speech } from "../utils/speech";

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  isLargeText,
  onToggleLargeText,
  isSpeaking,
  onStopSpeaking,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b-2 border-[#E7E2D8] shadow-xs px-4 sm:px-8 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: App Title & Reassuring Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speech.stop();
              onNavigate("home");
            }}
            id="brand-home-button"
            className="flex items-center gap-3 text-left focus:outline-hidden focus:ring-4 focus:ring-amber-400 rounded-xl p-1 transition"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shadow-md">
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
            </div>
            <div>
              <span className="block font-bold text-xl sm:text-2xl text-[#1C1917] tracking-tight">
                Evergreen Partner
              </span>
              <span className="block text-sm sm:text-base text-[#78716C] font-medium">
                Simple & Warm Assistant
              </span>
            </div>
          </button>
        </div>

        {/* Right Actions: Home Button & Audio/Font Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Audio Stop Button (shows when voice is actively reading) */}
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              id="stop-audio-button"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border-2 border-rose-300 font-bold text-base sm:text-lg animate-pulse shadow-sm focus:outline-hidden focus:ring-4 focus:ring-rose-400"
              title="Stop reading aloud"
            >
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-rose-700" />
              <span className="hidden sm:inline">Stop Voice</span>
            </button>
          )}

          {/* Text Size Accessibility Toggle */}
          <button
            onClick={onToggleLargeText}
            id="toggle-text-size-button"
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border-2 font-bold text-base sm:text-lg transition focus:outline-hidden focus:ring-4 focus:ring-amber-400 ${
              isLargeText
                ? "bg-amber-100 text-amber-950 border-amber-400"
                : "bg-white text-[#292524] border-[#D6D0C4] hover:bg-[#F5F0E6]"
            }`}
            title="Toggle extra large text"
          >
            <Type className="w-5 h-5" />
            <span className="hidden md:inline">
              {isLargeText ? "Text: Extra Large" : "Text: Standard"}
            </span>
            <span className="md:hidden">{isLargeText ? "A+" : "A"}</span>
          </button>

          {/* CLEARLY VISIBLE "HOME" BUTTON ON EVERY SCREEN */}
          {currentScreen !== "home" ? (
            <button
              onClick={() => {
                speech.stop();
                speech.playChime("gentle");
                onNavigate("home");
              }}
              id="global-home-nav-button"
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#292524] hover:bg-[#1C1917] text-white font-bold text-base sm:text-xl shadow-md transition transform active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-amber-400"
            >
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              <span>Go Home</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Home Screen
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
