export type Screen =
  | "home"
  | "companion"
  | "reminders"
  | "simplify"
  | "documents"
  | "emergency"
  | "tasks"
  | "scam-checker"
  | "games"
  | "nearby";

export type AppTheme = "blue" | "yellow" | "pink" | "purple" | "green";

export type AppLanguage = "en" | "hi" | "hinglish";

export interface QuizQuestion {
  id?: string;
  category?: string;
  question: string;
  options: string[];
  correct: number;
  fact: string;
  isAiGenerated?: boolean;
}

export interface UserProfile {
  isLoggedIn: boolean;
  phoneNumber?: string;
  name?: string;
  email?: string;
  avatar?: string;
  gender?: "female" | "male" | "other";
  authProvider?: "phone" | "google" | "guest";
  createdAt?: string;
  
  // Non-mandatory profile details (all optional):
  preferredName?: string;
  birthYear?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  city?: string;
  favoriteInterests?: string;
  healthNotes?: string;
}

export interface ScamAnalysisResult {
  riskLevel: "high" | "warning" | "safe";
  verdictTitle: string;
  plainExplanation: string;
  redFlags: string[];
  recommendedActions: string[];
  safeToClick: boolean;
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface Reminder {
  id: string;
  title: string;
  timeOfDay: TimeOfDay;
  timeStr: string;
  completed: boolean;
  isMedicine?: boolean;
  medicineName?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "companion";
  text: string;
  timestamp: string;
}

export interface FamilyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatarColor: string;
  isPrimary?: boolean;
}

export interface ImportantDocument {
  id: string;
  title: string;
  category: "insurance" | "medical" | "id" | "legal" | "emergency";
  documentNumber?: string;
  notes?: string;
  fileData?: string; // base64 / data URL of uploaded card or photo
  fileName?: string;
  dateAdded: string;
}

export interface EmergencyProfile {
  fullName: string;
  birthYear?: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  homeAddress: string;
  primaryDoctor: string;
  primaryDoctorPhone: string;
}

export interface TaskStep {
  title: string;
  instruction: string;
}

export interface PrebuiltGuide {
  id: string;
  title: string;
  summary: string;
  category: "phone" | "safety" | "family" | "daily";
  steps: TaskStep[];
}
