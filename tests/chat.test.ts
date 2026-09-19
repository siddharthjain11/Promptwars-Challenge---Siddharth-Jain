import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeInput, isValidInput } from "../src/utils/sanitize";

describe("Chat Function & Input Sanitization", () => {
  it("should sanitize user messages by stripping control characters and trimming", () => {
    const dirty = "  Hello Companion!\u0000\u0008  ";
    const clean = sanitizeInput(dirty);
    assert.equal(clean, "Hello Companion!");
  });

  it("should strip malicious script tags from user chat inputs", () => {
    const malicious = "Can you help me <script>alert('pwned')</script> with medication?";
    const clean = sanitizeInput(malicious);
    assert.equal(clean.includes("<script>"), false);
    assert.equal(clean.includes("alert"), false);
    assert.ok(clean.includes("Can you help me"));
    assert.ok(clean.includes("with medication?"));
  });

  it("should truncate oversized chat inputs to the specified maximum length", () => {
    const longMessage = "a".repeat(2000);
    const sanitized = sanitizeInput(longMessage, { maxLength: 1000 });
    assert.equal(sanitized.length, 1000);
  });

  it("should handle empty, null, or undefined inputs gracefully without crashing", () => {
    assert.equal(sanitizeInput(null), "");
    assert.equal(sanitizeInput(undefined), "");
    assert.equal(sanitizeInput(""), "");
    assert.equal(sanitizeInput("   "), "");
  });

  it("should validate input strings with isValidInput", () => {
    assert.equal(isValidInput("Hello there", 1, 100), true);
    assert.equal(isValidInput("", 1, 100), false);
    assert.equal(isValidInput("   ", 1, 100), false);
    assert.equal(isValidInput(null, 1, 100), false);
  });

  it("should validate and format conversation history for companion chat", () => {
    const rawHistory = [
      { sender: "Senior Citizen", text: "How is the weather?" },
      { sender: "Companion", text: "It is bright and sunny today." },
    ];

    const formatted = rawHistory.map((m) => ({
      sender: m.sender,
      text: sanitizeInput(m.text, { maxLength: 1000 }),
    }));

    assert.equal(formatted.length, 2);
    assert.equal(formatted[0].sender, "Senior Citizen");
    assert.equal(formatted[0].text, "How is the weather?");
  });
});
