import { describe, it, expect, vi, afterEach } from "vitest";
import { formatFollowers, logoInitial, relativeTime } from "@/lib/formatters";

describe("formatFollowers", () => {
  it("returns '0' for null", () => {
    expect(formatFollowers(null)).toBe("0");
  });

  it("returns '0' for 0", () => {
    expect(formatFollowers(0)).toBe("0");
  });

  it("returns the number as string for values under 1000", () => {
    expect(formatFollowers(1)).toBe("1");
    expect(formatFollowers(999)).toBe("999");
    expect(formatFollowers(500)).toBe("500");
  });

  it("formats 1000 as '1K'", () => {
    expect(formatFollowers(1000)).toBe("1K");
  });

  it("formats 1500 as '1.5K'", () => {
    expect(formatFollowers(1500)).toBe("1.5K");
  });

  it("formats 10000 as '10K'", () => {
    expect(formatFollowers(10_000)).toBe("10K");
  });

  it("formats 999999 as '1000K' (not M)", () => {
    expect(formatFollowers(999_999)).toBe("1000K");
  });

  it("formats 1000000 as '1M'", () => {
    expect(formatFollowers(1_000_000)).toBe("1M");
  });

  it("formats 1500000 as '1.5M'", () => {
    expect(formatFollowers(1_500_000)).toBe("1.5M");
  });

  it("formats 2000000 as '2M' (no trailing .0)", () => {
    expect(formatFollowers(2_000_000)).toBe("2M");
  });

  it("formats 10000000 as '10M'", () => {
    expect(formatFollowers(10_000_000)).toBe("10M");
  });
});

describe("logoInitial", () => {
  it("returns the first letter uppercased", () => {
    expect(logoInitial("Scout")).toBe("S");
    expect(logoInitial("acme")).toBe("A");
    expect(logoInitial("Zara")).toBe("Z");
  });

  it("returns 'B' as fallback for empty string", () => {
    expect(logoInitial("")).toBe("B");
  });

  it("uppercases a lowercase first character", () => {
    expect(logoInitial("brandname")).toBe("B");
  });

  it("handles a single character brand name", () => {
    expect(logoInitial("X")).toBe("X");
  });

  it("handles special characters without crashing", () => {
    expect(logoInitial("123 Brand")).toBe("1");
  });
});

describe("relativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'now' for timestamps under 1 minute ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    const iso = new Date("2026-06-03T11:59:30Z").toISOString();
    expect(relativeTime(iso)).toBe("now");
  });

  it("returns 'now' for a timestamp equal to now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    const iso = new Date("2026-06-03T12:00:00Z").toISOString();
    expect(relativeTime(iso)).toBe("now");
  });

  it("returns minutes ago for timestamps 1–59 minutes old", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    const iso = new Date("2026-06-03T11:30:00Z").toISOString();
    expect(relativeTime(iso)).toBe("30m ago");
  });

  it("returns '1m ago' for exactly 1 minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:01:00Z"));
    const iso = new Date("2026-06-03T12:00:00Z").toISOString();
    expect(relativeTime(iso)).toBe("1m ago");
  });

  it("returns hours ago for timestamps 1–23 hours old", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    const iso = new Date("2026-06-03T10:00:00Z").toISOString();
    expect(relativeTime(iso)).toBe("2h ago");
  });

  it("returns '1h ago' for exactly 60 minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    const iso = new Date("2026-06-03T11:00:00Z").toISOString();
    expect(relativeTime(iso)).toBe("1h ago");
  });

  it("returns days ago for timestamps 1–6 days old", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    const iso = new Date("2026-06-01T12:00:00Z").toISOString();
    expect(relativeTime(iso)).toBe("2d ago");
  });

  it("returns a formatted date for timestamps 7+ days old", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    const iso = new Date("2026-05-20T12:00:00Z").toISOString();
    const result = relativeTime(iso);
    expect(result).not.toContain("ago");
    expect(result).toMatch(/May/);
  });
});
