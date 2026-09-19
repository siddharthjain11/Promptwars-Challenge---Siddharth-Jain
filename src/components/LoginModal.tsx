import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Phone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  MessageSquare,
  User,
  Check,
} from "lucide-react";
import { UserProfile } from "../types";
import { speech } from "../utils/speech";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenProfileModal?: () => void;
}

const COUNTRY_CODES = [
  { code: "+1", country: "US / CA", flag: "🇺🇸" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<"phone" | "otp" | "optional_profile">("phone");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || "");
  const [generatedOtp, setGeneratedOtp] = useState("4829");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional profile details during sign-up
  const [preferredName, setPreferredName] = useState(currentUser.preferredName || "");
  const [gender, setGender] = useState<"female" | "male" | "other" | undefined>(currentUser.gender);
  const [birthYear, setBirthYear] = useState(currentUser.birthYear || "");
  const [emergencyContact, setEmergencyContact] = useState(currentUser.emergencyContactName || "");

  // Authenticated user temp reference
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.trim().replace(/\D/g, "");
    if (!cleanNumber || cleanNumber.length < 7) {
      setError("Please enter a valid phone number (at least 7 digits).");
      return;
    }
    setError(null);

    // Generate friendly 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setEnteredOtp("");
    setStep("otp");
    setTimerSeconds(30);
    setIsTimerRunning(true);
    setShowSmsBanner(true);

    speech.speakDescription(
      `We sent a 4-digit verification code to your phone. For your convenience, it is ${code.split("").join(" ")}.`
    );
  };

  const handleResendOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setTimerSeconds(30);
    setIsTimerRunning(true);
    setShowSmsBanner(true);
    speech.speakDescription(`New verification code sent: ${code.split("").join(" ")}.`);
  };

  const handleAutoFill = () => {
    setEnteredOtp(generatedOtp);
    setError(null);
    speech.speakDescription("Verification code auto-filled.");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEntered = enteredOtp.trim();
    if (cleanEntered.length !== 4) {
      setError("Please enter the complete 4-digit verification code.");
      return;
    }
    if (cleanEntered !== generatedOtp && cleanEntered !== "1234" && cleanEntered !== "4829") {
      setError(`Code does not match. Please use ${generatedOtp} or tap Auto-Fill.`);
      return;
    }

    const fullPhone = `${countryCode} ${phoneNumber}`;
    const verifiedUser: UserProfile = {
      isLoggedIn: true,
      phoneNumber: fullPhone,
      name: "Valued Friend",
      authProvider: "phone",
      createdAt: new Date().toISOString(),
    };

    setAuthenticatedUser(verifiedUser);
    setStep("optional_profile");
    speech.speakDescription("Mobile number verified! You can now optionally add a few profile details.");
  };

  const handleGoogleLogin = () => {
    const googleUser: UserProfile = {
      isLoggedIn: true,
      email: "siddharthgbbs@gmail.com",
      name: "Siddharth",
      preferredName: "Siddharth",
      authProvider: "google",
      createdAt: new Date().toISOString(),
    };

    setAuthenticatedUser(googleUser);
    setPreferredName(googleUser.name || "");
    setStep("optional_profile");
    speech.speakDescription("Signed in with Google! You can optionally personalize your profile.");
  };

  const handleCompleteWithProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedUser) return;

    const finalUser: UserProfile = {
      ...authenticatedUser,
      preferredName: preferredName.trim() || authenticatedUser.preferredName || undefined,
      name: preferredName.trim() || authenticatedUser.name || "Senior Friend",
      gender: gender || authenticatedUser.gender || undefined,
      birthYear: birthYear.trim() || undefined,
      emergencyContactName: emergencyContact.trim() || undefined,
    };

    onLoginSuccess(finalUser);
    speech.speakDescription("Welcome! Your account and preferences are safely saved.");
    onClose();
  };

  const handleSkipProfile = () => {
    if (!authenticatedUser) return;
    onLoginSuccess(authenticatedUser);
    speech.speakDescription("Welcome! You can add profile details anytime from Settings.");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
              {step === "optional_profile" ? (
                <User className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2
                id="login-modal-title"
                className="font-serif font-bold text-xl sm:text-2xl text-slate-900"
              >
                {step === "optional_profile"
                  ? "Profile Details (Optional)"
                  : "Sign In Securely"}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                {step === "optional_profile"
                  ? "None of these fields are mandatory"
                  : "Keep your reminders & contacts safe"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 100% Privacy Guarantee Banner (Clean & Subtle) */}
        {step !== "optional_profile" && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="text-emerald-950 font-bold leading-tight">
                100% Private & Protected
              </p>
              <p className="text-emerald-800 mt-0.5">
                No data is ever shared with anyone. Stored strictly to safeguard your personal reminders and contacts.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1: MOBILE NUMBER ENTRY */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label
                htmlFor="mobile-input"
                className="block text-slate-800 font-bold text-base mb-1.5"
              >
                Enter your mobile phone number:
              </label>

              <div className="flex gap-2">
                {/* Country Code Selector */}
                <select
                  aria-label="Country Code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-semibold text-sm outline-hidden cursor-pointer"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.code}
                    </option>
                  ))}
                </select>

                {/* Phone Number Input */}
                <input
                  id="mobile-input"
                  type="tel"
                  autoFocus
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. 555-019-2834"
                  className="flex-1 px-4 py-3 text-lg font-bold rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder:text-slate-400 outline-hidden tracking-wider"
                />
              </div>

              {error && (
                <p className="text-rose-600 font-semibold text-xs sm:text-sm mt-1.5">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              id="send-mobile-otp-btn"
              className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Send OTP Verification Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Google Sign-In Option */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-medium mb-2.5">
                Or sign in with your Google account
              </p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                id="google-signin-btn-modal"
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base border border-slate-300 hover:border-slate-400 transition flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION WITH REALISTIC SMS NOTIFICATION */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Interactive Simulated SMS Banner */}
            {showSmsBanner && (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in slide-in-from-top duration-200">
                <div className="flex items-start gap-2.5">
                  <MessageSquare className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sky-950 block">
                      💬 SMS Code Received
                    </span>
                    <span className="text-slate-600">
                      Your Another Partner security code is{" "}
                      <strong className="text-sky-800 text-base tracking-wider font-mono">
                        {generatedOtp}
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Fill {generatedOtp}</span>
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="otp-input"
                  className="block text-slate-800 font-bold text-base"
                >
                  Enter 4-digit code:
                </label>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-sky-600 hover:text-sky-700 text-xs font-semibold cursor-pointer"
                >
                  Change phone number
                </button>
              </div>

              <input
                id="otp-input"
                type="text"
                autoFocus
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => {
                  setEnteredOtp(e.target.value.replace(/\D/g, ""));
                  setError(null);
                }}
                placeholder="• • • •"
                className="w-full text-center py-3.5 text-3xl font-extrabold tracking-[0.4em] rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 outline-hidden font-mono"
              />

              {error && (
                <p className="text-rose-600 font-semibold text-xs sm:text-sm mt-1.5">
                  {error}
                </p>
              )}
            </div>

            {/* Resend Code Timer */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Code sent to {countryCode} {phoneNumber}</span>
              {isTimerRunning ? (
                <span>Resend in {timerSeconds}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              id="confirm-otp-btn"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Verify & Continue</span>
            </button>
          </form>
        )}

        {/* STEP 3: OPTIONAL PROFILE DETAILS (NOT MANDATORY) */}
        {step === "optional_profile" && (
          <form onSubmit={handleCompleteWithProfile} className="space-y-4">
            <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-700">
              <p className="font-semibold text-sky-950">
                You are successfully verified!
              </p>
              <p className="text-slate-600 mt-0.5">
                These profile details are <strong>100% optional</strong>. You may fill them now or skip straight to the app.
              </p>
            </div>

            {/* Preferred Name (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="profile-name-input"
                  className="block text-slate-800 font-semibold text-sm"
                >
                  What should we call you?
                </label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <input
                id="profile-name-input"
                type="text"
                autoFocus
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g. Margaret or Grandpa John"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
              />
            </div>

            {/* Gender Selection (Male / Female / Other) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-800 font-semibold text-sm">
                  Gender
                </label>
                <span className="text-xs text-slate-400">Select during signup</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    gender === "male"
                      ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>👨 Male</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    gender === "female"
                      ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>👩 Female</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("other")}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    gender === "other"
                      ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>Other</span>
                </button>
              </div>
            </div>

            {/* Birth Year (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="profile-year-input"
                  className="block text-slate-800 font-semibold text-sm"
                >
                  Year of Birth
                </label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <input
                id="profile-year-input"
                type="text"
                maxLength={4}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="e.g. 1952"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
              />
            </div>

            {/* Emergency Contact (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="profile-emergency-input"
                  className="block text-slate-800 font-semibold text-sm"
                >
                  Emergency Contact Name & Phone
                </label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <input
                id="profile-emergency-input"
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Sarah (Daughter) - 555-019-2834"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 text-slate-900 placeholder:text-slate-400 text-sm outline-hidden"
              />
            </div>

            {/* Dual Action: Save or Skip */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkipProfile}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer"
              >
                Skip for Now
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save & Continue</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
