import { PrebuiltGuide, FamilyContact, Reminder } from "../types";

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: "rem-1",
    title: "Morning blood pressure & heart medicine",
    medicineName: "Lisinopril 10mg (with water)",
    timeOfDay: "morning",
    timeStr: "8:00 AM",
    completed: false,
    isMedicine: true,
  },
  {
    id: "rem-2",
    title: "Go for a walk outside in the fresh air",
    notes: "15 to 20 minutes gentle stroll around the garden or block",
    timeOfDay: "morning",
    timeStr: "9:30 AM",
    completed: false,
    isMedicine: false,
  },
  {
    id: "rem-3",
    title: "Drink a tall glass of fresh water",
    timeOfDay: "morning",
    timeStr: "10:30 AM",
    completed: false,
    isMedicine: false,
  },
  {
    id: "rem-4",
    title: "Gentle workout & stretching time",
    notes: "Light chair stretches or arm lifts to stay flexible",
    timeOfDay: "afternoon",
    timeStr: "11:30 AM",
    completed: false,
    isMedicine: false,
  },
  {
    id: "rem-5",
    title: "Lunch & afternoon vitamins",
    medicineName: "Vitamin D3 & Calcium",
    timeOfDay: "afternoon",
    timeStr: "1:00 PM",
    completed: false,
    isMedicine: true,
  },
  {
    id: "rem-6",
    title: "Afternoon telephone chat with family",
    timeOfDay: "afternoon",
    timeStr: "3:30 PM",
    completed: false,
    isMedicine: false,
  },
  {
    id: "rem-7",
    title: "Evening dinner medicine",
    medicineName: "Metformin 500mg (take with food)",
    timeOfDay: "evening",
    timeStr: "7:00 PM",
    completed: false,
    isMedicine: true,
  },
];

export const INITIAL_CONTACTS: FamilyContact[] = [
  {
    id: "c-1",
    name: "Sarah (Daughter)",
    relation: "Daughter",
    phone: "555-0192",
    avatarColor: "bg-amber-600",
    isPrimary: true,
  },
  {
    id: "c-2",
    name: "Michael (Son)",
    relation: "Son",
    phone: "555-0144",
    avatarColor: "bg-emerald-700",
  },
  {
    id: "c-3",
    name: "Dr. Henderson (Clinic)",
    relation: "Family Doctor",
    phone: "555-0188",
    avatarColor: "bg-sky-700",
  },
  {
    id: "c-4",
    name: "24/7 Nurse Advice Line",
    relation: "Medical Help",
    phone: "1-800-555-0199",
    avatarColor: "bg-rose-700",
  },
];

export const PREBUILT_GUIDES: PrebuiltGuide[] = [
  {
    id: "whatsapp-photo",
    title: "How to Attach and Send a Photo in WhatsApp",
    summary: "Clear 3-step guide on sending pictures to family and grandchildren on WhatsApp.",
    category: "phone",
    steps: [
      {
        title: "Step 1: Open Your Family Chat in WhatsApp",
        instruction:
          "Open WhatsApp (the green icon with a phone inside a bubble). Tap the conversation with your daughter, son, or grandchild.",
      },
      {
        title: "Step 2: Tap the Little Paperclip or Camera Icon",
        instruction:
          "Look at the bottom of the chat next to where you type. Tap the paperclip icon (📎) or camera icon (📷), then tap 'Gallery' or 'Photos'.",
      },
      {
        title: "Step 3: Tap Your Picture and the Green Send Arrow",
        instruction:
          "Tap the photo you want to share, then tap the round green button with the white paper airplane arrow at the bottom right. That's it!",
      },
    ],
  },
  {
    id: "video-call",
    title: "How to Video Call Family (Grandchildren)",
    summary: "Simple 3-step guide to seeing and talking to your family on your phone or tablet.",
    category: "family",
    steps: [
      {
        title: "Step 1: Open the Green Phone or Messages App",
        instruction:
          "Look on your phone screen for the green icon with a white telephone, or WhatsApp / FaceTime. Tap it gently with one finger.",
      },
      {
        title: "Step 2: Find Your Family Member's Name",
        instruction:
          "Scroll gently with your finger until you see your daughter, son, or grandchild's name and photo. Tap their name once.",
      },
      {
        title: "Step 3: Tap the Little Video Camera Icon",
        instruction:
          "Look at the top right of the screen for an icon that looks like a movie camera. Tap it once. Your screen will ring and show your face!",
      },
    ],
  },
  {
    id: "send-photo",
    title: "How to Take and Send a Picture",
    summary: "Share a snapshot of your garden, pet, or smile with your family.",
    category: "phone",
    steps: [
      {
        title: "Step 1: Open the Camera",
        instruction:
          "Find the icon that looks like a real camera lens on your home screen. Tap it once to open your camera.",
      },
      {
        title: "Step 2: Hold Still and Tap the Big White Circle",
        instruction:
          "Point your phone at what you want to photograph. Hold steady, then press the large round white button at the bottom of the screen.",
      },
      {
        title: "Step 3: Tap the Little Share Arrow",
        instruction:
          "Look for a small square with an arrow pointing up (or three connected dots). Tap it, select your family member's photo, and tap 'Send'!",
      },
    ],
  },
  {
    id: "spot-scam",
    title: "How to Spot a Fake Message or Scam",
    summary: "Reassuring rules to protect your peace of mind and never get tricked.",
    category: "safety",
    steps: [
      {
        title: "Step 1: Remember: Real Banks Never Urge You to Panic",
        instruction:
          "If a message says 'Account suspended!' or 'Urgent! Click here to pay immediately!', pause and take a deep breath. Scammers want you to rush. You are safe.",
      },
      {
        title: "Step 2: Never Tap Blue Links from Unknown Numbers",
        instruction:
          "Do not tap any links or buttons inside text messages from numbers you do not recognize.",
      },
      {
        title: "Step 3: Call Your Family or Bank Directly to Check",
        instruction:
          "Close the message. Use your regular phone to call your daughter, son, or the official number printed on the back of your credit card.",
      },
    ],
  },
  {
    id: "bigger-text",
    title: "How to Make Text Bigger on Your Phone",
    summary: "Make words on your phone or tablet easier to read without squinting.",
    category: "phone",
    steps: [
      {
        title: "Step 1: Open the 'Settings' Gear",
        instruction:
          "Find the icon that looks like a gray gear on your home screen. Tap it once.",
      },
      {
        title: "Step 2: Tap 'Display & Brightness'",
        instruction:
          "Scroll down gently until you see 'Display' or 'Display & Brightness' with a sunshine icon. Tap it.",
      },
      {
        title: "Step 3: Move the Text Size Slider to the Right",
        instruction:
          "Tap 'Text Size'. Slide the little round circle to the right until the words look big and clear to your eyes. That is all!",
      },
    ],
  },
];
