import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// 3. Simplify Text ("Read this for me")
app.post("/api/companion/simplify", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getAi();
    if (!ai) {
      return res.json({
        summary: "This looks like an important note or letter.",
        actionRequired: "Keep it in a safe spot or ask a family member to review it.",
        keyDetails: "Please add your Gemini API key in Settings to get full text simplification.",
      });
    }

    const prompt = `A senior citizen is looking at a confusing letter, bill, message, or medical notice and wants you to explain it simply.
Here is the text:
"""
${text.slice(0, 3000)}
"""

Please read it carefully and explain it in 3 clear sections using very simple words:
1. WHAT THIS IS ABOUT: One or two short, gentle sentences explaining what this document is.
2. DO YOU NEED TO DO ANYTHING?: Clearly say "No action needed" OR "Yes, please call..." in plain terms.
3. IMPORTANT DETAILS: Any specific date, dollar amount, or phone number they should know (keep it to 1-2 bullet points).

Return your response in clean JSON format:
{
  "summary": "...",
  "actionRequired": "...",
  "keyDetails": "..."
}`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        summary: parsed.summary || "Here is what this message means in simple terms.",
        actionRequired: parsed.actionRequired || "No immediate action required.",
        keyDetails: parsed.keyDetails || "No special deadlines noted.",
      });
    } catch {
      return res.json({
        summary: response.text || "Here is a simple summary of your text.",
        actionRequired: "Please ask a trusted family member if you are unsure.",
        keyDetails: "Review any dates or phone numbers listed above.",
      });
    }
  } catch (error: any) {
    console.warn("Simplify notice (using gentle fallback):", error?.message || error);
    return res.json({
      summary: "I had a moment reading this document, but take your time.",
      actionRequired: "Please ask a trusted family member or friend to take a look when they visit.",
      keyDetails: "No danger at all. Keep it in your safe folder.",
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
