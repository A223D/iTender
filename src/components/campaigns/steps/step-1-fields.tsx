"use client";

import { CONTENT_TYPES } from "@/lib/campaign-constants";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm text-[#07070E] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-coral focus:shadow-[0_0_0_4px_rgba(255,69,102,0.15)]";

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
      <label className="block">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
            Campaign title <span className="text-coral">*</span>
          </span>
          <span className={`text-xs font-medium ${title.length > 80 ? "text-coral" : "text-black/40"}`}>
            {title.length} / 80
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={onTitleKeyDown}
          placeholder="e.g. Summer launch — sunglasses"
          className={inputClass}
        />
      </label>

      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
          Content types <span className="text-coral">*</span>
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
                    ? "border-[#07070E] bg-[#07070E] text-coral"
                    : "border-black/10 bg-white text-[#07070E] hover:border-black/30"
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
