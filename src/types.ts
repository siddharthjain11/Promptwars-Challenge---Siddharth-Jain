export type Screen = "home" | "companion" | "reminders" | "simplify" | "tasks" | "emergency";

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
