import React, { useState } from "react";
import { FamilyContact, EmergencyProfile } from "../types";
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  ShieldAlert,
  Ambulance,
  Building2,
  HeartHandshake,
  UserCheck,
  UserPlus,
  Volume2,
  VolumeX,
  Edit2,
  X,
  AlertTriangle,
  FileHeart,
} from "lucide-react";
import { speech } from "../utils/speech";

interface EmergencyScreenProps {
  onBackToHome: () => void;
  isLargeText: boolean;
}

const DEFAULT_PROFILE: EmergencyProfile = {
  fullName: "Eleanor Vance",
  birthYear: "1948",
  bloodType: "O Positive (O+)",
  allergies: "Penicillin (Severe), Shellfish",
  conditions: "Hypertension, Mild Arthritis",
  homeAddress: "742 Evergreen Terrace, Apt 4B",
  primaryDoctor: "Dr. Robert Chen",
  primaryDoctorPhone: "(555) 0144",
};

const DEFAULT_FAMILY_CONTACTS: FamilyContact[] = [
  {
    id: "fam-1",
    name: "Sarah Vance",
    relation: "Daughter",
    phone: "555-0192",
    avatarColor: "bg-emerald-600",
    isPrimary: true,
  },
  {
    id: "fam-2",
    name: "Michael Vance",
    relation: "Son",
    phone: "555-0187",
    avatarColor: "bg-sky-600",
  },
  {
    id: "fam-3",
    name: "Dr. Robert Chen",
    relation: "Primary Doctor",
    phone: "555-0144",
    avatarColor: "bg-blue-600",
  },
  {
    id: "fam-4",
    name: "Mrs. Evelyn Miller",
    relation: "Next-door Neighbor",
    phone: "555-0163",
    avatarColor: "bg-teal-600",
  },
];

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  onBackToHome,
  isLargeText,
}) => {
  const [contacts, setContacts] = useState<FamilyContact[]>(() => {
    const saved = localStorage.getItem("senior_companion_contacts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_FAMILY_CONTACTS;
      }
    }
    return DEFAULT_FAMILY_CONTACTS;
  });

  const [profile, setProfile] = useState<EmergencyProfile>(() => {
    const saved = localStorage.getItem("senior_emergency_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const [confirmCallModal, setConfirmCallModal] = useState<{
    title: string;
    number: string;
    description: string;
    is911?: boolean;
  } | null>(null);

  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>("");
  const [newContactPhone, setNewContactPhone] = useState<string>("");
  const [newContactRelation, setNewContactRelation] = useState<string>("Family");

  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileFormData, setProfileFormData] = useState<EmergencyProfile>(profile);

  const [isSpeakingProfile, setIsSpeakingProfile] = useState<boolean>(false);

  const saveContacts = (updated: FamilyContact[]) => {
    setContacts(updated);
    localStorage.setItem("senior_companion_contacts", JSON.stringify(updated));
  };

  const saveProfile = (updated: EmergencyProfile) => {
    setProfile(updated);
    localStorage.setItem("senior_emergency_profile", JSON.stringify(updated));
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: FamilyContact = {
      id: "fam-" + Date.now(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation.trim() || "Contact",
      avatarColor: "bg-sky-700",
    };

    saveContacts([...contacts, newContact]);
    setNewContactName("");
    setNewContactPhone("");
    setNewContactRelation("Family");
    setIsEditingContact(false);
    speech.playChime("success");
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    saveContacts(updated);
  };

  const handleReadProfileAloud = () => {
    if (isSpeakingProfile) {
      speech.stop();
      setIsSpeakingProfile(false);
      return;
    }

    const text = `Emergency Medical Information for ${profile.fullName}. Blood Type is ${profile.bloodType}. Known Allergies: ${profile.allergies}. Medical conditions: ${profile.conditions}. Home address: ${profile.homeAddress}. Primary Doctor is ${profile.primaryDoctor}, phone number ${profile.primaryDoctorPhone}.`;
    speech.speak(text, {
      onStart: () => setIsSpeakingProfile(true),
      onEnd: () => setIsSpeakingProfile(false),
      onError: () => setIsSpeakingProfile(false),
    });
  };

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(profileFormData);
    setIsEditingProfile(false);
    speech.playChime("success");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Bar with Go to Home */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-2 border-rose-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              speech.stop();
              onBackToHome();
            }}
            id="emergency-back-to-home"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-950 font-bold text-base sm:text-lg border-2 border-sky-200 transition focus:outline-hidden focus:ring-4 focus:ring-sky-300 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-sky-700" />
            <span>Go to Home</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🚨</span>
              <h1
                className={`font-serif font-bold text-slate-900 ${
                  isLargeText ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                Emergency & Helplines
              </h1>
            </div>
            <p className="text-slate-600 font-medium text-sm sm:text-base mt-0.5">
              One-tap direct dial to Ambulance, Police, Senior Helpline & Family.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadProfileAloud}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-base border-2 transition cursor-pointer ${
              isSpeakingProfile
                ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                : "bg-white hover:bg-sky-50 text-slate-800 border-sky-200"
            }`}
          >
            {isSpeakingProfile ? (
              <>
                <VolumeX className="w-5 h-5" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-sky-700" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: PUBLIC EMERGENCY SERVICES (AMBULANCE / EMS, POLICE, SENIOR HELPLINE, NURSE) */}
      <section aria-labelledby="emergency-services-heading" className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
            24/7 Immediate Assistance
          </span>
          <h2
            id="emergency-services-heading"
            className="font-bold text-2xl sm:text-3xl text-slate-900 mt-1"
          >
            Emergency Helplines & First Responders
          </h2>
          <p className="text-slate-600 font-medium text-base">
            Tap any large button to connect your phone immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* 1. AMBULANCE & EMS */}
          <div className="bg-rose-50/80 border-3 border-rose-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-rose-400 transition">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Ambulance className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-white px-2.5 py-0.5 rounded-md border border-rose-200">
                  Medical Emergency • EMS
                </span>
                <h3 className="font-bold text-2xl text-rose-950 mt-1">
                  Ambulance & Paramedics
                </h3>
                <p className="text-rose-900 text-sm sm:text-base font-medium mt-1 leading-relaxed">
                  Call for sudden chest pain, severe shortness of breath, sudden weakness, stroke symptoms, or falls.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-rose-200">
              <button
                type="button"
                onClick={() =>
                  setConfirmCallModal({
                    title: "Ambulance & Emergency Medical (EMS)",
                    number: "911",
                    description:
                      "This will connect you immediately to the nearest paramedic and ambulance dispatch.",
                    is911: true,
                  })
                }
                id="call-ambulance-button"
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xl sm:text-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Phone className="w-6 h-6 animate-bounce" />
                <span>Call Ambulance (911)</span>
              </button>
            </div>
          </div>

          {/* 2. POLICE & IMMEDIATE SAFETY */}
          <div className="bg-sky-50 border-3 border-sky-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-sky-400 transition">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-white px-2.5 py-0.5 rounded-md border border-sky-200">
                  Immediate Safety • 911
                </span>
                <h3 className="font-bold text-2xl text-sky-950 mt-1">
                  Police Department
                </h3>
                <p className="text-sky-900 text-sm sm:text-base font-medium mt-1 leading-relaxed">
                  Call for suspicious activity around your home, intruders, immediate physical safety, or urgent distress.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-sky-200">
              <button
                type="button"
                onClick={() =>
                  setConfirmCallModal({
                    title: "Police Department Emergency",
                    number: "911",
                    description:
                      "This will connect you immediately to local police dispatch for urgent assistance.",
                    is911: true,
                  })
                }
                id="call-police-button"
                className="w-full py-4 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xl sm:text-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Phone className="w-6 h-6" />
                <span>Call Police (911)</span>
              </button>
            </div>
          </div>

          {/* 3. SENIOR CITIZEN HELPLINE */}
          <div className="bg-emerald-50 border-3 border-emerald-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-emerald-400 transition">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <HeartHandshake className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200">
                  National Senior Support
                </span>
                <h3 className="font-bold text-2xl text-emerald-950 mt-1">
                  Senior Citizen Helpline
                </h3>
                <p className="text-emerald-900 text-sm sm:text-base font-medium mt-1 leading-relaxed">
                  Toll-free Eldercare Locator for senior support, daily care, nutrition assistance, and senior rights.
                </p>
                <span className="inline-block font-mono font-bold text-sm text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 mt-2">
                  1-800-677-1116
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-emerald-200">
              <a
                href="tel:18006771116"
                id="call-senior-helpline-button"
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl shadow-md transition active:scale-95 flex items-center justify-center gap-3 text-center cursor-pointer"
              >
                <PhoneCall className="w-6 h-6" />
                <span>Call Senior Helpline</span>
              </a>
            </div>
          </div>

          {/* 4. 24/7 NURSE ADVICE LINE (NON-EMERGENCY HEALTH) */}
          <div className="bg-blue-50 border-3 border-blue-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 transition">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Building2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-white px-2.5 py-0.5 rounded-md border border-blue-200">
                  Health Questions • 24/7
                </span>
                <h3 className="font-bold text-2xl text-blue-950 mt-1">
                  Nurse Advice Line (811)
                </h3>
                <p className="text-blue-900 text-sm sm:text-base font-medium mt-1 leading-relaxed">
                  Speak directly with a registered nurse for medical guidance when not sure if you need the ER.
                </p>
                <span className="inline-block font-mono font-bold text-sm text-blue-800 bg-white px-2.5 py-1 rounded-md border border-blue-200 mt-2">
                  Dial 811 (Toll-Free)
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-blue-200">
              <a
                href="tel:811"
                id="call-nurse-line-button"
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl shadow-md transition active:scale-95 flex items-center justify-center gap-3 text-center cursor-pointer"
              >
                <PhoneCall className="w-6 h-6" />
                <span>Call Nurse Line (811)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PERSONAL FAMILY & DOCTOR CONTACTS */}
      <section aria-labelledby="family-contacts-heading" className="space-y-4 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2
              id="family-contacts-heading"
              className="font-bold text-2xl sm:text-3xl text-slate-900"
            >
              My Emergency Contacts
            </h2>
            <p className="text-slate-600 font-medium text-base">
              Family members and doctors you can dial with one single tap.
            </p>
          </div>

          <button
            onClick={() => setIsEditingContact(!isEditingContact)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-base transition border border-sky-300 cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            <span>{isEditingContact ? "Close Form" : "+ Add Contact"}</span>
          </button>
        </div>

        {/* Add Contact Form if toggled */}
        {isEditingContact && (
          <form
            onSubmit={handleAddContact}
            className="bg-sky-50 border-2 border-sky-300 p-5 sm:p-6 rounded-3xl space-y-4"
          >
            <h3 className="font-bold text-lg text-sky-950">Add a New Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Name (e.g. Sarah Vance)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="p-3.5 rounded-xl border-2 border-sky-200 bg-white font-semibold text-slate-900 outline-hidden focus:border-sky-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g. 555-0192)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="p-3.5 rounded-xl border-2 border-sky-200 bg-white font-semibold text-slate-900 outline-hidden focus:border-sky-500"
                required
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Daughter, Neighbor, Doctor)"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                className="p-3.5 rounded-xl border-2 border-sky-200 bg-white font-semibold text-slate-900 outline-hidden focus:border-sky-500"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-sm cursor-pointer"
              >
                Save Contact
              </button>
              <button
                type="button"
                onClick={() => setIsEditingContact(false)}
                className="px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-base cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white border-3 border-sky-100 hover:border-sky-300 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xs transition"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl ${c.avatarColor} text-white flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <UserCheck className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      {c.relation}
                    </span>
                    {c.isPrimary && (
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                        Primary
                      </span>
                    )}
                  </div>
                  <h3
                    className={`font-bold text-slate-900 mt-1 truncate ${
                      isLargeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                    }`}
                  >
                    {c.name}
                  </h3>
                  <p className="font-mono text-base font-bold text-slate-600 mt-0.5">
                    {c.phone}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteContact(c.id)}
                  className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                  title="Remove contact"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-100">
                <a
                  href={`tel:${c.phone}`}
                  className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg sm:text-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call {c.name.split(" ")[0]} Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: MY EMERGENCY MEDICAL CARD (FOR PARAMEDICS / EMS TO READ) */}
      <section aria-labelledby="medical-card-heading" className="space-y-4 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileHeart className="w-6 h-6 text-rose-600" />
            <h2
              id="medical-card-heading"
              className="font-bold text-2xl sm:text-3xl text-slate-900"
            >
              Emergency Medical Info
            </h2>
          </div>

          <button
            onClick={() => {
              setProfileFormData(profile);
              setIsEditingProfile(!isEditingProfile);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-900 font-bold text-sm sm:text-base border-2 border-sky-200 transition cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-sky-700" />
            <span>{isEditingProfile ? "Close" : "Edit My Info"}</span>
          </button>
        </div>

        <p className="text-slate-600 font-medium text-base">
          Show this card to first responders, doctors, or EMTs in an emergency.
        </p>

        {isEditingProfile ? (
          <form
            onSubmit={handleSaveProfileForm}
            className="bg-white border-3 border-sky-300 rounded-3xl p-6 space-y-4 shadow-sm"
          >
            <h3 className="font-bold text-xl text-slate-900">
              Update Emergency Medical Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  value={profileFormData.fullName}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, fullName: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border-2 border-sky-200 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Blood Type:
                </label>
                <input
                  type="text"
                  value={profileFormData.bloodType}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, bloodType: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border-2 border-sky-200 font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Allergies (e.g. Penicillin, Latex):
                </label>
                <input
                  type="text"
                  value={profileFormData.allergies}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, allergies: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border-2 border-rose-300 font-bold text-rose-950 bg-rose-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Key Medical Conditions:
                </label>
                <input
                  type="text"
                  value={profileFormData.conditions}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, conditions: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border-2 border-sky-200 font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Home Address:
                </label>
                <input
                  type="text"
                  value={profileFormData.homeAddress}
                  onChange={(e) =>
                    setProfileFormData({ ...profileFormData, homeAddress: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border-2 border-sky-200 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Primary Doctor Name:
                </label>
                <input
                  type="text"
                  value={profileFormData.primaryDoctor}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      primaryDoctor: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border-2 border-sky-200 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Doctor Phone Number:
                </label>
                <input
                  type="text"
                  value={profileFormData.primaryDoctorPhone}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      primaryDoctorPhone: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border-2 border-sky-200 font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base cursor-pointer"
              >
                Save Emergency Info
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-base cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white border-3 border-sky-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-100 gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Patient Name
                </span>
                <p className="font-bold text-2xl sm:text-3xl text-slate-900">
                  {profile.fullName}
                </p>
              </div>
              <div className="sm:text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Blood Group
                </span>
                <p className="font-bold text-xl sm:text-2xl text-rose-700 font-mono">
                  {profile.bloodType}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Known Allergies
                </span>
                <p className="font-bold text-lg sm:text-xl text-rose-950 mt-1">
                  {profile.allergies || "None declared"}
                </p>
              </div>

              <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Medical Conditions
                </span>
                <p className="font-bold text-lg sm:text-xl text-sky-950 mt-1">
                  {profile.conditions || "None declared"}
                </p>
              </div>

              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Home Address
                </span>
                <p className="font-bold text-base sm:text-lg text-slate-800 mt-1">
                  {profile.homeAddress}
                </p>
              </div>

              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Primary Doctor
                </span>
                <p className="font-bold text-base sm:text-lg text-slate-800 mt-1">
                  {profile.primaryDoctor} • {profile.primaryDoctorPhone}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CONFIRMATION MODAL (Prevents accidental emergency calls) */}
      {confirmCallModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-rose-600 text-center space-y-5 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="w-18 h-18 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Confirm Call
              </span>
              <h3 className="font-bold text-2xl sm:text-3xl text-slate-900 mt-2">
                Call {confirmCallModal.title}?
              </h3>
              <p className="text-slate-600 font-medium text-base mt-2">
                {confirmCallModal.description}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={`tel:${confirmCallModal.number}`}
                onClick={() => setConfirmCallModal(null)}
                className="block w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xl sm:text-2xl shadow-md transition active:scale-95 cursor-pointer"
              >
                Yes, Call {confirmCallModal.number} Now
              </a>

              <button
                type="button"
                onClick={() => setConfirmCallModal(null)}
                className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg border border-slate-300 cursor-pointer"
              >
                Cancel (Accidental tap)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
