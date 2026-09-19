import React, { useState, useEffect } from "react";
import {
  X,
  User,
  HeartHandshake,
  MapPin,
  Sparkles,
  ShieldCheck,
  Save,
  Calendar,
  Volume2,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "../types";
import { speech } from "../utils/speech";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  isLargeText?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  isLargeText = false,
}) => {
  const [preferredName, setPreferredName] = useState(user.preferredName || user.name || "");
  const [gender, setGender] = useState<"female" | "male" | "other" | undefined>(user.gender);
  const [birthYear, setBirthYear] = useState(user.birthYear || "");
  const [emergencyContactName, setEmergencyContactName] = useState(user.emergencyContactName || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user.emergencyContactPhone || "");
  const [city, setCity] = useState(user.city || "");
  const [favoriteInterests, setFavoriteInterests] = useState(user.favoriteInterests || "");
  const [healthNotes, setHealthNotes] = useState(user.healthNotes || "");
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreferredName(user.preferredName || user.name || "");
      setGender(user.gender);
      setBirthYear(user.birthYear || "");
      setEmergencyContactName(user.emergencyContactName || "");
      setEmergencyContactPhone(user.emergencyContactPhone || "");
      setCity(user.city || "");
      setFavoriteInterests(user.favoriteInterests || "");
      setHealthNotes(user.healthNotes || "");
      setIsSavedRecently(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      preferredName: preferredName.trim() || undefined,
      name: preferredName.trim() || user.name || "Senior Friend",
      gender: gender || user.gender || undefined,
      birthYear: birthYear.trim() || undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      city: city.trim() || undefined,
      favoriteInterests: favoriteInterests.trim() || undefined,
      healthNotes: healthNotes.trim() || undefined,
    };

    onSaveProfile(updated);
    setIsSavedRecently(true);
    speech.speakDescription(
      preferredName
        ? `Thank you ${preferredName}, your profile details have been saved.`
        : "Your profile details have been saved."
    );

    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleReadHelp = () => {
    speech.speak(
      "Profile details are completely optional. None of these fields are mandatory. You only need to share whatever makes your day easier, such as your preferred name or an emergency contact."
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xl shrink-0 border border-sky-100">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="profile-modal-title"
                  className={`font-serif font-bold text-slate-900 ${
                    isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                  }`}
                >
                  Profile Details
                </h2>
                <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  Not Mandatory
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Personalize your experience at your own pace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReadHelp}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition cursor-pointer"
              title="Listen to explanation"
              aria-label="Listen to explanation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reassuring Notice: 100% Optional & Private */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="text-slate-800 font-semibold leading-snug">
              Every field below is completely optional.
            </p>
            <p className="text-slate-500 mt-0.5">
              Fill only what makes you comfortable. Your details remain 100% private on your device.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* 1. Preferred Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="profile-preferred-name"
                className="block text-slate-900 font-semibold text-sm sm:text-base"
              >
                What should we call you?
              </label>
              <span className="text-xs text-slate-400 font-medium">Optional</span>
            </div>
            <div className="relative">
              <input
                id="profile-preferred-name"
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g. Margaret, Grandpa John, or Dr. Evans"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder:text-slate-400 outline-hidden text-base"
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-900 font-semibold text-sm sm:text-base">
                Gender
              </label>
              <span className="text-xs text-slate-400">Optional</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`py-2 px-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  gender === "male"
                    ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>👨 Male</span>
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`py-2 px-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  gender === "female"
                    ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>👩 Female</span>
              </button>
              <button
                type="button"
                onClick={() => setGender("other")}
                className={`py-2 px-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  gender === "other"
                    ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>Other</span>
              </button>
            </div>
          </div>

          {/* 2. Birth Year & City (Side by Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="profile-birth-year"
                  className="block text-slate-900 font-semibold text-sm sm:text-base flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Year of Birth</span>
                </label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <input
                id="profile-birth-year"
                type="text"
                maxLength={4}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="e.g. 1952"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder:text-slate-400 outline-hidden text-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="profile-city"
                  className="block text-slate-900 font-semibold text-sm sm:text-base flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>City / Town</span>
                </label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <input
                id="profile-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Springfield, Ohio"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder:text-slate-400 outline-hidden text-base"
              />
            </div>
          </div>

          {/* 3. Emergency Contact (Optional) */}
          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-900 font-semibold text-sm flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-rose-500" />
                Emergency Contact (Optional)
              </span>
              <span className="text-xs text-slate-400">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Contact Name (e.g. Sarah, Daughter)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 bg-white text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
              />
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="Phone Number (e.g. 555-0192)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 bg-white text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
              />
            </div>
          </div>

          {/* 4. Favorite Interests / Topics */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="profile-interests"
                className="block text-slate-900 font-semibold text-sm sm:text-base flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Favorite Hobbies & Interests</span>
              </label>
              <span className="text-xs text-slate-400">Optional</span>
            </div>
            <input
              id="profile-interests"
              type="text"
              value={favoriteInterests}
              onChange={(e) => setFavoriteInterests(e.target.value)}
              placeholder="e.g. Gardening, crossword puzzles, classical music, bird watching"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder:text-slate-400 outline-hidden text-sm sm:text-base"
            />
            <p className="text-xs text-slate-400 mt-1">
              Helps your AI companion bring up topics you genuinely enjoy talking about.
            </p>
          </div>

          {/* 5. Personal or Health Notes (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="profile-health-notes"
                className="block text-slate-900 font-semibold text-sm sm:text-base"
              >
                Special Preferences or Daily Notes
              </label>
              <span className="text-xs text-slate-400">Optional</span>
            </div>
            <textarea
              id="profile-health-notes"
              rows={2}
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              placeholder="e.g. Prefer morning reminders, mild hearing in left ear, loves chamomile tea before bed"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder:text-slate-400 outline-hidden text-sm sm:text-base resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-sm sm:text-base transition cursor-pointer"
            >
              Skip / Cancel
            </button>

            <button
              type="submit"
              id="save-profile-details-btn"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isSavedRecently ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
