import React, { useState, useEffect, useRef } from "react";
import { Screen, AppLanguage } from "../types";
import {
  Settings,
  PhoneCall,
  VolumeX,
} from "lucide-react";
import { speech } from "../utils/speech";
import { UI_TRANSLATIONS } from "../utils/translations";

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isLargeText?: boolean;
  onToggleLargeText?: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onTriggerEmergency: () => void;
  onOpenSettings: () => void;
  onOpenLogin?: () => void;
  onOpenProfile?: () => void;
  currentLanguage: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen: _currentScreen,
  onNavigate,
  isSpeaking,
  onStopSpeaking,
  onTriggerEmergency,
  onOpenSettings,
  currentLanguage,
  onSelectLanguage: _onSelectLanguage,
}) => {
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* LEFT: Logo & App Name - Clean and direct to Home */}
        <button
          onClick={() => {
            speech.stop();
            onNavigate("home");
          }}
          id="brand-home-button"
          className="flex items-center gap-2.5 text-left focus:outline-hidden focus:ring-2 focus:ring-sky-300 rounded-xl p-1 transition cursor-pointer shrink-0"
          aria-label="Go to Home"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs border border-sky-500 transition shrink-0">
            <span className="text-2xl" role="img" aria-label="Hug emoji">
              🤗
            </span>
          </div>
          <div>
            <span className="block font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
              Another Partner
            </span>
            <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
              Daily Companion for Seniors
            </span>
          </div>
        </button>

        {/* RIGHT: Scroll-free, streamlined controls: Stop Voice (if active), Emergency (Red Icon Only), Settings (Icon Only) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Speaking Indicator with quick stop */}
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              id="stop-audio-button"
              className="h-11 px-3 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs animate-pulse cursor-pointer shrink-0 transition"
              title={t.stopVoice || "Stop Voice"}
              aria-label="Stop Voice"
            >
              <VolumeX className="w-5 h-5 text-rose-600" />
              <span className="hidden sm:inline font-bold">Stop Voice</span>
            </button>
          )}

          {/* Emergency Icon Only in RED */}
          <button
            onClick={() => {
              speech.stop();
              onTriggerEmergency();
            }}
            id="header-emergency-red-icon-button"
            className="w-11 h-11 inline-flex items-center justify-center rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md transition active:scale-95 cursor-pointer ring-2 ring-red-200 shrink-0"
            title="Emergency Alert (Calls & Notifies Family)"
            aria-label="Emergency"
          >
            <PhoneCall className="w-5 h-5 text-white animate-bounce" />
          </button>

          {/* Settings Icon Only */}
          <button
            onClick={() => {
              speech.stop();
              onOpenSettings();
            }}
            id="header-settings-icon-button"
            className="w-11 h-11 inline-flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
            title={t.settings || "Settings, Language & Audio Guide"}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>
    </header>
  );
};
