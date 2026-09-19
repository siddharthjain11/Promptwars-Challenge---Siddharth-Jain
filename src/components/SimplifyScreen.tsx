import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  FileText,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Upload,
  Camera,
  PlusCircle,
  Pill,
  Receipt,
  Check,
  DollarSign,
  BookmarkCheck,
} from "lucide-react";
import { speech } from "../utils/speech";
import { sanitizeInput } from "../utils/sanitize";
import { AppLanguage, Reminder } from "../types";

interface MedicineItem {
  name: string;
  dosage: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  purpose?: string;
}

interface SimplifiedDocumentResult {
  docType: "prescription" | "bill" | "official_letter" | "receipt" | "appointment" | "other";
  docTypeLabel: string;
  summary: string;
  actionRequired: string;
  keyDetails: string;
  suggestedActions: string[];
  medicines: MedicineItem[];
  billDetails?: {
    dueDate?: string;
    amountDue?: string;
    payableTo?: string;
  } | null;
}

interface SimplifyScreenProps {
  onBackToHome: () => void;
  isLargeText: boolean;
  currentLanguage?: AppLanguage;
  isAudioDescEnabled?: boolean;
  onAddReminder?: (newReminder: Omit<Reminder, "id" | "completed">) => void;
  onNavigateToReminders?: () => void;
  onNavigateToDocuments?: () => void;
}

const SAMPLE_TEXTS = [
  {
    title: "Doctor's Prescription Slip",
    category: "Prescription",
    text: "Rx from Dr. Robert Hayes, MD - Cardiology Clinic. Patient: John Doe. 1. Metformin 500mg - Take 1 tablet daily with breakfast for blood sugar. 2. Amlodipine 5mg - Take 1 tablet every evening for blood pressure. 3. Atorvastatin 20mg - Take 1 tablet at bedtime. Refill 3 times.",
  },
  {
    title: "Electric Utility Bill",
    category: "Utility Bill",
    text: "City Power & Light Statement: Account #4829-102. Current amount due: $64.20. Due date: October 25. Note: Enrolled in auto-debit draft from checking account. No manual payment required. Customer Service: 1-800-555-0199.",
  },
  {
    title: "Specialist Appointment Notice",
    category: "Clinic Visit",
    text: "Appointment confirmation for Memorial Eye Clinic: Scheduled with Dr. Sarah Jenkins on Thursday, Nov 12 at 10:30 AM. Suite 402. Please bring current glasses and insurance card. Fasting not required. Call (555) 0188 if needing transport assistance.",
  },
];

export const SimplifyScreen: React.FC<SimplifyScreenProps> = ({
  onBackToHome,
  isLargeText,
  currentLanguage = "en",
  isAudioDescEnabled = false,
  onAddReminder,
  onNavigateToReminders,
  onNavigateToDocuments,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [result, setResult] = useState<SimplifiedDocumentResult | null>(null);
  const [addedMeds, setAddedMeds] = useState<{ [medIndex: number]: boolean }>({});
  const [addedAllMeds, setAddedAllMeds] = useState(false);
  const [savedToDocsStatus, setSavedToDocsStatus] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync speaking state with speech singleton
  useEffect(() => {
    const unsub = speech.subscribe((speaking) => {
      if (!speaking) {
        setIsSpeaking(false);
      }
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      // Auto analyze when uploaded
      handleAnalyzeDocument({ imageBase64: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeDocument = async (options?: {
    textOverride?: string;
    imageBase64?: string;
    mimeType?: string;
  }) => {
    const textToSend = (options?.textOverride !== undefined ? options.textOverride : inputText).trim();
    const imageToSend = options?.imageBase64 || selectedImage;

    if (!textToSend && !imageToSend) return;
    if (isLoading) return;

    speech.stop();
    setIsSpeaking(false);
    setIsLoading(true);
    setAddedMeds({});
    setAddedAllMeds(false);
    setSavedToDocsStatus(false);

    try {
      const payload: any = {};
      if (textToSend) {
        payload.text = sanitizeInput(textToSend, { maxLength: 8000 });
      }
      if (imageToSend) {
        payload.imageBase64 = imageToSend;
        payload.mimeType = options?.mimeType || "image/jpeg";
      }

      const res = await fetch("/api/companion/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const parsedResult: SimplifiedDocumentResult = {
        docType: data.docType || "other",
        docTypeLabel: data.docTypeLabel || "Analyzed Document",
        summary: data.summary || "Here is what this document means.",
        actionRequired: data.actionRequired || "No action required.",
        keyDetails: data.keyDetails || "No specific dates or amounts found.",
        suggestedActions: Array.isArray(data.suggestedActions) ? data.suggestedActions : [],
        medicines: Array.isArray(data.medicines) ? data.medicines : [],
        billDetails: data.billDetails || null,
      };

      setResult(parsedResult);

      // Spoken summary if Audio Description is enabled
      const spoken = `Document classified as ${parsedResult.docTypeLabel}. ${parsedResult.summary}. Action: ${parsedResult.actionRequired}.`;
      speech.speakDescription(spoken, {
        lang: currentLanguage,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.warn("Error simplifying document:", err);
      setResult({
        docType: "other",
        docTypeLabel: "Important Document",
        summary: "We had a slight trouble reading this, but you are completely safe.",
        actionRequired: "Please ask a trusted family member or doctor to look at it.",
        keyDetails: "Keep this document in your safe folder.",
        suggestedActions: ["Save to Documents", "Ask Family Member"],
        medicines: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeakResult = () => {
    if (!result) return;

    if (isSpeaking || speech.isSpeaking()) {
      speech.stop();
      setIsSpeaking(false);
    } else {
      let fullText = `Document: ${result.docTypeLabel}. What this is about: ${result.summary}. Do you need to do anything: ${result.actionRequired}. Key details: ${result.keyDetails}.`;
      if (result.medicines && result.medicines.length > 0) {
        fullText += ` It has ${result.medicines.length} medicines listed: ` +
          result.medicines.map((m) => `${m.name}, ${m.dosage}`).join(". ");
      }
      speech.speak(fullText, {
        lang: currentLanguage,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  // Add individual medicine to reminders
  const handleAddMedicineToReminder = (med: MedicineItem, index: number) => {
    if (!onAddReminder) return;

    const timeMap: Record<string, string> = {
      morning: "08:00 AM",
      afternoon: "01:00 PM",
      evening: "06:00 PM",
      night: "09:00 PM",
    };

    onAddReminder({
      title: `Take ${med.name}`,
      isMedicine: true,
      medicineName: med.name,
      timeOfDay: med.timeOfDay || "morning",
      timeStr: timeMap[med.timeOfDay] || "08:00 AM",
      notes: med.dosage ? `${med.dosage}${med.purpose ? ` (${med.purpose})` : ""}` : undefined,
    });

    setAddedMeds((prev) => ({ ...prev, [index]: true }));
    speech.speak(`Added ${med.name} to your daily medicine reminders.`);
  };

  // Add all extracted medicines to reminders at once
  const handleAddAllMedicines = () => {
    if (!result || !result.medicines || result.medicines.length === 0 || !onAddReminder) return;

    result.medicines.forEach((med, idx) => {
      handleAddMedicineToReminder(med, idx);
    });
    setAddedAllMeds(true);
    speech.speak(`Added all ${result.medicines.length} medicines to your daily reminders.`);
  };

  // Save document to Important Documents
  const handleSaveToImportantDocuments = () => {
    try {
      const existingStr = localStorage.getItem("senior_companion_docs");
      const existingDocs = existingStr ? JSON.parse(existingStr) : [];
      const newDoc = {
        id: "doc_" + Date.now(),
        title: result?.docTypeLabel || selectedFileName || "Prescription / Document",
        category: result?.docType === "prescription" ? "medical" : "id",
        notes: `${result?.summary || ""} ${result?.keyDetails || ""}`.trim(),
        fileData: selectedImage || undefined,
        fileName: selectedFileName || "Uploaded_Document.jpg",
        dateAdded: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      localStorage.setItem("senior_companion_docs", JSON.stringify([newDoc, ...existingDocs]));
      setSavedToDocsStatus(true);
      speech.speak("Document saved safely in your Important Documents folder.");
    } catch {
      setSavedToDocsStatus(true);
    }
  };

  const handleReset = () => {
    setInputText("");
    setSelectedImage(null);
    setSelectedFileName(null);
    setResult(null);
    setAddedMeds({});
    setAddedAllMeds(false);
    setSavedToDocsStatus(false);
    speech.stop();
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border-2 border-sky-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="simplify-back-to-home"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-base sm:text-lg border-2 border-sky-200 transition focus:outline-hidden focus:ring-4 focus:ring-sky-300 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-sky-700" />
            <span>Go to Home</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Reading glasses">
                👓
              </span>
              <h1
                className={`font-serif font-bold text-slate-900 ${
                  isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                Read This for Me
              </h1>
            </div>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              Upload or type prescriptions, bills, or notices to understand them easily
            </p>
          </div>
        </div>

        {(inputText || selectedImage || result) && (
          <button
            onClick={handleReset}
            id="simplify-start-fresh"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-sky-50 border border-sky-200 text-base font-bold transition cursor-pointer self-start sm:self-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Fresh</span>
          </button>
        )}
      </div>

      {/* UPLOAD & SCAN PROMINENT SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-sky-200 shadow-xs space-y-5">
        <div>
          <h2 className="font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-600" />
            <span>Upload Document Photo or Slip</span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Take a photo of your doctor prescription, medicine strip, utility bill, or letter. Gemini AI will analyze it right away.
          </p>
        </div>

        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id="document-upload-input"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Big Upload Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            id="btn-upload-document-photo"
            className="p-5 rounded-2xl border-2 border-dashed border-sky-400 bg-sky-50/60 hover:bg-sky-100/70 text-left flex items-center gap-4 transition active:scale-98 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base sm:text-lg block">
                Take Photo or Upload Slip
              </span>
              <span className="text-xs sm:text-sm text-sky-800 font-medium block">
                Prescription, bill, or notice image
              </span>
            </div>
          </button>

          {/* Quick Preview or Instruction */}
          {selectedImage ? (
            <div className="p-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 flex items-center gap-3">
              <img
                src={selectedImage}
                alt="Selected Document"
                className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 block">
                  Photo Ready
                </span>
                <p className="font-bold text-slate-900 text-sm truncate">
                  {selectedFileName || "Document Photo"}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-sky-700 font-bold hover:underline cursor-pointer"
                >
                  Change Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label="Document Types">
                📋
              </span>
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  Instant Recognition
                </span>
                <span className="text-xs text-slate-500 leading-relaxed block">
                  Automatically extracts medicines, due dates, payments, and clinic visits.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* OR Enter / Paste Text */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label
            htmlFor="simplify-text-box"
            className="block font-bold text-slate-800 text-sm sm:text-base"
          >
            Or paste / type confusing text manually:
          </label>
          <textarea
            id="simplify-text-box"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 'Take 1 tab Metformin twice daily with breakfast and dinner...' or paste your message"
            rows={3}
            className={`w-full p-3.5 rounded-2xl border-2 border-sky-200 focus:border-sky-500 focus:ring-3 focus:ring-sky-100 font-medium text-slate-900 placeholder:text-slate-400 resize-none outline-hidden ${
              isLargeText ? "text-lg" : "text-base"
            }`}
          />
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500">
            Safe & private. No medical data is saved permanently.
          </p>
          <button
            onClick={() => handleAnalyzeDocument()}
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            id="btn-analyze-document"
            className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-base sm:text-lg shadow-md transition active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>
              {isLoading ? "Reading with Gemini AI..." : "Analyze & Read Document"}
            </span>
          </button>
        </div>
      </div>

      {/* SAMPLE DOCUMENTS (Quick Tryout) */}
      {!result && (
        <div className="bg-sky-50/70 p-5 rounded-3xl border-2 border-sky-200 space-y-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-900 block">
            Or try one of these common sample documents:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_TEXTS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(s.text);
                  setSelectedImage(null);
                  setSelectedFileName(null);
                  handleAnalyzeDocument({ textOverride: s.text });
                }}
                className="text-left p-4 rounded-2xl bg-white hover:bg-sky-100 active:bg-sky-200 border-2 border-sky-200 font-bold text-sm sm:text-base text-slate-900 transition shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-sky-700 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-[11px] uppercase font-extrabold tracking-wider">
                    {s.category}
                  </span>
                </div>
                <span className="block">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI ANALYSIS RESULTS & CONTEXTUAL ACTION OPTIONS */}
      {result && (
        <div
          id="simplified-ai-result"
          className="bg-emerald-50/80 border-3 border-emerald-500 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in"
        >
          {/* Header with Classification Badge & Read Out Loud */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-2xs">
                  {result.docTypeLabel}
                </span>
                {result.docType === "prescription" && (
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 font-bold text-xs flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5" />
                    <span>Prescription Detected</span>
                  </span>
                )}
                {result.docType === "bill" && (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Bill Detected</span>
                  </span>
                )}
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950 mt-2">
                What this document means
              </h2>
            </div>

            <button
              onClick={handleToggleSpeakResult}
              id="btn-voice-read-result"
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-base sm:text-lg transition shadow-2xs cursor-pointer ${
                isSpeaking
                  ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>Listen Out Loud</span>
                </>
              )}
            </button>
          </div>

          {/* 3 Core Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: What It Is */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>1. What this is</span>
              </div>
              <p
                className={`text-slate-900 font-semibold leading-relaxed ${
                  isLargeText ? "text-lg" : "text-base"
                }`}
              >
                {result.summary}
              </p>
            </div>

            {/* Card 2: Action Needed */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>2. Action needed</span>
              </div>
              <p
                className={`text-slate-900 font-semibold leading-relaxed ${
                  isLargeText ? "text-lg" : "text-base"
                }`}
              >
                {result.actionRequired}
              </p>
            </div>

            {/* Card 3: Key Details */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <AlertCircle className="w-5 h-5 text-emerald-600" />
                <span>3. Key numbers & dates</span>
              </div>
              <p
                className={`text-slate-900 font-semibold leading-relaxed ${
                  isLargeText ? "text-lg" : "text-base"
                }`}
              >
                {result.keyDetails}
              </p>
            </div>
          </div>

          {/* CONTEXT-AWARE FEATURE 1: PRESCRIPTION MEDICINE LIST & "ADD MEDICINES" OPTION */}
          {result.medicines && result.medicines.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border-2 border-sky-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                      Medicines Found in Prescription ({result.medicines.length})
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      You can add each medicine directly to your Daily Medication Reminders:
                    </p>
                  </div>
                </div>

                {onAddReminder && (
                  <button
                    type="button"
                    onClick={handleAddAllMedicines}
                    disabled={addedAllMeds}
                    id="btn-add-all-medicines"
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-emerald-600 text-white font-bold text-sm shadow-2xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {addedAllMeds ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>All Added to Reminders</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Add All Medicines</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Medicines List Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {result.medicines.map((med, idx) => {
                  const isAdded = addedMeds[idx] || addedAllMeds;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border-2 border-sky-100 bg-sky-50/50 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 text-base block">
                          {med.name}
                        </span>
                        <span className="text-xs text-sky-800 font-medium block">
                          {med.dosage}
                        </span>
                        {med.purpose && (
                          <span className="text-[11px] text-slate-500 block">
                            Purpose: {med.purpose}
                          </span>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white border border-sky-200 text-[11px] font-bold text-sky-900 capitalize">
                          Scheduled: {med.timeOfDay}
                        </span>
                      </div>

                      {onAddReminder && (
                        <button
                          type="button"
                          onClick={() => handleAddMedicineToReminder(med, idx)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1 ${
                            isAdded
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-white text-sky-700 border border-sky-300 hover:bg-sky-100 shadow-2xs"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Add Reminder</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {onNavigateToReminders && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      speech.stop();
                      onNavigateToReminders();
                    }}
                    className="text-xs font-bold text-sky-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View Daily Reminders Schedule →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CONTEXT-AWARE FEATURE 2: BILL DUE DETAILS & PAYMENT INFO */}
          {result.docType === "bill" && (
            <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span>Bill Payment Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <span className="text-xs text-amber-800 font-bold block">Amount</span>
                  <span className="text-lg font-extrabold text-amber-950">
                    {result.billDetails?.amountDue || "Review Statement"}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <span className="text-xs text-amber-800 font-bold block">Due Date</span>
                  <span className="text-lg font-extrabold text-amber-950">
                    {result.billDetails?.dueDate || "See Details"}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <span className="text-xs text-amber-800 font-bold block">Payable To</span>
                  <span className="text-sm font-bold text-amber-950">
                    {result.billDetails?.payableTo || result.docTypeLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CONTEXT-AWARE FEATURE 3: QUICK ACTIONS (SAVE TO DOCUMENTS, ETC.) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-sky-600" />
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  Keep This in Your Important Documents
                </span>
                <span className="text-xs text-slate-500">
                  Save a copy to show your doctor, caregiver, or family later
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveToImportantDocuments}
                disabled={savedToDocsStatus}
                id="btn-save-to-docs"
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 ${
                  savedToDocsStatus
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100"
                }`}
              >
                {savedToDocsStatus ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Saved to Documents</span>
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Save to Documents</span>
                  </>
                )}
              </button>

              {onNavigateToDocuments && savedToDocsStatus && (
                <button
                  type="button"
                  onClick={() => {
                    speech.stop();
                    onNavigateToDocuments();
                  }}
                  className="px-3 py-2 rounded-xl text-sky-700 hover:bg-sky-50 text-xs font-bold transition cursor-pointer"
                >
                  Open Documents →
                </button>
              )}
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
