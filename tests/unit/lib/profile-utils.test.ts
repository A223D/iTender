import { describe, it, expect } from "vitest";
import { isProfileIncomplete, profileNudgeText } from "@/lib/profile-utils";

describe("isProfileIncomplete", () => {
  it("returns false when both logo and website are present", () => {
    expect(isProfileIncomplete({ logo_url: "https://cdn.example.com/logo.png", website_url: "https://brand.com" })).toBe(false);
  });

  it("returns true when logo_url is null", () => {
    expect(isProfileIncomplete({ logo_url: null, website_url: "https://brand.com" })).toBe(true);
  });

  it("returns true when website_url is null", () => {
    expect(isProfileIncomplete({ logo_url: "https://cdn.example.com/logo.png", website_url: null })).toBe(true);
  });

  it("returns true when both logo_url and website_url are null", () => {
    expect(isProfileIncomplete({ logo_url: null, website_url: null })).toBe(true);
  });

  it("returns true for empty string logo_url (falsy)", () => {
    expect(isProfileIncomplete({ logo_url: "", website_url: "https://brand.com" })).toBe(true);
  });

  it("returns true for empty string website_url (falsy)", () => {
    expect(isProfileIncomplete({ logo_url: "https://cdn.example.com/logo.png", website_url: "" })).toBe(true);
  });
});

describe("profileNudgeText", () => {
  it("prompts for both logo and website when neither is set", () => {
    const text = profileNudgeText({ logo_url: null, website_url: null });
    expect(text).toContain("logo");
    expect(text).toContain("website");
  });

  it("prompts only for a logo when website is present but logo is missing", () => {
    const text = profileNudgeText({ logo_url: null, website_url: "https://brand.com" });
    expect(text).toContain("logo");
    expect(text).not.toContain("website");
  });

  it("prompts only for a website when logo is present but website is missing", () => {
    const text = profileNudgeText({ logo_url: "https://cdn.example.com/logo.png", website_url: null });
    expect(text).toContain("website");
    expect(text).not.toContain("logo");
  });

  it("returns the both-missing message when both are empty strings", () => {
    const text = profileNudgeText({ logo_url: "", website_url: "" });
    expect(text).toContain("logo");
    expect(text).toContain("website");
  });

  it("returns a non-empty string in all cases", () => {
    const profiles = [
      { logo_url: null, website_url: null },
      { logo_url: null, website_url: "https://x.com" },
      { logo_url: "https://x.com/logo.png", website_url: null },
    ];
    for (const p of profiles) {
      expect(profileNudgeText(p).length).toBeGreaterThan(0);
    }
  });
});
