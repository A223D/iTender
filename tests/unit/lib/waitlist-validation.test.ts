import { describe, it, expect } from "vitest";
import {
  cleanString,
  normalizeWebsite,
  validateWaitlistPayload,
  normalizeWaitlistPayload,
  EMAIL_PATTERN,
} from "@/lib/waitlist-validation";

// ---------------------------------------------------------------------------
// cleanString
// ---------------------------------------------------------------------------
describe("cleanString", () => {
  it("trims leading and trailing whitespace", () => {
    expect(cleanString("  hello  ", 100)).toBe("hello");
  });

  it("slices to maxLength", () => {
    expect(cleanString("A".repeat(200), 50)).toBe("A".repeat(50));
  });

  it("returns empty string for non-string values", () => {
    expect(cleanString(null, 100)).toBe("");
    expect(cleanString(undefined, 100)).toBe("");
    expect(cleanString(42, 100)).toBe("");
    expect(cleanString({}, 100)).toBe("");
  });

  it("returns an empty string for an already-empty string", () => {
    expect(cleanString("", 100)).toBe("");
  });

  it("does not truncate when value is shorter than maxLength", () => {
    expect(cleanString("hello", 100)).toBe("hello");
  });
});

// ---------------------------------------------------------------------------
// normalizeWebsite
// ---------------------------------------------------------------------------
describe("normalizeWebsite", () => {
  it("leaves https:// URLs untouched", () => {
    expect(normalizeWebsite("https://scout.app")).toBe("https://scout.app");
  });

  it("leaves http:// URLs untouched", () => {
    expect(normalizeWebsite("http://scout.app")).toBe("http://scout.app");
  });

  it("prepends https:// when no protocol is present", () => {
    expect(normalizeWebsite("scout.app")).toBe("https://scout.app");
  });

  it("returns empty string for null input", () => {
    expect(normalizeWebsite(null)).toBe("");
  });

  it("returns empty string for empty string input", () => {
    expect(normalizeWebsite("")).toBe("");
  });

  it("trims whitespace before normalizing", () => {
    expect(normalizeWebsite("  scout.app  ")).toBe("https://scout.app");
  });

  it("slices the URL to 255 characters before checking protocol", () => {
    const veryLong = "x".repeat(300);
    const result = normalizeWebsite(veryLong);
    expect(result.length).toBeLessThanOrEqual(255 + "https://".length);
  });
});

// ---------------------------------------------------------------------------
// EMAIL_PATTERN
// ---------------------------------------------------------------------------
describe("EMAIL_PATTERN", () => {
  it("matches valid email addresses", () => {
    expect(EMAIL_PATTERN.test("user@example.com")).toBe(true);
    expect(EMAIL_PATTERN.test("user+tag@sub.example.co.uk")).toBe(true);
    expect(EMAIL_PATTERN.test("a@b.c")).toBe(true);
  });

  it("rejects addresses missing the @ symbol", () => {
    expect(EMAIL_PATTERN.test("userexample.com")).toBe(false);
  });

  it("rejects addresses missing the domain", () => {
    expect(EMAIL_PATTERN.test("user@")).toBe(false);
  });

  it("rejects addresses with spaces", () => {
    expect(EMAIL_PATTERN.test("user @example.com")).toBe(false);
    expect(EMAIL_PATTERN.test("user@ example.com")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateWaitlistPayload
// ---------------------------------------------------------------------------
describe("validateWaitlistPayload", () => {
  const validBrand = {
    name: "Acme Inc",
    email: "owner@acme.com",
    phone: "",
    role: "brand",
    instagramHandle: "",
    companyName: "Acme Inc",
    websiteUrl: "",
  };

  const validCreator = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "",
    role: "creator",
    instagramHandle: "@janedoe",
    companyName: "",
    websiteUrl: "",
  };

  it("returns null for a valid brand submission", () => {
    expect(validateWaitlistPayload(validBrand)).toBeNull();
  });

  it("returns null for a valid creator submission", () => {
    expect(validateWaitlistPayload(validCreator)).toBeNull();
  });

  it("returns an error when name is missing", () => {
    const result = validateWaitlistPayload({ ...validBrand, name: "" });
    expect(result).not.toBeNull();
    expect(result?.field).toBe("name");
  });

  it("returns an error when both email and phone are missing", () => {
    const result = validateWaitlistPayload({ ...validBrand, email: "", phone: "" });
    expect(result).not.toBeNull();
    expect(result?.field).toBe("contact");
  });

  it("accepts phone-only (no email) when phone is provided", () => {
    const result = validateWaitlistPayload({ ...validBrand, email: "", phone: "5551234567" });
    expect(result).toBeNull();
  });

  it("returns an email error for a malformed email", () => {
    const result = validateWaitlistPayload({ ...validBrand, email: "not-an-email" });
    expect(result).not.toBeNull();
    expect(result?.field).toBe("email");
  });

  it("returns an error when role is missing", () => {
    const result = validateWaitlistPayload({ ...validBrand, role: "" });
    expect(result).not.toBeNull();
    expect(result?.field).toBe("role");
  });

  it("returns an error when role is an invalid value", () => {
    const result = validateWaitlistPayload({ ...validBrand, role: "influencer" });
    expect(result).not.toBeNull();
    expect(result?.field).toBe("role");
  });

  it("returns an error for creator without instagramHandle", () => {
    const result = validateWaitlistPayload({ ...validCreator, instagramHandle: "" });
    expect(result).not.toBeNull();
    expect(result?.field).toBe("instagramHandle");
  });

  it("returns an error for brand without companyName", () => {
    const result = validateWaitlistPayload({ ...validBrand, companyName: "" });
    expect(result).not.toBeNull();
    expect(result?.field).toBe("companyName");
  });

  it("strips leading @ from instagramHandle during validation", () => {
    const result = validateWaitlistPayload({ ...validCreator, instagramHandle: "@janedoe" });
    expect(result).toBeNull();
  });

  it("trims whitespace-only name to empty, triggering name error", () => {
    const result = validateWaitlistPayload({ ...validBrand, name: "   " });
    expect(result).not.toBeNull();
    expect(result?.field).toBe("name");
  });
});

// ---------------------------------------------------------------------------
// normalizeWaitlistPayload
// ---------------------------------------------------------------------------
describe("normalizeWaitlistPayload", () => {
  it("lowercases the email", () => {
    const result = normalizeWaitlistPayload({ name: "A", email: "User@Example.COM", phone: "", role: "brand", instagramHandle: "", companyName: "Acme", websiteUrl: "" });
    expect(result.email).toBe("user@example.com");
  });

  it("removes leading @ from instagramHandle", () => {
    const result = normalizeWaitlistPayload({ name: "A", email: "a@b.com", phone: "", role: "creator", instagramHandle: "@handle", companyName: "", websiteUrl: "" });
    expect(result.instagramHandle).toBe("handle");
  });

  it("removes multiple leading @@ from instagramHandle", () => {
    const result = normalizeWaitlistPayload({ name: "A", email: "a@b.com", phone: "", role: "creator", instagramHandle: "@@handle", companyName: "", websiteUrl: "" });
    expect(result.instagramHandle).toBe("handle");
  });

  it("prepends https:// to a websiteUrl without protocol", () => {
    const result = normalizeWaitlistPayload({ name: "A", email: "a@b.com", phone: "", role: "brand", instagramHandle: "", companyName: "Acme", websiteUrl: "scout.app" });
    expect(result.websiteUrl).toBe("https://scout.app");
  });

  it("leaves https:// websiteUrl unchanged", () => {
    const result = normalizeWaitlistPayload({ name: "A", email: "a@b.com", phone: "", role: "brand", instagramHandle: "", companyName: "Acme", websiteUrl: "https://scout.app" });
    expect(result.websiteUrl).toBe("https://scout.app");
  });

  it("trims all string fields", () => {
    const result = normalizeWaitlistPayload({ name: "  Acme  ", email: "  a@b.com  ", phone: "  123  ", role: "brand", instagramHandle: "  handle  ", companyName: "  Acme Inc  ", websiteUrl: "" });
    expect(result.name).toBe("Acme");
    expect(result.email).toBe("a@b.com");
    expect(result.phone).toBe("123");
    expect(result.companyName).toBe("Acme Inc");
  });
});
