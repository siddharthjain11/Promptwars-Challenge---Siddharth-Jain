import React, { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ClipboardPaste,
} from "lucide-react";
import { speech } from "../utils/speech";

interface SimplifyScreenProps {
  onBackToHome: () => void;
  isLargeText: boolean;
}

const SAMPLE_TEXTS = [
  {
    title: "Doctor's Visit Notice",
    text: "Notice from Memorial Cardiology: Your upcoming routine follow-up with Dr. Emily Henderson is scheduled for Tuesday, October 14 at 10:30 AM in Suite 300. Please arrive 15 minutes prior. Fasting is not required for this consultation. Co-pay of $20 is due at check-in. If you need to reschedule, call (555) 0188 at least 24 hours in advance.",
  },
  {
    title: "Electric Utility Bill",
    text: "City Power & Light Statement: Your current account balance is $64.20, due on October 5. This is an informational billing statement. Because you are enrolled in Automatic Bank Draft (Auto-Pay), no manual payment is needed. The amount of $64.20 will be debited from your checking account automatically on October 5. Thank you for your continued service.",
  },
  {
    title: "Pill Bottle Directions",
    text: "Metformin Hydrochloride 500mg Tablets. Take one tablet orally twice daily with meals (breakfast and dinner). Do not crush or chew. Drink with a full glass of water. Store at controlled room temperature away from moisture. Refills remaining: 3. Pharmacy Tel: (555) 0142.",
  },
];

export const SimplifyScreen: React.FC<SimplifyScreenProps> = ({
  onBackToHome,
  isLargeText,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [simplifiedResult, setSimplifiedResult] = useState<{
    summary: string;
    actionRequired: string;
    keyDetails: string;
  } | null>(null);

  const handleSimplify = async (textToProcess?: string) => {
    const text = (textToProcess || inputText).trim();
    if (!text || isLoading) return;

    speech.stop();
    setIsSpeaking(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/companion/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setSimplifiedResult({
        summary: data.summary || "Here is a simple summary of what you read.",
        actionRequired: data.actionRequired || "No action required.",
        keyDetails: data.keyDetails || "No specific dates or amounts found.",
      });

      // Automatically read aloud the summary for convenience
      const spokenText = `Here is what this document means: ${data.summary}. Action to take: ${data.actionRequired}. Important details: ${data.keyDetails}`;
      speech.speak(spokenText, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.warn("Simplify notice:", err);
      setSimplifiedResult({
        summary:
          "We could not connect to simplify this text right now, but you can rest easy.",
        actionRequired: "Please ask a trusted family member to take a look.",
        keyDetails: "Take your time.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeakResult = () => {
    if (!simplifiedResult) return;

    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
    } else {
      const fullText = `What this is about: ${simplifiedResult.summary}. Do you need to do anything? ${simplifiedResult.actionRequired}. Key details: ${simplifiedResult.keyDetails}`;
      speech.speak(fullText, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText(text);
          handleSimplify(text);
        }
      }
    } catch {
      // Clipboard read may be blocked in some browser contexts
    }
  };

  const handleUseSample = (sample: { title: string; text: string }) => {
    setInputText(sample.text);
    handleSimplify(sample.text);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Bar with Go to Home */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border-2 border-[#E7E2D8] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="simplify-back-to-home"
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
              Read This for Me
            </h1>
            <p className="text-[#78716C] font-medium text-sm sm:text-base">
              Turn confusing letters and bills into plain English
            </p>
          </div>
        </div>

        {inputText && (
          <button
            onClick={() => {
              setInputText("");
              setSimplifiedResult(null);
              speech.stop();
              setIsSpeaking(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2] border border-[#E7E2D8] text-base font-bold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Fresh</span>
          </button>
        )}
      </div>

      {/* SAMPLE BUTTONS (Helpful instant tryout) */}
      <div className="bg-[#FAF7F2] p-5 rounded-3xl border-2 border-[#E7E2D8] space-y-3">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#78716C] block">
          Try a sample confusing document:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_TEXTS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleUseSample(s)}
              className="text-left p-4 rounded-2xl bg-white hover:bg-emerald-50 active:bg-emerald-100 border-2 border-[#E7E2D8] hover:border-emerald-500 font-bold text-base sm:text-lg text-[#1C1917] hover:text-emerald-900 transition shadow-2xs focus:outline-hidden focus:ring-4 focus:ring-emerald-300"
            >
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <FileText className="w-5 h-5" />
                <span className="text-xs uppercase font-extrabold tracking-wider">
                  Sample {idx + 1}
                </span>
              </div>
              <span className="block">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E7E2D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="simplify-textarea"
            className="block font-bold text-[#1C1917] text-lg sm:text-xl"
          >
            Paste or type your letter, message, or bill below:
          </label>
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#92400E] border border-amber-300 text-sm font-bold transition"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste Text</span>
          </button>
        </div>

        <textarea
          id="simplify-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type any confusing sentence, doctor's note, or utility bill here..."
          rows={4}
          className={`w-full p-4 rounded-2xl border-2 border-[#D6D0C4] focus:border-emerald-600 focus:ring-4 focus:ring-emerald-300 font-medium text-[#1C1917] placeholder:text-[#A8A29E] resize-none outline-hidden ${
            isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          }`}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <p className="text-sm text-[#78716C] font-medium">
            We will never store your personal text. Everything stays safe.
          </p>

          <button
            onClick={() => handleSimplify()}
            disabled={!inputText.trim() || isLoading}
            id="explain-plain-words-button"
            className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-[#E7E2D8] text-white disabled:text-[#A8A29E] font-bold text-lg sm:text-xl shadow-md transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <Sparkles className="w-6 h-6" />
            <span>
              {isLoading ? "Reading and simplifying..." : "Explain in Simple Words"}
            </span>
          </button>
        </div>
      </div>

      {/* SIMPLIFIED RESULTS DISPLAY */}
      {simplifiedResult && (
        <div
          id="simplified-result-container"
          className="bg-[#F0FDF4] border-3 border-emerald-500 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in"
        >
          {/* Header & Speak Out Loud Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-5">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-sm uppercase tracking-wider">
                Simplified in Plain English
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950 mt-1.5">
                Here is what this means:
              </h2>
            </div>

            <button
              onClick={handleToggleSpeakResult}
              id="listen-simplified-result-button"
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-lg sm:text-xl transition shadow-sm ${
                isSpeaking
                  ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-6 h-6" />
                  <span>Stop Reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-6 h-6" />
                  <span>Read Out Loud</span>
                </>
              )}
            </button>
          </div>

          {/* 3 Clear Sections for the Senior */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Section 1: In Plain Words */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>1. What this is about</span>
              </div>
              <p
                className={`text-[#1C1917] font-semibold leading-relaxed ${
                  isLargeText ? "text-xl" : "text-lg"
                }`}
              >
                {simplifiedResult.summary}
              </p>
            </div>

            {/* Section 2: Action Required */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>2. Do you need to do anything?</span>
              </div>
              <p
                className={`text-[#1C1917] font-semibold leading-relaxed ${
                  isLargeText ? "text-xl" : "text-lg"
                }`}
              >
                {simplifiedResult.actionRequired}
              </p>
            </div>

            {/* Section 3: Important Details */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
                <AlertCircle className="w-5 h-5 text-emerald-600" />
                <span>3. Important numbers & dates</span>
              </div>
              <p
                className={`text-[#1C1917] font-semibold leading-relaxed ${
                  isLargeText ? "text-xl" : "text-lg"
                }`}
              >
                {simplifiedResult.keyDetails}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gentle Reassurance Note */}
      <div className="bg-[#FAF7F2] border-2 border-[#E7E2D8] rounded-2xl p-4 text-center">
        <p className="text-[#78716C] font-semibold text-base sm:text-lg">
          Remember: If you ever feel unsure, you can show the letter to a family member or tap "Go to Home" to call them.
        </p>
      </div>
    </div>
  );
};
