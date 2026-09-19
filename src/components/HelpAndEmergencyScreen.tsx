import React, { useState } from "react";
import { FamilyContact, PrebuiltGuide, TaskStep } from "../types";
import { PREBUILT_GUIDES, INITIAL_CONTACTS } from "../data/guides";
import {
  ArrowLeft,
  PhoneCall,
  ShieldAlert,
  HelpCircle,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Phone,
  UserPlus,
  HeartHandshake,
} from "lucide-react";
import { speech } from "../utils/speech";

interface HelpAndEmergencyScreenProps {
  onBackToHome: () => void;
  isLargeText: boolean;
}

export const HelpAndEmergencyScreen: React.FC<HelpAndEmergencyScreenProps> = ({
  onBackToHome,
  isLargeText,
}) => {
  const [contacts, setContacts] = useState<FamilyContact[]>(() => {
    const saved = localStorage.getItem("senior_companion_contacts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CONTACTS;
      }
    }
    return INITIAL_CONTACTS;
  });

  const [activeGuide, setActiveGuide] = useState<PrebuiltGuide | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [customTaskQuery, setCustomTaskQuery] = useState<string>("");
  const [isLoadingCustomGuide, setIsLoadingCustomGuide] = useState<boolean>(false);
  const [isSpeakingStep, setIsSpeakingStep] = useState<boolean>(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState<boolean>(false);
  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [editingContactData, setEditingContactData] = useState<{
    name: string;
    phone: string;
    relation: string;
  }>({ name: "", phone: "", relation: "" });

  const saveContacts = (updated: FamilyContact[]) => {
    setContacts(updated);
    localStorage.setItem("senior_companion_contacts", JSON.stringify(updated));
  };

  const handleSelectGuide = (guide: PrebuiltGuide) => {
    speech.stop();
    setIsSpeakingStep(false);
    setActiveGuide(guide);
    setCurrentStepIndex(0);
  };

  const handleReadStep = (step: TaskStep, index: number, total: number) => {
    speech.stop();
    if (isSpeakingStep) {
      setIsSpeakingStep(false);
      return;
    }

    const text = `Step ${index + 1} of ${total}. ${step.title}. ${step.instruction}`;
    speech.speak(text, {
      onStart: () => setIsSpeakingStep(true),
      onEnd: () => setIsSpeakingStep(false),
      onError: () => setIsSpeakingStep(false),
    });
  };

  const handleNextStep = () => {
    if (!activeGuide) return;
    speech.stop();
    setIsSpeakingStep(false);
    if (currentStepIndex < activeGuide.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      speech.playChime("success");
    }
  };

  const handlePrevStep = () => {
    speech.stop();
    setIsSpeakingStep(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleAskCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = customTaskQuery.trim();
    if (!query || isLoadingCustomGuide) return;

    speech.stop();
    setIsLoadingCustomGuide(true);

    try {
      const res = await fetch("/api/companion/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: query }),
      });

      const data = await res.json();
      const steps: TaskStep[] =
        data.steps && data.steps.length > 0
          ? data.steps
          : [
              {
                title: "Take it slow",
                instruction: "Everything is safe. Ask a family member if needed.",
              },
            ];

      const newGuide: PrebuiltGuide = {
        id: "custom-" + Date.now(),
        title: query,
        summary: `Help with: ${query}`,
        category: "daily",
        steps,
      };

      setActiveGuide(newGuide);
      setCurrentStepIndex(0);
      setCustomTaskQuery("");
    } catch (err) {
      console.error("Custom guide error:", err);
    } finally {
      setIsLoadingCustomGuide(false);
    }
  };

  const handleAddCustomContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContactData.name.trim() || !editingContactData.phone.trim()) return;

    const newContact: FamilyContact = {
      id: "c-" + Date.now(),
      name: editingContactData.name.trim(),
      relation: editingContactData.relation.trim() || "Family",
      phone: editingContactData.phone.trim(),
      avatarColor: "bg-amber-600",
    };

    saveContacts([...contacts, newContact]);
    setIsEditingContact(false);
    setEditingContactData({ name: "", phone: "", relation: "" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Bar with Go to Home */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border-2 border-[#E7E2D8] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="help-back-to-home"
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
              Help & Family Contact
            </h1>
            <p className="text-[#78716C] font-medium text-sm sm:text-base">
              One-tap phone calls and simplified step-by-step guides
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: ONE-TAP CALL FAMILY & EMERGENCY */}
      <section aria-labelledby="family-emergency-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2
              id="family-emergency-heading"
              className="font-bold text-2xl text-[#1C1917]"
            >
              Call Family or Emergency
            </h2>
            <p className="text-[#78716C] font-medium text-base">
              Tap any card to dial immediately on your phone or tablet.
            </p>
          </div>

          <button
            onClick={() => setIsEditingContact(!isEditingContact)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 font-bold text-sm sm:text-base transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isEditingContact ? "Close" : "+ Add Contact"}</span>
          </button>
        </div>

        {/* Add Contact Form (if toggled) */}
        {isEditingContact && (
          <form
            onSubmit={handleAddCustomContact}
            className="bg-[#FEF3C7]/40 border-2 border-amber-300 p-5 rounded-3xl space-y-3"
          >
            <h3 className="font-bold text-lg text-amber-950">Add a New Family Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Name (e.g. Sarah, Michael)"
                value={editingContactData.name}
                onChange={(e) =>
                  setEditingContactData({ ...editingContactData, name: e.target.value })
                }
                className="p-3 rounded-xl border-2 border-amber-200 bg-white font-semibold text-[#1C1917]"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g. 555-0192)"
                value={editingContactData.phone}
                onChange={(e) =>
                  setEditingContactData({ ...editingContactData, phone: e.target.value })
                }
                className="p-3 rounded-xl border-2 border-amber-200 bg-white font-semibold text-[#1C1917]"
                required
              />
              <input
                type="text"
                placeholder="Relation (e.g. Daughter, Neighbor)"
                value={editingContactData.relation}
                onChange={(e) =>
                  setEditingContactData({
                    ...editingContactData,
                    relation: e.target.value,
                  })
                }
                className="p-3 rounded-xl border-2 border-amber-200 bg-white font-semibold text-[#1C1917]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-base transition"
            >
              Save Family Contact
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 911 EMERGENCY CARD (With safety confirmation modal to prevent panic misclicks) */}
          <div className="bg-rose-50 border-3 border-rose-300 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Immediate Emergency
                </span>
                <h3 className="font-bold text-xl sm:text-2xl text-rose-950">
                  Call 911 Services
                </h3>
                <p className="text-rose-800 text-sm sm:text-base font-medium mt-0.5">
                  Police, Fire, Ambulance assistance
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200">
              <button
                onClick={() => setShowEmergencyConfirm(true)}
                id="call-911-button"
                className="w-full py-3.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-lg sm:text-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                <span>Call 911 Now</span>
              </button>
            </div>
          </div>

          {/* FAMILY CONTACTS LIST */}
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border-3 border-[#E7E2D8] hover:border-amber-400 rounded-3xl p-5 flex flex-col justify-between shadow-xs transition"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl ${contact.avatarColor} text-white flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <PhoneCall className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
                    {contact.relation}
                  </span>
                  <h3
                    className={`font-bold text-[#1C1917] ${
                      isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                    }`}
                  >
                    {contact.name}
                  </h3>
                  <p className="text-[#57534E] text-base font-bold mt-0.5">
                    {contact.phone}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0EBE1]">
                <a
                  href={`tel:${contact.phone}`}
                  className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg sm:text-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-2 text-center"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call {contact.name.split(" ")[0]}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIRMATION MODAL FOR 911 (Precaution against accidental taps) */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-rose-600 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-rose-950">
                Are you sure you want to call 911?
              </h3>
              <p className="text-[#57534E] font-medium text-lg mt-2">
                This will connect your device directly to emergency services.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="tel:911"
                onClick={() => setShowEmergencyConfirm(false)}
                className="block w-full py-4 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xl shadow-md"
              >
                Yes, Call 911 Now
              </a>

              <button
                type="button"
                onClick={() => setShowEmergencyConfirm(false)}
                className="w-full py-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#EFEAE1] text-[#292524] font-bold text-lg border border-[#D6D0C4]"
              >
                Cancel (I did not mean to tap)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SIMPLIFIED STEP-BY-STEP TASK GUIDES */}
      <section aria-labelledby="task-guides-heading" className="space-y-5 pt-4">
        <div>
          <h2 id="task-guides-heading" className="font-bold text-2xl text-[#1C1917]">
            Step-by-Step Task Guides
          </h2>
          <p className="text-[#78716C] font-medium text-base">
            Simple, gentle instructions for everyday tasks on your phone or computer.
          </p>
        </div>

        {/* ACTIVE STEP-BY-STEP VIEWER */}
        {activeGuide ? (
          <div
            id="active-task-guide-viewer"
            className="bg-white border-3 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-md space-y-6"
          >
            {/* Guide Header */}
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-4">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  Step-by-Step Guide
                </span>
                <h3
                  className={`font-serif font-bold text-[#1C1917] mt-1.5 ${
                    isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                  }`}
                >
                  {activeGuide.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  speech.stop();
                  setIsSpeakingStep(false);
                  setActiveGuide(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFEAE1] text-[#78716C] hover:text-[#1C1917] font-bold text-base border border-[#D6D0C4]"
              >
                Close Guide
              </button>
            </div>

            {/* Current Step Display */}
            {activeGuide.steps[currentStepIndex] && (
              <div className="bg-[#FAF7F2] border-2 border-[#E7E2D8] rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-amber-900 text-lg sm:text-xl">
                    Step {currentStepIndex + 1} of {activeGuide.steps.length}
                  </span>

                  {/* Read Step Out Loud Button */}
                  <button
                    onClick={() =>
                      handleReadStep(
                        activeGuide.steps[currentStepIndex],
                        currentStepIndex,
                        activeGuide.steps.length
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base transition border-2 ${
                      isSpeakingStep
                        ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                        : "bg-white hover:bg-amber-100 text-amber-900 border-amber-300"
                    }`}
                  >
                    {isSpeakingStep ? (
                      <>
                        <VolumeX className="w-5 h-5" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 text-amber-700" />
                        <span>Read Step Aloud</span>
                      </>
                    )}
                  </button>
                </div>

                <h4
                  className={`font-bold text-[#1C1917] ${
                    isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                  }`}
                >
                  {activeGuide.steps[currentStepIndex].title}
                </h4>

                <p
                  className={`text-[#292524] font-medium leading-relaxed ${
                    isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                  }`}
                >
                  {activeGuide.steps[currentStepIndex].instruction}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#EFEAE1] disabled:opacity-40 text-[#1C1917] font-bold text-lg border-2 border-[#D6D0C4] transition disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
                <span>Previous Step</span>
              </button>

              {currentStepIndex < activeGuide.steps.length - 1 ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-lg sm:text-xl shadow-md transition active:scale-95"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    speech.playChime("success");
                    speech.speak("Wonderful job! You finished the task. You are all done.");
                    setActiveGuide(null);
                  }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg sm:text-xl shadow-md transition active:scale-95"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>I Finished! All Done ✓</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* PREBUILT GUIDES LIST */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PREBUILT_GUIDES.map((guide) => (
              <button
                key={guide.id}
                onClick={() => handleSelectGuide(guide)}
                className="text-left bg-white hover:bg-amber-50/60 active:bg-amber-100 border-2 border-[#E7E2D8] hover:border-amber-400 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition flex flex-col justify-between focus:outline-hidden focus:ring-4 focus:ring-amber-300"
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {guide.steps.length} Easy Steps
                    </span>
                  </div>
                  <h3
                    className={`font-bold text-[#1C1917] ${
                      isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                    }`}
                  >
                    {guide.title}
                  </h3>
                  <p className="text-[#78716C] font-medium text-sm sm:text-base mt-1.5 leading-relaxed">
                    {guide.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex items-center text-amber-800 font-bold text-base sm:text-lg">
                  <span>Start Step 1 →</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* CUSTOM AI TASK ASSISTANCE */}
        <form
          onSubmit={handleAskCustomTask}
          className="bg-white border-2 border-[#E7E2D8] rounded-3xl p-6 sm:p-7 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2 text-amber-800 font-bold text-lg">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Need simple steps for a different task?</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customTaskQuery}
              onChange={(e) => setCustomTaskQuery(e.target.value)}
              placeholder="e.g. How do I silence my phone, or take a picture of my medicine?"
              className={`flex-1 p-4 rounded-2xl border-2 border-[#D6D0C4] focus:border-amber-500 focus:ring-4 focus:ring-amber-300 font-semibold text-[#1C1917] placeholder:text-[#A8A29E] outline-hidden ${
                isLargeText ? "text-xl" : "text-lg"
              }`}
            />
            <button
              type="submit"
              disabled={!customTaskQuery.trim() || isLoadingCustomGuide}
              className="px-6 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:bg-[#E7E2D8] text-white disabled:text-[#A8A29E] font-bold text-lg shadow-sm transition active:scale-95 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoadingCustomGuide ? "Creating easy steps..." : "Show Me Steps"}
            </button>
          </div>
        </form>
      </section>

      {/* Gentle Reassurance Note */}
      <div className="bg-[#FAF7F2] border-2 border-[#E7E2D8] rounded-2xl p-5 text-center flex items-center justify-center gap-2">
        <HeartHandshake className="w-6 h-6 text-amber-700 shrink-0" />
        <p className="text-[#78716C] font-semibold text-base sm:text-lg">
          You are never alone. You can call your family or explore step-by-step at your own gentle speed.
        </p>
      </div>
    </div>
  );
};
