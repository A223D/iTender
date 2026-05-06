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
        caption_label: "text-sm font-semibold text-ink",
        nav: "flex items-center",
        nav_button:
          "absolute flex h-7 w-7 items-center justify-center rounded-xl border border-black/10 bg-white text-ink/50 transition hover:border-black/20 hover:bg-black/[0.03] hover:text-ink",
        nav_button_previous: "left-1",
        nav_button_next: "right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "w-9 text-center text-[11px] font-semibold text-ink/35 pb-2 uppercase tracking-wider",
        row: "flex w-full mt-1",
        cell: "relative w-9 p-0 text-center text-sm",
        day: "h-9 w-9 rounded-xl text-sm font-medium text-ink transition-colors hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-moss",
        day_selected:
          "bg-moss text-white hover:bg-moss/90 focus-visible:bg-moss focus-visible:text-white",
        day_today: "bg-moss/10 text-moss font-bold",
        day_outside: "text-ink/25 hover:text-ink/40",
        day_disabled: "text-ink/20 cursor-not-allowed hover:bg-transparent",
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
