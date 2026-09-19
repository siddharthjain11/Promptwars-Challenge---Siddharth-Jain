import React from "react";
import {
  X,
  Palette,
  ShieldCheck,
  Smartphone,
  LogOut,
  Type,
  Check,
  User,
  HeartHandshake,
  MapPin,
  ChevronRight,
  Headphones,
  Globe,
  FolderHeart,
} from "lucide-react";
import { AppTheme, UserProfile, AppLanguage } from "../types";
import { THEMES } from "../utils/theme";
import { speech } from "../utils/speech";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  user: UserProfile;
  onOpenLogin: () => void;
  onLogout: () => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
  onGoogleLogin: () => void;
  onOpenProfile: () => void;
  currentLanguage: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  isAudioDescEnabled: boolean;
  onToggleAudioDesc: () => void;
  onNavigateToDocuments?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  user,
  onOpenLogin,
  onLogout,
  isLargeText,
  onToggleLargeText,
  onGoogleLogin,
  onOpenProfile,
  currentLanguage,
  onSelectLanguage,
  isAudioDescEnabled,
  onToggleAudioDesc,
  onNavigateToDocuments,
}) => {
  if (!isOpen) return null;

  const languages: { id: AppLanguage; title: string; subtitle: string }[] = [
    {
      id: "en",
      title: "English",
      subtitle: "Standard clear English voice and texts",
    },
    {
      id: "hi",
      title: "हिंदी (Hindi)",
      subtitle: "सरल देवनागरी हिंदी एवं आवाज़",
    },
    {
      id: "hinglish",
      title: "Hinglish",
      subtitle: "Conversational Hindi written in English script",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center text-xl shrink-0 border border-sky-100">
              ⚙️
            </div>
            <div>
              <h2
                id="settings-title"
                className="font-serif font-bold text-xl sm:text-2xl text-slate-900"
              >
                App Settings
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                Themes, optional profile & preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. PROFILE DETAILS (NOT MANDATORY) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-base text-slate-900">
                Profile Details
              </h3>
            </div>
            <span className="text-xs text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-semibold">
              Not Mandatory
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-sm sm:text-base">
                {user.preferredName || user.name || "Senior Friend"}
              </p>
              <p className="text-xs text-slate-500">
                {user.city ? `📍 ${user.city}` : "Personalize what your companion calls you"}
                {user.emergencyContactName ? ` • Emergency: ${user.emergencyContactName}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-sky-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
            >
              <span>Edit Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. THEMES SECTION (LIGHT SHADES ONLY) */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-base text-slate-900">
              Color Theme (Light Shades)
            </h3>
          </div>
          <p className="text-slate-500 text-xs">
            Choose a soothing, soft pastel tone that feels easiest on your eyes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {(Object.keys(THEMES) as AppTheme[]).map((themeKey) => {
              const t = THEMES[themeKey];
              const isSelected = currentTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => {
                    onSelectTheme(themeKey);
                    speech.speak(`Theme changed to ${t.name}`);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? "border-sky-500 bg-sky-50/70 shadow-2xs ring-1 ring-sky-300"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: t.previewColor }}
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                        {t.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block leading-tight">
                        {t.description}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-sky-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. USER ACCOUNT & GOOGLE / MOBILE SIGN IN */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-base text-slate-900">
              Account & Storage
            </h3>
          </div>

          {/* Privacy reassurance message */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-emerald-900 text-xs leading-snug">
              <strong>Data Privacy:</strong> No data is ever shared or sold. Everything stays strictly for your peace of mind.
            </p>
          </div>

          {user.isLoggedIn ? (
            <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-sky-800 bg-white px-2 py-0.5 rounded-md border border-sky-200">
                    Signed In
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-1">
                    {user.phoneNumber || user.email || user.name || "Senior Account"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Connected via {user.authProvider === "google" ? "Google" : "Mobile Phone"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 font-bold text-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile OTP Login</span>
              </button>

              <button
                type="button"
                onClick={onGoogleLogin}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign In</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. LANGUAGE SELECTION (English, Hindi, Hinglish) */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-base text-slate-900">
              Language / भाषा
            </h3>
          </div>
          <p className="text-slate-500 text-xs">
            Choose your preferred language for text and spoken guidance:
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {languages.map((lang) => {
              const isSelected = currentLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang.id);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? "border-sky-500 bg-sky-50/80 ring-1 ring-sky-300 shadow-2xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {lang.title}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {lang.subtitle}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. AUDIO DESCRIPTION TOGGLE */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-base text-slate-900">
              Audio Description (Voice Guide)
            </h3>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="pr-3">
              <span className="font-bold text-slate-900 text-sm block">
                Enable Spoken Descriptions
              </span>
              <span className="text-xs text-slate-500 block leading-relaxed">
                Describes what is visible on screen, steps, and key buttons out loud.
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleAudioDesc}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 shadow-2xs ${
                isAudioDescEnabled
                  ? "bg-sky-600 text-white shadow-sky-200"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isAudioDescEnabled ? "Enabled (ON)" : "Disabled (OFF)"}
            </button>
          </div>
        </div>

        {/* 6. IMPORTANT DOCUMENTS SHORTCUT (especially convenient for mobile) */}
        {onNavigateToDocuments && (
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-base text-slate-900">
                Medical & Important Documents
              </h3>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  Aadhaar, Health Cards & Prescriptions
                </span>
                <span className="text-xs text-slate-500">
                  Quick access to all your saved records
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToDocuments();
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-sky-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Open Documents</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 7. ACCESSIBILITY / TEXT SIZE */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-base text-slate-900">
              Text Size
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                Extra Large Text
              </span>
              <span className="text-xs text-slate-500">
                Increases text across all screens
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleLargeText}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                isLargeText
                  ? "bg-sky-600 text-white shadow-2xs"
                  : "bg-white text-slate-700 border border-slate-300"
              }`}
            >
              {isLargeText ? "Large Active" : "Standard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
