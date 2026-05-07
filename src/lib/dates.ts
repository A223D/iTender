import { MS_PER_DAY } from "@/lib/app-config";

/** Returns an ISO date string (YYYY-MM-DD) n days from today. */
export function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

/** Returns the number of full days remaining until a deadline (0 if past). */
export function daysLeft(deadline: string | Date): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / MS_PER_DAY));
}
