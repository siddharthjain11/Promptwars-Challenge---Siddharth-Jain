import React, { useState, useRef } from "react";
import { ImportantDocument } from "../types";
import {
  ArrowLeft,
  Plus,
  FileText,
  CreditCard,
  HeartPulse,
  ShieldCheck,
  Upload,
  Volume2,
  VolumeX,
  Trash2,
  Eye,
  X,
  Download,
  Check,
  Sparkles,
  Info,
  Copy,
  Printer,
} from "lucide-react";
import { speech } from "../utils/speech";

interface DocumentsScreenProps {
  onBackToHome: () => void;
  isLargeText: boolean;
}

const INITIAL_DOCUMENTS: ImportantDocument[] = [
  {
    id: "doc-medicare",
    title: "Medicare Health Insurance Card",
    category: "insurance",
    documentNumber: "1EG4-TE5-MK72",
    notes: "Part A (Hospital) and Part B (Medical). Keep handy for doctor appointments and hospital visits.",
    dateAdded: "Active Card",
    fileName: "Medicare_Card_Copy.png",
  },
  {
    id: "doc-prescription",
    title: "Current Doctor Prescription & Clinic Info",
    category: "medical",
    documentNumber: "Dr. Robert Chen • (555) 0144",
    notes: "Clinic: Oakwood Medical Center, Suite 300. Mon-Fri 9am-5pm. Refills at Main St. Pharmacy.",
    dateAdded: "Updated Recently",
    fileName: "Doctor_Prescription_Summary.txt",
  },
  {
    id: "doc-id",
    title: "State ID / Senior Transit Card",
    category: "id",
    documentNumber: "ID # 9842-7710-A",
    notes: "Free senior bus and transit pass. Valid through 2028.",
    dateAdded: "Permanent",
    fileName: "Senior_Transit_ID.png",
  },
];

const PRESET_SUGGESTIONS = [
  {
    label: "+ Medicare / Health Card",
    title: "Medicare / Health Insurance Card",
    category: "insurance" as const,
    docNumberPlaceholder: "e.g. Member ID or Policy #",
    notes: "Show this at doctor visits and pharmacy counter.",
  },
  {
    label: "+ Doctor's Prescription",
    title: "Doctor's Prescription Note",
    category: "medical" as const,
    docNumberPlaceholder: "Doctor Name & Phone",
    notes: "List of current medicines or clinic contact.",
  },
  {
    label: "+ Driver's License or ID",
    title: "State ID or Driver's License",
    category: "id" as const,
    docNumberPlaceholder: "ID Number",
    notes: "Official identification card for travel and appointments.",
  },
  {
    label: "+ Emergency Contact Note",
    title: "Emergency Care Instructions",
    category: "emergency" as const,
    docNumberPlaceholder: "Family Contact Phone",
    notes: "Important phone numbers and emergency medical instructions.",
  },
];

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({
  onBackToHome,
  isLargeText,
}) => {
  const [documents, setDocuments] = useState<ImportantDocument[]>(() => {
    const saved = localStorage.getItem("senior_companion_documents");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DOCUMENTS;
      }
    }
    return INITIAL_DOCUMENTS;
  });

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<ImportantDocument | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<ImportantDocument["category"]>("insurance");
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveDocuments = (updated: ImportantDocument[]) => {
    setDocuments(updated);
    try {
      localStorage.setItem("senior_companion_documents", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage quota limit or error saving documents", e);
    }
  };

  const handleOpenAddModal = (preset?: typeof PRESET_SUGGESTIONS[0]) => {
    speech.stop();
    if (preset) {
      setTitle(preset.title);
      setCategory(preset.category);
      setDocumentNumber("");
      setNotes(preset.notes);
    } else {
      setTitle("");
      setCategory("insurance");
      setDocumentNumber("");
      setNotes("");
    }
    setFileData(undefined);
    setFileName(undefined);
    setIsAddModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select a file or photo under 5MB.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDoc: ImportantDocument = {
      id: "doc-" + Date.now(),
      title: title.trim(),
      category,
      documentNumber: documentNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      fileData,
      fileName: fileName || (fileData ? "Uploaded_Document.png" : undefined),
      dateAdded: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const updated = [newDoc, ...documents];
    saveDocuments(updated);
    speech.playChime("success");
    setIsAddModalOpen(false);
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    saveDocuments(updated);
    setDeleteConfirmId(null);
    if (previewDoc?.id === id) {
      setPreviewDoc(null);
    }
    speech.playChime("gentle");
  };

  const handleReadAloud = (doc: ImportantDocument) => {
    if (speakingId === doc.id) {
      speech.stop();
      setSpeakingId(null);
    } else {
      speech.stop();
      setSpeakingId(doc.id);
      let text = `Important document: ${doc.title}. `;
      if (doc.documentNumber) {
        text += `Document or card number is: ${doc.documentNumber}. `;
      }
      if (doc.notes) {
        text += `Notes: ${doc.notes}. `;
      }
      if (doc.fileName) {
        text += `A file named ${doc.fileName} is saved here.`;
      }
      speech.speak(text, {
        onStart: () => setSpeakingId(doc.id),
        onEnd: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    }
  };

  const handleCopyNumber = (doc: ImportantDocument) => {
    if (!doc.documentNumber) return;
    navigator.clipboard.writeText(doc.documentNumber);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredDocs =
    activeCategory === "all"
      ? documents
      : documents.filter((d) => d.category === activeCategory);

  const getCategoryBadge = (cat: ImportantDocument["category"]) => {
    switch (cat) {
      case "insurance":
        return {
          label: "Health Insurance",
          icon: CreditCard,
          bg: "bg-sky-100 text-sky-800 border-sky-300",
        };
      case "medical":
        return {
          label: "Medical / Prescription",
          icon: HeartPulse,
          bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
      case "id":
        return {
          label: "Identification",
          icon: ShieldCheck,
          bg: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "emergency":
        return {
          label: "Emergency Info",
          icon: FileText,
          bg: "bg-rose-100 text-rose-800 border-rose-300",
        };
      default:
        return {
          label: "Document",
          icon: FileText,
          bg: "bg-slate-100 text-slate-800 border-slate-300",
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-2 border-sky-100 shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="docs-back-to-home"
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
                Important Documents
              </h1>
            </div>
            <p className="text-slate-600 font-medium text-sm sm:text-base mt-0.5">
              Keep insurance cards, doctor notes, and IDs safe & easy to find.
            </p>
          </div>
        </div>

        {/* Big Add Document Button */}
        <button
          onClick={() => handleOpenAddModal()}
          id="add-document-button"
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base sm:text-lg shadow-md transition active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-sky-300 cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
          <span>Add New Document</span>
        </button>
      </div>

      {/* 1-TAP QUICK ADD SUGGESTIONS */}
      <section className="bg-sky-50/70 p-4 sm:p-5 rounded-3xl border-2 border-sky-100 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-700" />
          <h2 className="font-bold text-base sm:text-lg text-sky-950">
            Quick 1-Tap Document Starters
          </h2>
          <span className="text-xs font-semibold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200">
            Tap to set up
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_SUGGESTIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleOpenAddModal(preset)}
              className="text-left p-3 rounded-2xl bg-white hover:bg-sky-100/60 border-2 border-sky-200 text-slate-800 font-bold text-sm sm:text-base transition active:scale-95 shadow-2xs hover:border-sky-400 cursor-pointer"
            >
              <span className="block text-sky-900 leading-snug">{preset.label}</span>
              <span className="block text-xs font-medium text-slate-500 mt-1">
                {preset.category === "insurance"
                  ? "Card & member ID"
                  : preset.category === "medical"
                  ? "Prescriptions & clinic"
                  : preset.category === "id"
                  ? "Pass & photo"
                  : "Quick instructions"}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
        {[
          { key: "all", label: `All Documents (${documents.length})` },
          { key: "insurance", label: "Health & Insurance" },
          { key: "medical", label: "Medical & Prescriptions" },
          { key: "id", label: "IDs & Passes" },
          { key: "emergency", label: "Emergency Notes" },
        ].map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeCategory === tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`px-4 py-2.5 rounded-xl font-bold text-base sm:text-lg border-2 transition whitespace-nowrap cursor-pointer ${
              activeCategory === tab.key
                ? "bg-sky-700 text-white border-sky-700 shadow-xs"
                : "bg-white text-slate-700 border-sky-100 hover:bg-sky-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DOCUMENTS LIST */}
      <div className="space-y-4" id="documents-list-container">
        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-sky-100 space-y-3">
            <Info className="w-14 h-14 text-sky-500 mx-auto" />
            <h2 className="font-bold text-2xl text-slate-900">
              No documents in this category
            </h2>
            <p className="text-slate-600 font-medium text-lg">
              Tap "+ Add New Document" or choose one of the quick starters above.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const badge = getCategoryBadge(doc.category);
            const BadgeIcon = badge.icon;
            const isSpeaking = speakingId === doc.id;
            const isCopied = copiedId === doc.id;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-sky-100 hover:border-sky-300 shadow-xs transition duration-150 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 border-2 border-sky-200 shadow-2xs">
                    <BadgeIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                      {doc.dateAdded && (
                        <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          {doc.dateAdded}
                        </span>
                      )}
                      {doc.fileData && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Photo/File Attached</span>
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-bold text-slate-900 leading-snug break-words ${
                        isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                      }`}
                    >
                      {doc.title}
                    </h3>

                    {/* Member or Document Number Display (Huge & Copyable) */}
                    {doc.documentNumber && (
                      <div className="flex items-center gap-2 bg-sky-50 border-2 border-sky-200 rounded-xl px-3.5 py-2 w-fit max-w-full flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                          Number / ID:
                        </span>
                        <span className="font-mono font-bold text-base sm:text-lg text-slate-900 select-all">
                          {doc.documentNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(doc)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-sky-100 text-sky-900 text-xs font-bold border border-sky-300 transition active:scale-90 ml-1"
                          title="Copy to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Notes */}
                    {doc.notes && (
                      <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                        {doc.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right action buttons */}
                <div className="flex items-center gap-2 self-stretch md:self-center shrink-0 flex-wrap justify-end">
                  {/* VIEW DETAILS BUTTON */}
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-base bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Card</span>
                  </button>

                  {/* LISTEN ALOUD BUTTON */}
                  <button
                    onClick={() => handleReadAloud(doc)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-base transition border-2 cursor-pointer ${
                      isSpeaking
                        ? "bg-sky-700 text-white border-sky-800 animate-pulse"
                        : "bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-200"
                    }`}
                    title="Read document info out loud"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-5 h-5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 text-sky-700" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>

                  {/* DELETE BUTTON with safe confirmation */}
                  {deleteConfirmId === doc.id ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 p-1.5 rounded-xl">
                      <span className="text-xs font-bold text-rose-900 px-1">
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(doc.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove this document"
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

      {/* MODAL 1: ADD NEW DOCUMENT */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border-4 border-sky-500 shadow-2xl space-y-6 my-8 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                  Keep Safe & Handy
                </span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
                  Add Important Document
                </h2>
                <p className="text-slate-600 font-medium text-sm sm:text-base mt-0.5">
                  Save your card details or attach a clear photo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-sky-50 transition border border-sky-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4">
              {/* Document Title */}
              <div>
                <label className="block font-bold text-slate-900 text-base sm:text-lg mb-1.5">
                  What document is this? *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Blue Cross Insurance, Heart Doctor Summary, Bus ID..."
                  className="w-full p-4 rounded-2xl border-2 border-sky-200 focus:border-sky-600 focus:ring-4 focus:ring-sky-200 font-semibold text-slate-900 text-lg outline-hidden"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-900 text-base mb-1.5">
                  Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: "insurance", label: "Insurance" },
                    { key: "medical", label: "Medical / Rx" },
                    { key: "id", label: "ID Card" },
                    { key: "emergency", label: "Emergency" },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(c.key as any)}
                      className={`py-2.5 px-3 rounded-xl border-2 font-bold text-sm sm:text-base transition cursor-pointer ${
                        category === c.key
                          ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                          : "bg-sky-50/50 text-slate-700 border-sky-200 hover:bg-sky-100"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document / Member Number */}
              <div>
                <label className="block font-bold text-slate-900 text-base mb-1.5">
                  Card / Member / Policy Number (optional):
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g. 1EG4-TE5-MK72 or Policy # 99281"
                  className="w-full p-3.5 rounded-xl border-2 border-sky-200 focus:border-sky-600 font-mono font-semibold text-slate-900 text-base outline-hidden"
                />
              </div>

              {/* Upload Photo or File */}
              <div className="bg-sky-50/70 border-2 border-dashed border-sky-300 rounded-2xl p-4 text-center space-y-2">
                <Upload className="w-8 h-8 text-sky-600 mx-auto" />
                <div>
                  <p className="font-bold text-slate-900 text-base">
                    {fileName ? `Attached: ${fileName}` : "Attach a Photo or Document File"}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Take a photo of your plastic card or select an image file from your device.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-sky-100 text-sky-900 font-bold text-sm border-2 border-sky-300 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  {fileName ? "Change File / Photo" : "Choose File or Take Photo"}
                </button>
              </div>

              {/* Extra Notes */}
              <div>
                <label className="block font-bold text-slate-900 text-base mb-1.5">
                  Extra Notes or Directions (optional):
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Doctor's name, clinic phone, expiry date..."
                  className="w-full p-3.5 rounded-xl border-2 border-sky-200 focus:border-sky-600 font-medium text-slate-900 text-base outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-sky-100">
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="w-full sm:flex-1 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xl shadow-md transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  Save Document ✓
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL-SCREEN LARGE VIEW MODAL FOR SENIOR */}
      {previewDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border-4 border-sky-600 shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                  Document Details
                </span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
                  {previewDoc.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-sky-50 transition border border-sky-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Giant Number Card for Showing Doctor or Pharmacy */}
            {previewDoc.documentNumber && (
              <div className="bg-sky-50 border-3 border-sky-300 rounded-2xl p-5 text-center space-y-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-800">
                  Card / Identification Number
                </span>
                <p className="font-mono font-extrabold text-2xl sm:text-3xl text-slate-950 tracking-wider">
                  {previewDoc.documentNumber}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Show this screen directly to the clinic desk or receptionist.
                </p>
              </div>
            )}

            {/* Image Preview if uploaded */}
            {previewDoc.fileData ? (
              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Attached Photo / Scan
                </span>
                <div className="border-2 border-sky-200 rounded-2xl overflow-hidden bg-slate-50 max-h-96 flex items-center justify-center p-2">
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.title}
                    className="max-h-80 w-auto object-contain rounded-xl shadow-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-sky-50/50 border border-sky-200 rounded-2xl p-4 text-center text-slate-500 text-sm">
                No image attached for this card. The information above is safely saved.
              </div>
            )}

            {/* Notes */}
            {previewDoc.notes && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Notes:
                </span>
                <p className="text-slate-800 font-medium text-base sm:text-lg leading-relaxed">
                  {previewDoc.notes}
                </p>
              </div>
            )}

            {/* Modal Actions: Listen, Print/Download, Close */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-sky-100">
              <button
                type="button"
                onClick={() => handleReadAloud(previewDoc)}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>Read Out Loud</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-base border-2 border-sky-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-5 h-5 text-sky-700" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base border border-slate-300 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
