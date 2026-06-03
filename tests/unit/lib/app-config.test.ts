import { describe, it, expect } from "vitest";
import {
  FILE_SIZE_LIMITS,
  UNREAD_BADGE_MAX,
  MESSAGE_PREVIEW_MAX,
  STALE_CAMPAIGN_DAYS,
  MS_PER_DAY,
} from "@/lib/app-config";

describe("FILE_SIZE_LIMITS", () => {
  it("logo limit is 5 MB", () => {
    expect(FILE_SIZE_LIMITS.logo).toBe(5 * 1024 * 1024);
  });

  it("image limit is 5 MB", () => {
    expect(FILE_SIZE_LIMITS.image).toBe(5 * 1024 * 1024);
  });

  it("doc limit is 15 MB", () => {
    expect(FILE_SIZE_LIMITS.doc).toBe(15 * 1024 * 1024);
  });

  it("doc limit is larger than image and logo limits", () => {
    expect(FILE_SIZE_LIMITS.doc).toBeGreaterThan(FILE_SIZE_LIMITS.image);
    expect(FILE_SIZE_LIMITS.doc).toBeGreaterThan(FILE_SIZE_LIMITS.logo);
  });
});

describe("UNREAD_BADGE_MAX", () => {
  it("is 9", () => {
    expect(UNREAD_BADGE_MAX).toBe(9);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(UNREAD_BADGE_MAX)).toBe(true);
    expect(UNREAD_BADGE_MAX).toBeGreaterThan(0);
  });
});

describe("MESSAGE_PREVIEW_MAX", () => {
  it("is 120", () => {
    expect(MESSAGE_PREVIEW_MAX).toBe(120);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(MESSAGE_PREVIEW_MAX)).toBe(true);
    expect(MESSAGE_PREVIEW_MAX).toBeGreaterThan(0);
  });
});

describe("STALE_CAMPAIGN_DAYS", () => {
  it("is 7", () => {
    expect(STALE_CAMPAIGN_DAYS).toBe(7);
  });
});

describe("MS_PER_DAY", () => {
  it("equals 86400000 ms", () => {
    expect(MS_PER_DAY).toBe(86_400_000);
  });

  it("equals 1000 * 60 * 60 * 24", () => {
    expect(MS_PER_DAY).toBe(1000 * 60 * 60 * 24);
  });
});
