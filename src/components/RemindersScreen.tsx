import React, { useState } from "react";
import { Reminder, TimeOfDay } from "../types";
import {
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Pill,
  Sun,
  Sunset,
  Moon,
  Clock,
  CheckCircle2,
  Pencil,
  Footprints,
  Activity,
  Phone,
  Droplets,
  HeartPulse,
  X,
  Sparkles,
  Edit3,
} from "lucide-react";
import { speech } from "../utils/speech";

interface RemindersScreenProps {
  onBackToHome: () => void;
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<Reminder, "id" | "completed">) => void;
  onUpdateReminder?: (id: string, updated: Partial<Omit<Reminder, "id">>) => void;
  onDeleteReminder: (id: string) => void;
  isLargeText: boolean;
}

interface CommonPreset {
  id: string;
  title: string;
  medicineName?: string;
  notes?: string;
  timeOfDay: TimeOfDay;
  timeStr: string;
  isMedicine: boolean;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
}

const COMMON_PRESETS: CommonPreset[] = [
  {
    id: "preset-morning-meds",
    title: "Morning Medicine",
    medicineName: "Blood pressure (Lisinopril 10mg)",
    notes: "Take with a full glass of water and breakfast",
    timeOfDay: "morning",
    timeStr: "8:00 AM",
    isMedicine: true,
    label: "+ Morning Meds",
    sublabel: "Add pill names & dose",
    icon: Pill,
    accentColor: "border-amber-400 hover:bg-amber-50/70",
    badgeBg: "bg-amber-100 text-amber-800",
  },
  {
    id: "preset-walk",
    title: "Go for a Walk",
    notes: "15 to 20 minutes gentle stroll outside in the fresh air",
    timeOfDay: "morning",
    timeStr: "9:30 AM",
    isMedicine: false,
    label: "+ Go for a Walk",
    sublabel: "Fresh air stroll",
    icon: Footprints,
    accentColor: "border-emerald-400 hover:bg-emerald-50/70",
    badgeBg: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "preset-water",
    title: "Drink Fresh Water",
    notes: "Stay refreshed and hydrated",
    timeOfDay: "morning",
    timeStr: "10:30 AM",
    isMedicine: false,
    label: "+ Drink Water",
    sublabel: "Stay hydrated",
    icon: Droplets,
    accentColor: "border-sky-400 hover:bg-sky-50/70",
    badgeBg: "bg-sky-100 text-sky-800",
  },
  {
    id: "preset-workout",
    title: "Workout & Stretching Time",
    notes: "Gentle chair stretches, arm lifts, or light flexibility exercise",
    timeOfDay: "afternoon",
    timeStr: "11:30 AM",
    isMedicine: false,
    label: "+ Workout Time",
    sublabel: "Gentle stretching",
    icon: Activity,
    accentColor: "border-teal-400 hover:bg-teal-50/70",
    badgeBg: "bg-teal-100 text-teal-800",
  },
  {
    id: "preset-lunch-meds",
    title: "Lunch & Vitamins",
    medicineName: "Multivitamin & Vitamin D3",
    notes: "Take after finishing your lunch",
    timeOfDay: "afternoon",
    timeStr: "1:00 PM",
    isMedicine: true,
    label: "+ Lunch Meds",
    sublabel: "Vitamins & pills",
    icon: Pill,
    accentColor: "border-orange-400 hover:bg-orange-50/70",
    badgeBg: "bg-orange-100 text-orange-800",
  },
  {
    id: "preset-family",
    title: "Call Family or Daughter",
    notes: "Quick, cheerful check-in telephone call",
    timeOfDay: "afternoon",
    timeStr: "3:30 PM",
    isMedicine: false,
    label: "+ Call Family",
    sublabel: "Friendly chat",
    icon: Phone,
    accentColor: "border-rose-400 hover:bg-rose-50/70",
    badgeBg: "bg-rose-100 text-rose-800",
  },
  {
    id: "preset-evening-meds",
    title: "Evening Medicine",
    medicineName: "Dinner medicine (e.g. Metformin 500mg, Calcium)",
    notes: "Take with evening meal",
    timeOfDay: "evening",
    timeStr: "6:30 PM",
    isMedicine: true,
    label: "+ Evening Meds",
    sublabel: "Dinner medicine",
    icon: Sunset,
    accentColor: "border-indigo-400 hover:bg-indigo-50/70",
    badgeBg: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "preset-bedtime",
    title: "Bedtime Routine & Medicine",
    medicineName: "Night medicine / eye drops",
    notes: "Wind down, lock the doors, and rest well",
    timeOfDay: "night",
    timeStr: "9:00 PM",
    isMedicine: true,
    label: "+ Bedtime Meds",
    sublabel: "Night routine",
    icon: Moon,
    accentColor: "border-purple-400 hover:bg-purple-50/70",
    badgeBg: "bg-purple-100 text-purple-800",
  },
];

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  onBackToHome,
  reminders,
  onToggleReminder,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  isLargeText,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | TimeOfDay>("all");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Editor Modal state (used for editing existing reminders OR customizing a new one)
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState<string>("");
  const [editorMedicineName, setEditorMedicineName] = useState<string>("");
  const [editorNotes, setEditorNotes] = useState<string>("");
  const [editorTimeOfDay, setEditorTimeOfDay] = useState<TimeOfDay>("morning");
  const [editorTimeStr, setEditorTimeStr] = useState<string>("8:00 AM");
  const [editorIsMedicine, setEditorIsMedicine] = useState<boolean>(true);

  // Open modal to edit an existing reminder
  const handleOpenEdit = (r: Reminder) => {
    speech.stop();
    setEditingReminderId(r.id);
    setEditorTitle(r.title);
    setEditorMedicineName(r.medicineName || "");
    setEditorNotes(r.notes || "");
    setEditorTimeOfDay(r.timeOfDay);
    setEditorTimeStr(r.timeStr);
    setEditorIsMedicine(r.isMedicine ?? false);
    setIsEditorOpen(true);
  };

  // Open modal to create a new reminder from scratch
  const handleOpenAddNew = () => {
    speech.stop();
    setEditingReminderId(null);
    setEditorTitle("");
    setEditorMedicineName("");
    setEditorNotes("");
    setEditorTimeOfDay("morning");
    setEditorTimeStr("8:00 AM");
    setEditorIsMedicine(false);
    setIsEditorOpen(true);
  };

  // Open modal pre-filled with a common preset (lets them edit medicine name, notes, time easily)
  const handleOpenPreset = (preset: CommonPreset) => {
    speech.stop();
    setEditingReminderId(null);
    setEditorTitle(preset.title);
    setEditorMedicineName(preset.medicineName || "");
    setEditorNotes(preset.notes || "");
    setEditorTimeOfDay(preset.timeOfDay);
    setEditorTimeStr(preset.timeStr);
    setEditorIsMedicine(preset.isMedicine);
    setIsEditorOpen(true);
  };

  // Quick 1-tap add preset directly without opening modal
  const handleQuickAddPresetDirect = (e: React.MouseEvent, preset: CommonPreset) => {
    e.stopPropagation();
    onAddReminder({
      title: preset.title,
      medicineName: preset.medicineName,
      notes: preset.notes,
      timeOfDay: preset.timeOfDay,
      timeStr: preset.timeStr,
      isMedicine: preset.isMedicine,
    });
    speech.playChime("gentle");
  };

  // Save the reminder (handles both update and create)
  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorTitle.trim()) return;

    if (editingReminderId) {
      // Update existing
      if (onUpdateReminder) {
        onUpdateReminder(editingReminderId, {
          title: editorTitle.trim(),
          medicineName: editorMedicineName.trim() || undefined,
          notes: editorNotes.trim() || undefined,
          timeOfDay: editorTimeOfDay,
          timeStr: editorTimeStr.trim() || "8:00 AM",
          isMedicine: editorIsMedicine,
        });
      }
    } else {
      // Create new
      onAddReminder({
        title: editorTitle.trim(),
        medicineName: editorMedicineName.trim() || undefined,
        notes: editorNotes.trim() || undefined,
        timeOfDay: editorTimeOfDay,
        timeStr: editorTimeStr.trim() || "8:00 AM",
        isMedicine: editorIsMedicine,
      });
    }

    speech.playChime("gentle");
    setIsEditorOpen(false);
  };

  // Listen / Audio speak for reminder
  const handleSpeak = (r: Reminder) => {
    if (speakingId === r.id) {
      speech.stop();
      setSpeakingId(null);
    } else {
      speech.stop();
      setSpeakingId(r.id);

      let textToSpeak = `Reminder for ${r.timeStr}: ${r.title}. `;
      if (r.medicineName) {
        textToSpeak += `Medicine name: ${r.medicineName}. `;
      }
      if (r.notes) {
        textToSpeak += `Note: ${r.notes}. `;
      }
      textToSpeak += r.completed
        ? "This has already been completed. Good job!"
        : "This is waiting for you to do.";

      speech.speak(textToSpeak, {
        onStart: () => setSpeakingId(r.id),
        onEnd: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    }
  };

  const filteredReminders =
    activeFilter === "all"
      ? reminders
      : reminders.filter((r) => r.timeOfDay === activeFilter);

  const completedCount = reminders.filter((r) => r.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Bar with Go to Home */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border-2 border-sky-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="reminders-back-to-home"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-base sm:text-lg border-2 border-sky-200 transition focus:outline-hidden focus:ring-4 focus:ring-sky-300 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-sky-700" />
            <span>Go to Home</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Hug">
                🤗
              </span>
              <h1
                className={`font-serif font-bold text-slate-900 ${
                  isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                My Daily Reminders
              </h1>
            </div>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              {completedCount} of {reminders.length} completed today
            </p>
          </div>
        </div>

        {/* Big Add Custom Reminder Button */}
        <button
          onClick={handleOpenAddNew}
          id="toggle-custom-reminder-button"
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base sm:text-lg shadow-sm transition active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-sky-300 cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
          <span>Add New Reminder</span>
        </button>
      </div>

      {/* COMMON PRESETS SECTION */}
      <section
        aria-labelledby="common-reminders-heading"
        className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-sky-200 space-y-4 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-sky-100 pb-3">
          <div>
            <h2
              id="common-reminders-heading"
              className="font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-sky-600" />
              <span>Common Daily Reminders</span>
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              Tap any card to add and edit medicine names, walking time, or workout details.
            </p>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {COMMON_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                onClick={() => handleOpenPreset(preset)}
                id={preset.id}
                className={`group cursor-pointer text-left p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F2] border-2 ${preset.accentColor} transition duration-150 flex flex-col justify-between shadow-2xs hover:shadow-xs focus:outline-hidden focus:ring-4 focus:ring-amber-300`}
                title="Tap to customize and add"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${preset.badgeBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#78716C] bg-white px-2 py-0.5 rounded-md border border-[#E7E2D8]">
                      {preset.timeStr}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[#1C1917] group-hover:text-amber-900 leading-snug">
                    {preset.label}
                  </h3>
                  <p className="text-xs text-[#78716C] font-medium mt-0.5 line-clamp-1">
                    {preset.sublabel}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E7E2D8]/80 flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-amber-800 group-hover:underline flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit & Add</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAddPresetDirect(e, preset)}
                    title="1-tap quick add"
                    className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-800 border border-[#D6D0C4] text-xs font-bold transition active:scale-90"
                  >
                    +1 Tap
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
        {[
          { key: "all", label: "All Day" },
          { key: "morning", label: "Morning" },
          { key: "afternoon", label: "Afternoon" },
          { key: "evening", label: "Evening" },
          { key: "night", label: "Bedtime" },
        ].map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeFilter === tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-5 py-2.5 rounded-xl font-bold text-base sm:text-lg border-2 transition whitespace-nowrap cursor-pointer ${
              activeFilter === tab.key
                ? "bg-[#292524] text-white border-[#292524] shadow-xs"
                : "bg-white text-[#57534E] border-[#E7E2D8] hover:bg-[#FAF7F2]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REMINDERS LIST */}
      <div className="space-y-4" id="reminders-list-container">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-[#E7E2D8] space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="font-bold text-2xl text-[#1C1917]">
              No reminders in this section!
            </h2>
            <p className="text-[#78716C] font-medium text-lg">
              You are completely caught up. Tap "+ Add New Reminder" or choose a common reminder above anytime.
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const isSpeaking = speakingId === reminder.id;

            return (
              <div
                key={reminder.id}
                className={`group rounded-3xl p-5 sm:p-6 border-3 transition duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  reminder.completed
                    ? "bg-[#F5F5F4] border-[#E7E5E4] opacity-80"
                    : "bg-white border-[#E7E2D8] hover:border-amber-400 shadow-xs"
                }`}
              >
                {/* Left: Giant Checkbox and Content */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                  <button
                    onClick={() => {
                      onToggleReminder(reminder.id);
                      if (!reminder.completed) {
                        speech.playChime("success");
                      }
                    }}
                    aria-label={`Mark ${reminder.title} as ${
                      reminder.completed ? "uncompleted" : "done"
                    }`}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border-3 transition active:scale-90 focus:outline-hidden focus:ring-4 focus:ring-amber-400 cursor-pointer ${
                      reminder.completed
                        ? "bg-emerald-600 border-emerald-700 text-white shadow-xs"
                        : "bg-white hover:bg-emerald-50 border-[#D6D0C4] hover:border-emerald-500 text-transparent"
                    }`}
                  >
                    <Check className="w-9 h-9 sm:w-10 sm:h-10 stroke-[3]" />
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-sm sm:text-base text-[#B45309] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>{reminder.timeStr}</span>
                      </span>

                      {reminder.isMedicine && (
                        <span className="flex items-center gap-1 font-bold text-sm text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">
                          <Pill className="w-3.5 h-3.5 text-rose-600" />
                          <span>Medication</span>
                        </span>
                      )}

                      {reminder.completed && (
                        <span className="font-bold text-sm text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                          Done! Great job ✓
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p
                      className={`font-bold leading-snug break-words ${
                        reminder.completed
                          ? "line-through text-[#A8A29E]"
                          : "text-[#1C1917]"
                      } ${isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}
                    >
                      {reminder.title}
                    </p>

                    {/* Prominent Medicine Name / Details if provided */}
                    {reminder.medicineName && (
                      <div className="flex items-start gap-2 bg-[#FFF1F2] border border-rose-200 rounded-xl px-3 py-1.5 w-fit max-w-full">
                        <Pill className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="text-sm sm:text-base font-bold text-rose-950 break-words">
                          <span className="text-rose-700 font-extrabold mr-1.5 uppercase text-xs tracking-wider">
                            Medicine:
                          </span>
                          <span>{reminder.medicineName}</span>
                        </div>
                      </div>
                    )}

                    {/* Notes / Instructions if provided */}
                    {reminder.notes && (
                      <p className="text-sm sm:text-base text-[#57534E] font-medium leading-relaxed italic">
                        "{reminder.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions (Edit, Listen, Delete) */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => handleOpenEdit(reminder)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-base transition border-2 bg-white hover:bg-amber-50 text-[#78350F] border-amber-300 hover:border-amber-500 shadow-2xs cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-amber-300"
                    title="Edit title, medicine name, or time"
                  >
                    <Pencil className="w-4 h-4 text-amber-700" />
                    <span>Edit</span>
                  </button>

                  {/* LISTEN BUTTON */}
                  <button
                    onClick={() => handleSpeak(reminder)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-base transition border-2 cursor-pointer ${
                      isSpeaking
                        ? "bg-amber-600 text-white border-amber-700 animate-pulse"
                        : "bg-[#FAF7F2] hover:bg-amber-100 text-[#78350F] border-[#E7E2D8]"
                    }`}
                    title="Read reminder aloud"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-5 h-5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 text-amber-700" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>

                  {/* DELETE BUTTON with safe confirmation */}
                  {confirmDeleteId === reminder.id ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 p-1.5 rounded-xl animate-in fade-in">
                      <span className="text-xs font-bold text-rose-900 px-1">
                        Remove?
                      </span>
                      <button
                        onClick={() => {
                          onDeleteReminder(reminder.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(reminder.id)}
                      className="p-2.5 rounded-xl text-[#A8A29E] hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove this reminder"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDIT & ADD REMINDER MODAL (SENIOR-ACCESSIBLE & HIGH-CONTRAST) */}
      {isEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-editor-heading"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border-4 border-amber-500 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#F0EBE1] pb-4">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  {editingReminderId ? "Edit Reminder & Medicine" : "Add New Reminder"}
                </span>
                <h2
                  id="reminder-editor-heading"
                  className="font-serif font-bold text-2xl sm:text-3xl text-[#1C1917] mt-1.5"
                >
                  {editingReminderId ? "Change Reminder Details" : "Set Up Your Reminder"}
                </h2>
                <p className="text-[#78716C] font-medium text-sm sm:text-base mt-0.5">
                  Easily customize title, medicine names, instructions, and time.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition border border-[#E7E2D8] cursor-pointer"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEditor} className="space-y-5">
              {/* Field 1: Reminder Title */}
              <div>
                <label
                  htmlFor="editor-title-input"
                  className="block font-bold text-[#1C1917] text-lg mb-1.5"
                >
                  What is this reminder for? *
                </label>
                <input
                  type="text"
                  id="editor-title-input"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="e.g. Morning Medicine, Go for a walk, Lunch & Vitamins..."
                  className={`w-full p-4 rounded-2xl border-2 border-[#D6D0C4] focus:border-[#D97706] focus:ring-4 focus:ring-amber-300 font-semibold text-[#1C1917] placeholder:text-[#A8A29E] outline-hidden ${
                    isLargeText ? "text-xl" : "text-lg"
                  }`}
                  required
                />
              </div>

              {/* Field 2: Specific Medicine Name & Dosage (highlighted for medication) */}
              <div className="bg-[#FFFBEB] border-2 border-amber-300 p-4 sm:p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="editor-medicine-input"
                    className="flex items-center gap-2 font-bold text-[#92400E] text-base sm:text-lg"
                  >
                    <Pill className="w-5 h-5 text-[#D97706]" />
                    <span>Medicine Name & Dose (optional):</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setEditorIsMedicine(!editorIsMedicine)}
                    className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border transition ${
                      editorIsMedicine
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    {editorIsMedicine ? "Medication: YES ✓" : "Medication: NO"}
                  </button>
                </div>

                <input
                  type="text"
                  id="editor-medicine-input"
                  value={editorMedicineName}
                  onChange={(e) => {
                    setEditorMedicineName(e.target.value);
                    if (e.target.value.trim().length > 0) {
                      setEditorIsMedicine(true);
                    }
                  }}
                  placeholder="e.g. Lisinopril 10mg, Metformin 500mg, Baby Aspirin 81mg..."
                  className={`w-full p-3.5 rounded-xl border-2 border-amber-200 bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-200 font-semibold text-[#1C1917] placeholder:text-[#A8A29E] outline-hidden ${
                    isLargeText ? "text-lg" : "text-base"
                  }`}
                />
                <p className="text-xs sm:text-sm text-[#78716C] font-medium">
                  Tip: Write the exact name or color of the pill bottle so you never feel confused.
                </p>
              </div>

              {/* Field 3: Time of Day Selector */}
              <div>
                <label className="block font-bold text-[#1C1917] text-lg mb-2">
                  When should this happen?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: "morning", label: "Morning", time: "8:00 AM", icon: Sun },
                    { key: "afternoon", label: "Afternoon", time: "1:00 PM", icon: Sun },
                    { key: "evening", label: "Evening", time: "6:30 PM", icon: Sunset },
                    { key: "night", label: "Bedtime", time: "9:00 PM", icon: Moon },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = editorTimeOfDay === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => {
                          setEditorTimeOfDay(t.key as TimeOfDay);
                          setEditorTimeStr(t.time);
                        }}
                        className={`p-3 rounded-xl border-2 font-bold text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "bg-amber-100 border-[#D97706] text-[#78350F] shadow-xs"
                            : "bg-[#FAF7F2] border-[#E7E2D8] text-[#57534E] hover:bg-[#F5F0E6]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base">{t.label}</span>
                          <Icon className="w-4 h-4 text-amber-700" />
                        </div>
                        <span className="text-xs font-semibold mt-1 text-[#78716C]">
                          {t.time}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Time Text Input */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-xs font-bold text-[#78716C] whitespace-nowrap">
                    Or custom time:
                  </span>
                  <input
                    type="text"
                    value={editorTimeStr}
                    onChange={(e) => setEditorTimeStr(e.target.value)}
                    placeholder="e.g. 9:30 AM or 4:15 PM"
                    className="px-3 py-1.5 rounded-lg border border-[#D6D0C4] bg-[#FAF7F2] text-sm font-bold text-[#1C1917] max-w-[160px]"
                  />
                </div>
              </div>

              {/* Field 4: Optional Notes / Instructions */}
              <div>
                <label
                  htmlFor="editor-notes-input"
                  className="block font-bold text-[#1C1917] text-base mb-1"
                >
                  Extra Notes or Directions (optional):
                </label>
                <input
                  type="text"
                  id="editor-notes-input"
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  placeholder="e.g. Take with breakfast, Drink full glass of water, Wear walking shoes..."
                  className="w-full p-3.5 rounded-xl border-2 border-[#D6D0C4] focus:border-[#D97706] font-medium text-[#1C1917] placeholder:text-[#A8A29E] outline-hidden text-base"
                />
              </div>

              {/* Actions: Big Save and Cancel */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#F0EBE1]">
                <button
                  type="submit"
                  disabled={!editorTitle.trim()}
                  id="save-reminder-modal-button"
                  className="w-full sm:flex-1 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-[#E7E2D8] text-white disabled:text-[#A8A29E] font-bold text-xl shadow-md transition active:scale-95 cursor-pointer disabled:cursor-not-allowed text-center"
                >
                  {editingReminderId ? "Save Changes ✓" : "Save This Reminder ✓"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#EFEAE1] text-[#57534E] font-bold text-lg border-2 border-[#D6D0C4] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gentle Reassurance Note */}
      <div className="bg-[#FAF7F2] border-2 border-[#E7E2D8] rounded-2xl p-4 text-center">
        <p className="text-[#78716C] font-semibold text-base sm:text-lg">
          Tip: Tap the big square next to any reminder when you finish it! You can tap "Edit" anytime to update your medicine names.
        </p>
      </div>
    </div>
  );
};
