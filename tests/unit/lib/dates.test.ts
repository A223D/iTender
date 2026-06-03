import { describe, it, expect, vi, afterEach } from "vitest";
import { addDays, daysLeft } from "@/lib/dates";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

describe("addDays", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns today in YYYY-MM-DD format when n=0", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    expect(addDays(0)).toBe("2026-06-03");
  });

  it("returns the correct date 14 days from now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    expect(addDays(14)).toBe("2026-06-17");
  });

  it("returns yesterday when n=-1", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    expect(addDays(-1)).toBe("2026-06-02");
  });

  it("handles month boundary correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-28T12:00:00Z"));
    expect(addDays(7)).toBe("2026-02-04");
  });

  it("handles year boundary correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-12-28T12:00:00Z"));
    expect(addDays(7)).toBe("2026-01-04");
  });

  it("always returns a string matching YYYY-MM-DD", () => {
    expect(addDays(0)).toMatch(ISO_DATE_REGEX);
    expect(addDays(30)).toMatch(ISO_DATE_REGEX);
    expect(addDays(-5)).toMatch(ISO_DATE_REGEX);
  });
});

describe("daysLeft", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for a past deadline", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    expect(daysLeft("2026-05-01")).toBe(0);
  });

  it("returns 0 for a deadline of yesterday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    expect(daysLeft("2026-06-02")).toBe(0);
  });

  it("returns correct number of days for a future deadline", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
    expect(daysLeft("2026-06-10")).toBe(7);
  });

  it("returns 1 for a deadline tomorrow", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
    expect(daysLeft("2026-06-04")).toBe(1);
  });

  it("accepts a Date object as deadline", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
    const future = new Date("2026-06-13T00:00:00Z");
    expect(daysLeft(future)).toBe(10);
  });

  it("never returns negative values", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T12:00:00Z"));
    expect(daysLeft("2020-01-01")).toBeGreaterThanOrEqual(0);
  });

  it("returns 14 for the default campaign deadline window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
    expect(daysLeft("2026-06-17")).toBe(14);
  });
});
