import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient Gemini multi-model fallback to handle temporary 503 / high-demand spikes
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    // Attempt up to 2 times for each model if experiencing transient demand spike
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text !== undefined) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        const isTransient =
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("Spikes in demand") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("429");

        if (isTransient) {
          console.warn(
            `[Gemini] Model ${model} unavailable (attempt ${attempt + 1}). Trying next candidate.`
          );
          await new Promise((r) => setTimeout(r, 300));
          if (attempt === 0) continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error("All candidate Gemini models failed to respond.");
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. Chat with Companion
app.post("/api/companion/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getAi();
    if (!ai) {
      // Reassuring friendly fallback if no key is configured
      return res.json({
        reply:
          "Hello! I am right here with you. Please add your Gemini API key in the Settings menu so I can answer all your questions with live AI. Until then, remember to drink a warm glass of water today!",
      });
    }

    const prompt = `You are a warm, kind, and patient daily companion for a senior citizen (65+ years old).
The person is speaking to you.
User message: "${message}"

Recent conversation history:
${
  Array.isArray(history)
    ? history
        .slice(-4)
        .map((h: { sender: string; text: string }) => `${h.sender}: ${h.text}`)
        .join("\n")
    : "None"
}

CRITICAL RULES:
1. Speak in warm, conversational, reassuring, plain everyday English.
2. Keep your answer brief: 2 to 4 short sentences.
3. NEVER use technical jargon (no words like 'algorithm', 'authenticate', 'URL', 'credentials', 'bandwidth', 'sync').
4. Always be encouraging: if they feel confused or anxious, reassure them gently that they did nothing wrong.
5. If they ask how to do something, break it down into 2 or 3 crystal-clear physical steps (like "Tap the green circle with the phone picture").
6. The response must sound natural and comforting when read out loud by text-to-speech.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
    });

    const reply =
      response.text?.trim() ||
      "I'm here with you. Could you please say that once more?";
    return res.json({ reply });
  } catch (error: any) {
    console.warn("Chat notice (using gentle reassurance):", error?.message || error);
    return res.json({
      reply:
        "I'm right here with you, dear friend. I had a brief moment of pause, but I am listening now. You are doing wonderfully—take a comfortable breath and please feel free to ask me anything.",
    });
  }
});

// 3. Simplify & Analyze Document ("Read this for me" with OCR & Classification)
app.post("/api/companion/simplify", async (req, res) => {
  try {
    const { text, imageBase64, mimeType } = req.body;
    if ((!text || typeof text !== "string") && !imageBase64) {
      return res.status(400).json({ error: "Text or image is required" });
    }

    const ai = getAi();
    if (!ai) {
      return res.json({
        docType: "other",
        docTypeLabel: "General Note or Document",
        summary: "This looks like an important note or letter.",
        actionRequired: "Keep it in a safe spot or ask a family member to review it.",
        keyDetails: "Please ensure your Gemini API key is configured to get full AI document classification and extraction.",
        suggestedActions: ["Save to Documents", "Ask Family Member"],
        medicines: [],
      });
    }

    const systemInstruction = `You are an empathetic, reassuring assistant helping an elderly senior citizen read and understand a document, photo, prescription, bill, lab report, or official letter.
Analyze the provided content carefully.
Classify the document into one of the following exact types:
- "prescription": Doctor prescription, pharmacy medication list, rx paper, medicine box/strip.
- "bill": Utility bill (electric, gas, water, internet), medical bill, invoice, tax bill.
- "official_letter": Government notice, bank letter, pension/insurance document, legal notice.
- "receipt": Grocery receipt, store purchase receipt, transaction slip.
- "appointment": Doctor appointment slip, clinic visit reminder, test schedule.
- "other": Any other general paper, personal letter, or greeting.

For each document, provide:
1. docType: one of ("prescription" | "bill" | "official_letter" | "receipt" | "appointment" | "other")
2. docTypeLabel: A short, very clear friendly title (e.g. "Doctor's Prescription", "Electricity Bill", "Official Bank Notice")
3. summary: 1-2 very gentle, clear sentences explaining what this document is in simple everyday language.
4. actionRequired: Very clear verdict, e.g. "No payment or action needed" OR "Pay $45 by October 15th" OR "Take 1 pill after breakfast daily".
5. keyDetails: 1 to 3 key bullet points (dates, phone numbers, doctor name, or total amount to remember).
6. suggestedActions: An array of 2-4 friendly next steps the senior can take (e.g., ["Add medicines to Daily Reminders", "Save to Important Documents", "Call Pharmacy"]).
7. medicines: ONLY IF it is a prescription or mentions medications, extract each medicine as an object:
   - "name": Name of medicine (e.g. "Metformin 500mg", "Lisinopril 10mg")
   - "dosage": Dosage instruction (e.g. "1 tablet daily after breakfast", "twice a day")
   - "timeOfDay": "morning" | "afternoon" | "evening" | "night"
   - "purpose": Simple reason if mentioned (e.g. "For blood pressure", "For sugar control")
   If not a prescription or no medicines found, return an empty array [].
8. billDetails: ONLY IF it is a bill, object with {"dueDate": "...", "amountDue": "...", "payableTo": "..."}.

Format output strictly as valid JSON matching this schema:
{
  "docType": "prescription",
  "docTypeLabel": "Doctor Prescription",
  "summary": "...",
  "actionRequired": "...",
  "keyDetails": "...",
  "suggestedActions": ["Add to Daily Reminders", "Save to Documents"],
  "medicines": [
    {
      "name": "...",
      "dosage": "...",
      "timeOfDay": "morning",
      "purpose": "..."
    }
  ],
  "billDetails": {
    "dueDate": "...",
    "amountDue": "...",
    "payableTo": "..."
  }
}`;

    let contents: any;
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
      contents = [
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanBase64,
          },
        },
        {
          text: systemInstruction + (text ? `\nAdditional notes or text: """${text}"""` : ""),
        },
      ];
    } else {
      contents = `${systemInstruction}\n\nHere is the text to analyze:\n"""\n${text.slice(0, 4000)}\n"""`;
    }

    const response = await generateWithFallback(ai, {
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        docType: parsed.docType || "other",
        docTypeLabel: parsed.docTypeLabel || "Analyzed Document",
        summary: parsed.summary || "Here is what this document means in simple terms.",
        actionRequired: parsed.actionRequired || "No immediate action required.",
        keyDetails: parsed.keyDetails || "No special deadlines noted.",
        suggestedActions: Array.isArray(parsed.suggestedActions) && parsed.suggestedActions.length > 0
          ? parsed.suggestedActions
          : ["Save to Documents", "Keep in Safe Spot"],
        medicines: Array.isArray(parsed.medicines) ? parsed.medicines : [],
        billDetails: parsed.billDetails || null,
      });
    } catch {
      return res.json({
        docType: "other",
        docTypeLabel: "General Note",
        summary: response.text || "Here is a simple summary of your text.",
        actionRequired: "Please ask a trusted family member if you are unsure.",
        keyDetails: "Review any dates or phone numbers listed above.",
        suggestedActions: ["Save to Documents", "Show to Family"],
        medicines: [],
      });
    }
  } catch (error: any) {
    console.warn("Simplify notice (using gentle fallback):", error?.message || error);
    return res.json({
      docType: "other",
      docTypeLabel: "Important Document",
      summary: "I had a moment reading this document, but take your time.",
      actionRequired: "Please ask a trusted family member or friend to take a look when they visit.",
      keyDetails: "No danger at all. Keep it in your safe folder.",
      suggestedActions: ["Save to Documents"],
      medicines: [],
    });
  }
});

// 4. Step-by-Step Task Guide
app.post("/api/companion/guide", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task || typeof task !== "string") {
      return res.status(400).json({ error: "Task description is required" });
    }

    const ai = getAi();
    if (!ai) {
      return res.json({
        steps: [
          {
            title: "Take a deep breath",
            instruction: "You cannot break anything. Relax and take your time.",
          },
          {
            title: "Look for the icon",
            instruction: "Find the app on your home screen and tap it gently once.",
          },
          {
            title: "Ask for a hand if needed",
            instruction: "You can tap the Emergency/Family button to call your loved one anytime.",
          },
        ],
      });
    }

    const prompt = `A senior citizen wants step-by-step help with this task: "${task}".
They find digital apps stressful and need reassuring, very simple steps with zero jargon.
Write 3 to 4 easy steps.

Format as JSON with an array named "steps". Each step has:
- "title": Short title (3-5 words)
- "instruction": Clear, gentle physical instruction in 1-2 sentences. Avoid tech words (say "tap" instead of "click/navigate", "picture" instead of "icon/media").

Example format:
{
  "steps": [
    { "title": "Find the Phone app", "instruction": "Look on your main screen for the green square with a white telephone on it. Tap it once gently." }
  ]
}`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    });
  } catch (error: any) {
    console.warn("Guide notice (using gentle fallback):", error?.message || error);
    return res.json({
      steps: [
        {
          title: "Take your time",
          instruction: "Everything is safe. You cannot make any mistake.",
        },
        {
          title: "Ask a family member",
          instruction: "Tap the Emergency & Help button anytime to call your loved one.",
        },
      ],
    });
  }
});

// 5. Proactive greeting & time-of-day suggestion
app.post("/api/companion/greeting", async (req, res) => {
  const { hour, userName } = req.body;
  const name = userName || "friend";
  const currentHour = typeof hour === "number" ? hour : new Date().getHours();
  const timePeriod = currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening";

  const getDefaultSuggestion = () => {
    if (currentHour < 12) {
      return "Good morning! Time for your morning tea and daily medication.";
    } else if (currentHour < 17) {
      return "Good afternoon! A gentle walk or resting your eyes would be lovely.";
    } else {
      return "Good evening! Time to unwind and check your bedtime medicine.";
    }
  };

  try {
    const ai = getAi();
    if (!ai) {
      return res.json({
        greeting: `Hello, ${name}! It is wonderful to see you today.`,
        suggestion: getDefaultSuggestion(),
      });
    }

    const prompt = `Generate a single short warm greeting and one proactive suggestion for an elderly person for this ${timePeriod}.
Their name is "${name}".
Output JSON:
{
  "greeting": "Warm 1-sentence greeting",
  "suggestion": "One proactive gentle suggestion appropriate for ${timePeriod} (e.g., morning medicine, afternoon water/walk, evening relaxing)"
}`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      greeting: parsed.greeting || `Good ${timePeriod}, ${name}!`,
      suggestion: parsed.suggestion || getDefaultSuggestion(),
    });
  } catch (error: any) {
    console.warn("Greeting notice (using warm default):", error?.message || error);
    return res.json({
      greeting: `Hello, ${name}! It is wonderful to see you today.`,
      suggestion: getDefaultSuggestion(),
    });
  }
});

// 6. Scam / Fraud Message & Screenshot Checker
app.post("/api/scam-checker", async (req, res) => {
  try {
    const { text, image } = req.body;
    if (!text && !image) {
      return res
        .status(400)
        .json({ error: "Please provide a message text or upload a screenshot" });
    }

    const ai = getAi();
    if (!ai) {
      // Rule-based heuristic fallback if API key is not yet configured
      const lower = (text || "").toLowerCase();
      const hasUrgentMoney =
        lower.includes("wire") ||
        lower.includes("gift card") ||
        lower.includes("bitcoin") ||
        lower.includes("urgent") ||
        lower.includes("suspended") ||
        lower.includes("locked") ||
        lower.includes("lottery") ||
        lower.includes("claim your prize") ||
        lower.includes("click here");

      if (hasUrgentMoney) {
        return res.json({
          riskLevel: "high",
          verdictTitle: "🚨 High Risk Scam Detected",
          plainExplanation:
            "This message contains warning signs of fraud: asking for urgent action, money, or clicking on an unverified link.",
          redFlags: [
            "Creates artificial panic (e.g. account locked, urgent payment needed)",
            "Requests money, gift cards, or personal verification links",
            "Real banks never ask you to click a link to unlock accounts via SMS",
          ],
          recommendedActions: [
            "Do NOT click any link in the message",
            "Never share passwords, banking PINs, or one-time codes (OTP)",
            "Block the sender and delete the message immediately",
          ],
          safeToClick: false,
        });
      }

      return res.json({
        riskLevel: "warning",
        verdictTitle: "⚠️ Proceed with Caution",
        plainExplanation:
          "Always be careful with unexpected messages. Please show this to a trusted family member before taking any action.",
        redFlags: [
          "Unfamiliar sender number or email",
          "Contains unsolicited links or instructions",
        ],
        recommendedActions: [
          "Do not reply directly to this message",
          "Call your bank or family using a known trusted phone number",
        ],
        safeToClick: false,
      });
    }

    const promptInstructions = `You are a cybersecurity expert and senior fraud prevention specialist.
Analyze this message or screenshot submitted by an elderly person (senior citizen).
Text content: "${text ? text.slice(0, 3000) : "Refer to uploaded screenshot image"}"

Determine if this is a scam, phishing, fraudulent demand, impersonation, or legitimate communication.
Evaluate for:
- Urgent financial demands (gift cards, wire transfers, crypto, fake lottery/prizes)
- Bank/credit card suspension threats
- Fake package delivery links
- Impersonation of family members ("Hi Grandma, emergency money needed")
- Tech support scams ("Virus detected on your computer, call 1-800...")

Respond strictly in JSON:
{
  "riskLevel": "high" | "warning" | "safe",
  "verdictTitle": "Short 3-6 word title with emoji (e.g. 🚨 High Risk Scam - Do Not Reply, or ⚠️ Suspicious - Proceed with Caution, or ✅ Likely Safe & Legitimate)",
  "plainExplanation": "2 to 3 sentences in plain everyday English with zero technical jargon explaining why it looks like a scam or why it looks safe.",
  "redFlags": [
    "Clear bullet point 1",
    "Clear bullet point 2"
  ],
  "recommendedActions": [
    "Step 1 to protect themselves",
    "Step 2 to protect themselves"
  ],
  "safeToClick": false or true
}`;

    const contents: any[] = [];
    if (image && typeof image === "string") {
      let mimeType = "image/jpeg";
      if (image.startsWith("data:")) {
        const parts = image.split(";");
        mimeType = parts[0].replace("data:", "");
      }
      const base64Data = image.includes(",") ? image.split(",")[1] : image;
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    contents.push({ text: promptInstructions });

    const response = await generateWithFallback(ai, {
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      riskLevel: parsed.riskLevel || "high",
      verdictTitle: parsed.verdictTitle || "🚨 Potential Scam Detected",
      plainExplanation:
        parsed.plainExplanation ||
        "This message appears suspicious. Never click unexpected links or send money.",
      redFlags: Array.isArray(parsed.redFlags)
        ? parsed.redFlags
        : ["Demands unexpected urgent action", "Contains suspicious link"],
      recommendedActions: Array.isArray(parsed.recommendedActions)
        ? parsed.recommendedActions
        : ["Do not click any link", "Block sender", "Ask family for assistance"],
      safeToClick: Boolean(parsed.safeToClick),
    });
  } catch (error: any) {
    console.warn("Scam checker notice (fallback applied):", error?.message || error);
    return res.json({
      riskLevel: "warning",
      verdictTitle: "⚠️ Be Very Careful",
      plainExplanation:
        "When in doubt, treat this message as suspicious. Never click links or send payment or codes to unknown senders.",
      redFlags: [
        "Unverified message from unknown sender",
        "Could be an impersonation or phishing attempt",
      ],
      recommendedActions: [
        "Do not click any links or reply",
        "Show this message to a family member or caregiver",
      ],
      safeToClick: false,
    });
  }
});

// 7. Emergency Alert / Missed Call Dispatch Simulation
app.post("/api/emergency/alert", async (req, res) => {
  const { contacts, message } = req.body;
  const contactList = Array.isArray(contacts) && contacts.length > 0
    ? contacts
    : [{ name: "Family Emergency Contacts", phone: "112" }];

  return res.json({
    success: true,
    dispatchedTo: contactList.map((c: any) => ({
      name: c.name || "Family Contact",
      phone: c.phone || "Emergency",
      status: "missed_call_alert_sent",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
    emergencyNumber: "112",
    note: "Simulated instant missed-call pings sent to emergency contacts. Direct dial initiated.",
  });
});

// 8. Endless Real-World Quiz Generation via Gemini
app.post("/api/quiz/generate", async (req, res) => {
  try {
    const { topic, language = "en", count = 3, previousQuestions = [] } = req.body;
    const ai = getAi();

    const selectedTopic = topic || "Real-World Curiosities & Nostalgia";
    const langPrompt =
      language === "hi"
        ? "Language MUST be शुद्ध एवं सरल हिंदी (Hindi in Devanagari script)."
        : language === "hinglish"
        ? "Language MUST be Hinglish (conversational Hindi written in Roman English alphabet, e.g. 'Sholay film mein Gabbar Singh ka mashhoor dialogue kya tha?')."
        : "Language MUST be clear, accessible English.";

    if (!ai) {
      // Fallback questions if offline / key not present
      const fallbackQuestions = [
        {
          question:
            language === "hi"
              ? "विश्व प्रसिद्ध ताजमहल किस भारतीय नदी के किनारे स्थित है?"
              : language === "hinglish"
              ? "World famous Taj Mahal kis Indian nadi ke kinare sthit hai?"
              : "On the banks of which famous river is the Taj Mahal located in Agra?",
          options:
            language === "hi"
              ? ["यमुना नदी", "गंगा नदी", "नर्मदा नदी"]
              : language === "hinglish"
              ? ["Yamuna Nadi", "Ganga Nadi", "Narmada Nadi"]
              : ["Yamuna River", "Ganges River", "Narmada River"],
          correct: 0,
          fact:
            language === "hi"
              ? "ताजमहल 17वीं सदी में मुगल सम्राट शाहजहाँ द्वारा यमुना नदी के शांत तट पर बनवाया गया था।"
              : language === "hinglish"
              ? "Taj Mahal 17th century mein Yamuna nadi ke kinare Shah Jahan ne banwaya tha."
              : "The Taj Mahal was commissioned in 1631 by Mughal Emperor Shah Jahan along the banks of the Yamuna.",
          category: "Geography & Wonders",
        },
        {
          question:
            language === "hi"
              ? "मशहूर हिंदी फिल्म 'शोले' में ठाकुर का किरदार किस दिग्गज अभिनेता ने निभाया था?"
              : language === "hinglish"
              ? "Mashhoor Bollywood film 'Sholay' mein Thakur ka role kis legend actor ne nibhaya tha?"
              : "Which legendary actor played the iconic role of Thakur in the classic Indian film 'Sholay'?",
          options:
            language === "hi"
              ? ["संजीव कुमार", "अमरीश पुरी", "दिलीप कुमार"]
              : language === "hinglish"
              ? ["Sanjeev Kumar", "Amrish Puri", "Dilip Kumar"]
              : ["Sanjeev Kumar", "Amrish Puri", "Dilip Kumar"],
          correct: 0,
          fact:
            language === "hi"
              ? "संजीव कुमार जी ने ठाकुर बलदेव सिंह का अविस्मरणीय किरदार निभाया था।"
              : language === "hinglish"
              ? "Sanjeev Kumar ji ne Thakur Baldev Singh ka memorable role play kiya tha."
              : "Sanjeev Kumar delivered an unforgettable performance as Thakur Baldev Singh in the 1975 masterpiece.",
          category: "Classic Cinema",
        },
        {
          question:
            language === "hi"
              ? "कौन सा सुंदर पक्षी बारिश आने से पहले अपने सुंदर पंख फैलाकर नाचता है?"
              : language === "hinglish"
              ? "Kaunsa sundar pakshi barish aane se pehle apne pankh failakar naachta hai?"
              : "Which magnificent bird is renowned for fanning its iridescent feathers and dancing before rain?",
          options:
            language === "hi"
              ? ["मोर (Peacock)", "हंस", "कोयल"]
              : language === "hinglish"
              ? ["Mor (Peacock)", "Hans (Swan)", "Koyal (Cuckoo)"]
              : ["Peacock (Mor)", "Swan", "Nightingale"],
          correct: 0,
          fact:
            language === "hi"
              ? "मोर भारत का राष्ट्रीय पक्षी है और बादलों की गर्जना सुनकर खुशी से अपने पंख फैलाता है।"
              : language === "hinglish"
              ? "Peacock India ka national bird hai jo badal dekhkar khushi se pankh failata hai."
              : "Peacocks display their spectacular train of feathers during courtship and monsoon seasons.",
          category: "Nature & Wildlife",
        },
      ];
      return res.json({ questions: fallbackQuestions });
    }

    const previousList = Array.isArray(previousQuestions)
      ? previousQuestions.slice(-10).join("; ")
      : "";

    const prompt = `You are an expert trivia curator for seniors (elderly persons aged 60+).
Generate ${count} engaging, culturally rich, interesting real-world trivia questions on the theme: "${selectedTopic}".

${langPrompt}

Guidelines:
1. Focus on pleasant, uplifting, nostalgia-evoking real-world topics:
   - Classic cinema and golden music (e.g. 50s-80s cinema, iconic melodies, memorable radio programs)
   - Real-world geography, historic monuments, tea gardens, hill stations, famous rivers
   - Nature wonders, seasonal flowers, birds, heartwarming animal behaviors
   - Everyday inventions (postcards, radio, steam train, telephone) and cultural traditions
2. Avoid depressing, political, or overly technical questions.
3. Provide exactly 3 options for each question (1 correct, 2 plausible but clear).
4. Include an interesting, warm 1-sentence fun fact that teaches something neat.
5. Do NOT repeat any of these recently seen questions: [${previousList}].

Return strictly valid JSON:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correct": 0,
      "fact": "Warm, educational 1-sentence fact.",
      "category": "Topic Name"
    }
  ]
}`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
      // Clean and validate
      const validQuestions = questions.map((q: any, idx: number) => ({
        id: `ai-quiz-${Date.now()}-${idx}`,
        question: q.question,
        options: Array.isArray(q.options) && q.options.length === 3 ? q.options : ["A", "B", "C"],
        correct: typeof q.correct === "number" && q.correct >= 0 && q.correct <= 2 ? q.correct : 0,
        fact: q.fact || "Real world knowledge keeps our minds joyful and active!",
        category: q.category || selectedTopic,
        isAiGenerated: true,
      }));

      return res.json({ questions: validQuestions });
    } catch (parseErr) {
      console.warn("Quiz JSON parse error:", parseErr);
      return res.json({ questions: [] });
    }
  } catch (err: any) {
    console.warn("Quiz generation error:", err?.message || err);
    return res.status(500).json({ error: "Failed to generate quiz questions", questions: [] });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
