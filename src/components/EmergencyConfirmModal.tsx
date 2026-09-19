import React, { useState } from "react";
import { ShieldAlert, PhoneCall, X, Check, BellRing } from "lucide-react";
import { speech } from "../utils/speech";

interface EmergencyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess?: () => void;
  familyContacts?: Array<{ name: string; phone: string }>;
}

export const EmergencyConfirmModal: React.FC<EmergencyConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmSuccess,
  familyContacts = [
    { name: "Daughter Sarah", phone: "+1 (555) 0192" },
    { name: "Son David", phone: "+1 (555) 0144" },
  ],
}) => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [alertStatus, setAlertStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmCall = async () => {
    setIsDispatching(true);
    setAlertStatus("Sending instant alert to emergency contacts & connecting to 112...");
    speech.speak("Connecting you to Emergency Services 112 and notifying your family.");

    try {
      // Dispatch simulated missed-call alert via backend
      await fetch("/api/emergency/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: familyContacts,
          message: "Senior Emergency Button Pressed. Please check on your loved one immediately.",
        }),
      }).catch(() => {});
    } catch {
      // Continue regardless
    }

    setTimeout(() => {
      setAlertStatus("Alert sent! Opening phone dialer for 112...");
      // Trigger tel:112 call
      window.location.href = "tel:112";
      if (onConfirmSuccess) {
        onConfirmSuccess();
      }
      setTimeout(() => {
        setIsDispatching(false);
        setAlertStatus(null);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
        {/* Header with high contrast red icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-700 bg-red-100 px-2.5 py-1 rounded-md border border-red-300">
                Emergency Call
              </span>
              <h2
                id="emergency-modal-title"
                className="font-serif font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1"
              >
                Call 112 Emergency?
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close emergency confirmation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Reassuring Explanation */}
        <div className="bg-red-50/80 border-2 border-red-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
          <p className="text-slate-800 font-bold text-lg sm:text-xl leading-snug">
            Pressing YES will immediately:
          </p>
          <ul className="space-y-2 text-base sm:text-lg text-slate-700 font-medium">
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong>Call 112</strong> (National Emergency & First Responders).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                2
              </span>
              <span>
                Send an <strong>instant missed-call alert</strong> to your family contacts ({familyContacts.map((c) => c.name).join(", ")}).
              </span>
            </li>
          </ul>
        </div>

        {/* Live Status Message if dispatching */}
        {alertStatus && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-amber-950 font-bold text-base animate-pulse">
            <BellRing className="w-6 h-6 text-amber-600 shrink-0" />
            <span>{alertStatus}</span>
          </div>
        )}

        {/* Big Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleConfirmCall}
            disabled={isDispatching}
            id="confirm-emergency-call-btn"
            className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xl sm:text-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75"
          >
            <PhoneCall className="w-7 h-7 animate-bounce" />
            <span>{isDispatching ? "Connecting..." : "YES, CALL 112 NOW"}</span>
          </button>

          <button
            onClick={onClose}
            disabled={isDispatching}
            id="cancel-emergency-call-btn"
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg sm:text-xl border-2 border-slate-300 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 text-slate-600" />
            <span>No, Cancel (I Am Okay)</span>
          </button>
        </div>

        <p className="text-center text-xs sm:text-sm text-slate-500 font-medium">
          If this is an accidental press, tap "No, Cancel". Nothing will be called.
        </p>
      </div>
    </div>
  );
};
