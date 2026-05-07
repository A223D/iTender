"use client";

import { CONTENT_TYPES } from "@/lib/campaign-constants";

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
    <div className="space-y-6">
      <label className="block">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">
            Campaign title <span className="text-coral">*</span>
          </span>
          <span className={`text-xs font-medium ${title.length > 80 ? "text-coral" : "text-ink/40"}`}>
            {title.length} / 80
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={onTitleKeyDown}
          placeholder="e.g. Summer launch — sunglasses"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
        />
      </label>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink">
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
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? "border-moss bg-moss text-white"
                    : "border-black/10 bg-white text-ink hover:border-moss/40"
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
