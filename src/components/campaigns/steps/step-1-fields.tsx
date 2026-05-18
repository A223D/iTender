"use client";

import { CONTENT_TYPES } from "@/lib/campaign-constants";
import { Input } from "@/components/ui/input";

export function Step1Fields({
  title,
  selectedContentTypes,
  onTitleChange,
  onTitleKeyDown,
  onToggleContentType,
}: {
  title: string;
  selectedContentTypes: Set<string>;
  onTitleChange: (v: string) => void;
  onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggleContentType: (type: string) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
            Campaign title <span className="text-[var(--color-text-muted)]">*</span>
          </span>
          <span className={`text-xs font-medium ${title.length > 80 ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-hint)]"}`}>
            {title.length} / 80
          </span>
        </div>
        <Input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={onTitleKeyDown}
          placeholder="e.g. Summer launch - sunglasses"
          className="py-3.5"
        />
      </div>

      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
          Content types <span className="text-[var(--color-text-muted)]">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((type) => {
            const selected = selectedContentTypes.has(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => onToggleContentType(type)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-[0.97] ${
                  selected
                    ? "border-transparent bg-[var(--color-text)] text-[var(--color-on-text)]"
                    : "border-black/[0.10] bg-black/[0.02] text-[var(--color-text-muted)] hover:border-black/[0.18] hover:text-[var(--color-text)] dark:border-white/[0.12] dark:bg-transparent dark:hover:border-white/[0.22]"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
