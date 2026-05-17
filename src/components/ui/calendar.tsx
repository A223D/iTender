"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-[var(--color-text)]",
        nav: "flex items-center",
        nav_button:
          "absolute flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 glass text-[var(--color-text-muted)] transition hover:border-white/20 hover:bg-white/[0.04] hover:text-[var(--color-text)]",
        nav_button_previous: "left-1",
        nav_button_next: "right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "w-9 text-center text-[11px] font-semibold text-[var(--color-text-hint)] pb-2 uppercase tracking-wider",
        row: "flex w-full mt-1",
        cell: "relative w-9 p-0 text-center text-sm",
        day: "h-9 w-9 rounded-xl text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-fg)]",
        day_selected:
          "bg-[var(--color-accent-fg)] text-white hover:opacity-90 focus-visible:opacity-90",
        day_today: "bg-[var(--color-accent-fg)]/10 text-[var(--color-accent-fg)] font-bold",
        day_outside: "text-[var(--color-text-hint)] hover:text-[var(--color-text-hint)]",
        day_disabled: "text-[var(--color-text-hint)] cursor-not-allowed hover:bg-transparent",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11L5 7l4-4" />
          </svg>
        ),
        IconRight: () => (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 11l4-4-4-4" />
          </svg>
        ),
      }}
      {...props}
    />
  );
}


