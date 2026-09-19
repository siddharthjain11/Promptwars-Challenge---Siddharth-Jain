import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  X,
  HelpCircle,
  FileText,
} from "lucide-react";
import { ScamAnalysisResult } from "../types";
import { speech } from "../utils/speech";
import { sanitizeInput } from "../utils/sanitize";

interface ScamCheckerScreenProps {
  onBackToHome: () => void;
  isLargeText: boolean;
  isAudioDescEnabled?: boolean;
}

const SAMPLE_MESSAGES = [
  {
    title: "Bank Suspension SMS",
    snippet: "Chase Alert: Your card is locked due to suspicious activity. Tap bit.ly/chase-lock9 to unlock now.",
    text: "Chase Security Alert: Your debit card has been suspended due to unauthorized login attempts. Click here immediately to restore access: http://bit.ly/chase-auth-92938 or your account will be closed.",
  },
  {
    title: "Fake Grandchild WhatsApp",
    snippet: "Hi Grandma, I dropped my phone, need money urgently...",
    text: "Hi Grandma! This is my new temporary phone number because I lost my phone and wallet at the airport. Can you please send $250 through wire transfer right away? Please don't tell mom yet, I will explain tonight!",
  },
  {
    title: "Fake Lottery / Prize",
    snippet: "You won $500,000! Send $50 processing fee...",
    text: "CONGRATULATIONS!! You have been selected as the 1st prize winner of the $500,000 Global Sweepstakes! To claim your cash prize, send a $50 administrative fee via Apple Gift Card or Bitcoin today.",
  },
  {
    title: "Real Doctor's Reminder",
    snippet: "Dr. Miller: Routine checkup tomorrow at 10:00 AM...",
    text: "Gentle reminder from City Health Clinic: Your annual wellness appointment with Dr. Miller is scheduled for tomorrow at 10:00 AM. Please arrive 10 minutes early. Reply YES to confirm or call 555-0100 to reschedule.",
  },
];

export const ScamCheckerScreen: React.FC<ScamCheckerScreenProps> = ({
  onBackToHome,
  isLargeText,
  isAudioDescEnabled = false,
}) => {
  const [inputText, setInputText] = useState("");
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ScamAnalysisResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync speaking state with global speech
  useEffect(() => {
    const unsub = speech.subscribe((speaking) => {
      if (!speaking) {
        setIsSpeaking(false);
      }
    });
    return () => unsub();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a picture or screenshot (JPG, PNG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotData(reader.result as string);
      setScreenshotName(file.name);
      if (isAudioDescEnabled) {
        speech.speak("Screenshot added. Tap Check for Scam to analyze it.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotData(null);
    setScreenshotName(null);
  };

  const handleCheckScam = async (textToCheck = inputText, imgToCheck = screenshotData) => {
    const cleanText = sanitizeInput(textToCheck, { maxLength: 5000 });
    if (!cleanText && !imgToCheck) return;

    setIsLoading(true);
    setAnalysis(null);
    if (isAudioDescEnabled) {
      speech.speak("Checking this message for fraud signals. Please hold on a moment.");
    }

    try {
      const res = await fetch("/api/scam-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          image: imgToCheck,
        }),
      });

      if (!res.ok) throw new Error("Check failed");

      const data: ScamAnalysisResult = await res.json();
      setAnalysis(data);

      const speakSummary = `${data.verdictTitle}. ${data.plainExplanation}`;
      speech.speakDescription(speakSummary, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      // Fallback
      const fallbackData: ScamAnalysisResult = {
        riskLevel: "warning",
        verdictTitle: "⚠️ Be Very Careful",
        plainExplanation:
          "Always be cautious with unexpected messages asking for money or link clicks. Never give your passwords or bank codes.",
        redFlags: [
          "Unexpected message asking for quick action",
          "Contains an unverified link or phone number",
        ],
        recommendedActions: [
          "Do not click any link or send money",
          "Show this to a family member or call your bank directly",
        ],
        safeToClick: false,
      };
      setAnalysis(fallbackData);
      speech.speakDescription(fallbackData.plainExplanation, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAudio = () => {
    if (isSpeaking || speech.isSpeaking()) {
      speech.stop();
      setIsSpeaking(false);
    } else if (analysis) {
      const fullText = `${analysis.verdictTitle}. ${analysis.plainExplanation}. What you should do: ${analysis.recommendedActions.join(". ")}`;
      speech.speak(fullText, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Bar with Go to Home */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="scam-back-to-home"
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm sm:text-base transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span>Go to Home</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="Shield">
                🛡️
              </span>
              <h1
                className={`font-serif font-bold text-slate-900 ${
                  isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                Scam & Fraud Message Checker
              </h1>
            </div>
            <p className="text-slate-500 font-normal text-xs sm:text-sm">
              Paste suspicious SMS, emails, WhatsApp forwards, or upload a photo
            </p>
          </div>
        </div>

        {(inputText || screenshotData || analysis) && (
          <button
            onClick={() => {
              setInputText("");
              setScreenshotData(null);
              setScreenshotName(null);
              setAnalysis(null);
              speech.stop();
              setIsSpeaking(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Fresh</span>
          </button>
        )}
      </div>

      {/* SAMPLE TEST BUTTONS */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Try a sample message to see how it works:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_MESSAGES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample.text);
                setScreenshotData(null);
                handleCheckScam(sample.text, null);
              }}
              className="text-left p-3 rounded-2xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 hover:border-sky-300 transition shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs sm:text-sm mb-1 group-hover:text-sky-900">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>{sample.title}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                "{sample.snippet}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* INPUT SECTION: Text + Image Upload */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div>
          <label
            htmlFor="scam-text-input"
            className="block font-bold text-slate-900 text-base sm:text-lg mb-2"
          >
            1. Paste or Type the Suspicious Text Message:
          </label>
          <textarea
            id="scam-text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 'Your debit card is suspended, tap here to unlock' or copy and paste an email / WhatsApp forward..."
            rows={3}
            className={`w-full p-3.5 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-3 focus:ring-sky-100 font-normal text-slate-900 placeholder:text-slate-400 resize-none outline-hidden ${
              isLargeText ? "text-lg" : "text-base"
            }`}
          />
        </div>

        {/* Screenshot Upload Option */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block font-bold text-slate-900 text-sm sm:text-base mb-2">
            2. OR Upload a Screenshot / Photo of the Message:
          </label>

          {screenshotData ? (
            <div className="relative inline-block border border-sky-200 rounded-2xl p-2 bg-sky-50/50">
              <img
                src={screenshotData}
                alt="Uploaded message screenshot"
                className="max-h-48 rounded-xl object-contain"
              />
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
                  {screenshotName || "Screenshot attached"}
                </span>
                <button
                  onClick={handleRemoveScreenshot}
                  className="flex items-center gap-1 text-xs text-rose-700 font-semibold hover:underline cursor-pointer ml-3"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <label className="border border-dashed border-slate-300 hover:border-sky-400 bg-slate-50/70 hover:bg-sky-50/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-center gap-3 cursor-pointer transition text-center sm:text-left">
              <Upload className="w-6 h-6 text-sky-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 text-sm sm:text-base block">
                  Tap to Choose Screenshot or Photo
                </span>
                <span className="text-xs text-slate-400">
                  Takes photos from camera or photo library (JPG, PNG)
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={() => handleCheckScam()}
          disabled={(!inputText.trim() && !screenshotData) || isLoading}
          id="check-scam-btn"
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-lg sm:text-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isLoading ? "Analyzing Message..." : "Check This for Scam"}</span>
        </button>
      </div>

      {/* RESULTS DISPLAY */}
      {analysis && (
        <div
          role="region"
          aria-label="Scam Analysis Result"
          className="bg-white p-6 sm:p-8 rounded-3xl border-3 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{
            borderColor:
              analysis.riskLevel === "high"
                ? "#ef4444"
                : analysis.riskLevel === "warning"
                ? "#f59e0b"
                : "#10b981",
          }}
        >
          {/* Main Verdict Banner */}
          <div
            className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              analysis.riskLevel === "high"
                ? "bg-red-50 border-red-300 text-red-950"
                : analysis.riskLevel === "warning"
                ? "bg-amber-50 border-amber-300 text-amber-950"
                : "bg-emerald-50 border-emerald-300 text-emerald-950"
            }`}
          >
            <div className="flex items-center gap-3.5">
              {analysis.riskLevel === "high" ? (
                <ShieldAlert className="w-10 h-10 text-red-600 shrink-0" />
              ) : analysis.riskLevel === "warning" ? (
                <AlertTriangle className="w-10 h-10 text-amber-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest block opacity-80">
                  AI Scam Assessment
                </span>
                <h2 className="font-serif font-extrabold text-2xl sm:text-3xl mt-0.5">
                  {analysis.verdictTitle}
                </h2>
              </div>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={handleToggleAudio}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 font-bold text-base shadow-xs transition cursor-pointer shrink-0"
              style={{
                borderColor:
                  analysis.riskLevel === "high" ? "#fca5a5" : "#fed7aa",
              }}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5 text-rose-600" />
                  <span>Stop Reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-sky-700" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>
          </div>

          {/* Plain English Explanation */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-600" />
              <span>In Plain English:</span>
            </h3>
            <p
              className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-800 leading-relaxed ${
                isLargeText ? "text-xl" : "text-lg"
              }`}
            >
              {analysis.plainExplanation}
            </p>
          </div>

          {/* Warning Signs / Red Flags */}
          {analysis.redFlags && analysis.redFlags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-lg sm:text-xl text-slate-900">
                Warning Signs Identified:
              </h3>
              <ul className="space-y-2">
                {analysis.redFlags.map((flag, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-slate-800 font-medium text-base sm:text-lg"
                  >
                    <span className="text-red-600 font-bold shrink-0">✕</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exact Steps to Take */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-lg sm:text-xl text-slate-900">
              What You Should Do Right Now:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {analysis.recommendedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-1"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1">
                    {idx + 1}
                  </div>
                  <p className="text-slate-900 font-bold text-base leading-snug">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
