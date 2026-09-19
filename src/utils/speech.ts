// Reassuring speech synthesis utility for seniors with bulletproof browser compatibility
import { AppLanguage } from "../types";

export type SpeechListener = (isSpeaking: boolean, text?: string) => void;

export interface SpeechOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
  rate?: number;
  lang?: AppLanguage;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = false;
  private currentLanguage: AppLanguage = "en";
  private listeners: Set<SpeechListener> = new Set();
  private keepAliveTimer: any = null;
  private cancelTimeout: any = null;
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private currentlySpeaking: boolean = false;
  private currentText: string = "";
  private audioDescEnabled: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;

      // Keep window-level reference to prevent garbage collection in Chromium
      (window as any).__activeSpeechUtterances = this.activeUtterances;

      // Ensure voices are loaded
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          // Voices refreshed
        };
      }
      try {
        window.speechSynthesis.addEventListener("voiceschanged", () => {
          // Voices loaded event
        });
      } catch {
        // Fallback for older browsers
      }
    }

    if (typeof window !== "undefined") {
      try {
        const savedDesc = localStorage.getItem("senior_companion_audio_desc");
        if (savedDesc !== null) {
          this.audioDescEnabled = savedDesc === "true";
        }
        const savedLang = localStorage.getItem("senior_companion_language");
        if (savedLang) {
          this.currentLanguage = savedLang as AppLanguage;
        }
      } catch {
        // Fallback
      }
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    // Initial call
    listener(this.currentlySpeaking, this.currentText);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(isSpeaking: boolean, text?: string) {
    this.currentlySpeaking = isSpeaking;
    this.currentText = isSpeaking ? (text || this.currentText) : "";
    this.listeners.forEach((listener) => {
      try {
        listener(isSpeaking, this.currentText);
      } catch (err) {
        console.warn("Speech listener error:", err);
      }
    });
  }

  public setLanguage(lang: AppLanguage) {
    this.currentLanguage = lang;
  }

  public getLanguage(): AppLanguage {
    return this.currentLanguage;
  }

  public setAudioDescEnabled(enabled: boolean) {
    this.audioDescEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public isAudioDesc(): boolean {
    return this.audioDescEnabled;
  }

  /**
   * Speaks ONLY if Audio Description is enabled.
   * If Audio Description is OFF, this does nothing.
   */
  public speakDescription(text: string, options: SpeechOptions = {}) {
    if (!this.audioDescEnabled) {
      return;
    }
    this.speak(text, options);
  }

  private getBestVoiceForLanguage(lang: AppLanguage): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === "hi") {
      return (
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("hi") ||
            v.name.toLowerCase().includes("hindi")
        ) ||
        voices.find((v) => v.lang.toLowerCase().includes("-in") && !v.lang.toLowerCase().startsWith("en")) ||
        null
      );
    } else if (lang === "hinglish") {
      return (
        voices.find(
          (v) =>
            v.lang.toLowerCase() === "en-in" ||
            v.lang.toLowerCase().startsWith("en_in") ||
            v.name.toLowerCase().includes("india")
        ) ||
        voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ||
        null
      );
    } else {
      // Natural English voice
      return (
        voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Daniel") ||
              v.name.includes("Karen") ||
              v.name.includes("Serena"))
        ) ||
        voices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
        voices[0] ||
        null
      );
    }
  }

  public speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
      rate?: number;
      lang?: AppLanguage;
    }
  ) {
    if (!this.synth || !this.isSupported) {
      options?.onError?.();
      return;
    }

    const cleanText = text.replace(/[*_#`~]/g, "").trim();
    if (!cleanText) {
      options?.onError?.();
      return;
    }

    // Stop existing speech and clear timers
    this.stopInternal(false);

    // Chrome bug fix: cancel() is asynchronous in Chromium.
    // Starting a new utterance in the exact same event tick causes Chrome to immediately cancel it.
    // A 35ms deferral prevents the cancellation race condition.
    this.cancelTimeout = setTimeout(() => {
      if (!this.synth) return;

      // Chrome paused state recovery
      if (this.synth.paused) {
        try {
          this.synth.resume();
        } catch {
          // ignore
        }
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options?.rate || 0.88; // Gentle, clear pace for seniors
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const targetLang = options?.lang || this.currentLanguage;
      if (targetLang === "hi") {
        utterance.lang = "hi-IN";
      } else if (targetLang === "hinglish") {
        utterance.lang = "en-IN";
      } else {
        utterance.lang = "en-US";
      }

      const matchingVoice = this.getBestVoiceForLanguage(targetLang);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      // Utterance Garbage Collection protection
      this.activeUtterances.add(utterance);
      this.currentUtterance = utterance;

      utterance.onstart = () => {
        this.notifyListeners(true, cleanText);
        options?.onStart?.();

        // Chromium Keep-Alive bug workaround:
        // Chromium pauses or cancels speech synthesis utterances longer than 15 seconds.
        // Pinging pause/resume every 8 seconds keeps long speech alive.
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = setInterval(() => {
          if (!this.synth || !this.synth.speaking) {
            if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
          } else {
            try {
              this.synth.pause();
              this.synth.resume();
            } catch {
              // ignore
            }
          }
        }, 7500);
      };

      utterance.onend = () => {
        this.cleanupUtterance(utterance);
        this.notifyListeners(false);
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        // "canceled" and "interrupted" are normal when user taps Stop
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis error:", e);
        }
        this.cleanupUtterance(utterance);
        this.notifyListeners(false);
        options?.onError?.();
      };

      try {
        this.synth.speak(utterance);
      } catch (err) {
        console.warn("Speech speak error:", err);
        this.cleanupUtterance(utterance);
        this.notifyListeners(false);
        options?.onError?.();
      }
    }, 35);
  }

  private cleanupUtterance(utterance: SpeechSynthesisUtterance) {
    this.activeUtterances.delete(utterance);
    if (this.currentUtterance === utterance) {
      this.currentUtterance = null;
    }
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private stopInternal(notify: boolean = true) {
    if (this.cancelTimeout) {
      clearTimeout(this.cancelTimeout);
      this.cancelTimeout = null;
    }
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (this.synth) {
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.cancel();
      } catch (e) {
        console.warn("Error stopping speech:", e);
      }
    }
    this.activeUtterances.clear();
    this.currentUtterance = null;
    if (notify) {
      this.notifyListeners(false);
    }
  }

  public stop() {
    this.stopInternal(true);
  }

  // Toggles speech: if already speaking, stops and returns false. If not, speaks and returns true.
  public toggle(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
      rate?: number;
      lang?: AppLanguage;
    }
  ): boolean {
    if (this.isSpeaking()) {
      this.stop();
      return false;
    } else {
      this.speak(text, options);
      return true;
    }
  }

  public isSpeaking(): boolean {
    return this.currentlySpeaking || (this.synth ? this.synth.speaking : false);
  }

  // Gentle reassuring sound effect using Web Audio API with automatic suspended state resume
  public playChime(type: "success" | "gentle" | "alert" = "gentle") {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Resume context if browser suspended it before user interaction
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "success") {
        // Warm two-note major chord
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "alert") {
        // Reassuring attention chime
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.0, now + 0.1); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // Gentle soft confirmation tone
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext blocked by policy
    }
  }
}

export const speech = new SpeechService();
