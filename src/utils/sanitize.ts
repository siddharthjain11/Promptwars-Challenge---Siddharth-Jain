/**
 * Utility functions for user input sanitization and security checks.
 */

// Strip unprintable control characters except standard whitespace (newline, carriage return, tab).
// Also strip zero-width spaces, invisible characters, and bidirectional control characters.
const CONTROL_AND_INVISIBLES = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF\u202A-\u202E]/g;

export interface SanitizeOptions {
  maxLength?: number;
  allowNewlines?: boolean;
}

/**
 * Sanitizes user-provided text before transmission or AI prompt consumption.
 * - Trims leading and trailing whitespace
 * - Strips invisible, unprintable, and control characters
 * - Enforces a safe maximum character length
 * - Neutralizes script tags to mitigate injection attempts
 */
export function sanitizeInput(text: unknown, options: SanitizeOptions = {}): string {
  if (typeof text !== "string") {
    return "";
  }

  const maxLength = options.maxLength ?? 2000;
  const allowNewlines = options.allowNewlines ?? true;

  // Remove invisible and control characters
  let cleaned = text.replace(CONTROL_AND_INVISIBLES, "");

  if (!allowNewlines) {
    cleaned = cleaned.replace(/[\r\n\t]+/g, " ");
  }

  // Strip potential script injections: <script>...</script>
  cleaned = cleaned.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "");

  cleaned = cleaned.trim();

  // Enforce maximum length constraint
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned;
}

/**
 * Validates whether an input string is within safe length bounds and non-empty.
 */
export function isValidInput(text: unknown, minLength = 1, maxLength = 2000): boolean {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}
