"use client";

import * as React from "react";
import { format } from "date-fns";
import * as Popover from "@radix-ui/react-popover";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse ISO string to Date at noon to avoid timezone-shift issues
  const selected = value ? new Date(value + "T12:00:00") : undefined;
  const minDate = min ? new Date(min + "T00:00:00") : undefined;
  const maxDate = max ? new Date(max + "T23:59:59") : undefined;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition hover:border-black/20 focus:border-moss",
            selected ? "text-ink" : "text-ink/35",
            className,
          )}
        >
          <span>{selected ? format(selected, "MMMM d, yyyy") : placeholder}</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-ink/40"
          >
            <rect x="1" y="2" width="14" height="13" rx="2" />
            <path d="M1 6h14M5 1v2M11 1v2" />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          className="z-50 rounded-2xl border border-black/[0.08] bg-white shadow-xl outline-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(date.toISOString().split("T")[0]);
                setOpen(false);
              }
            }}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
