"use client";

import { useRef } from "react";

import { Textarea } from "@/components/ui/textarea";

export function Step2Fields({
  description,
  imagePreview,
  docFile,
  onDescriptionChange,
  onImageChange,
  onDocChange,
  onRemoveDoc,
}: {
  description: string;
  imagePreview: string | null;
  docFile: File | null;
  onDescriptionChange: (v: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDocChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveDoc: () => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
            Description <span className="text-[var(--color-text-muted)]">*</span>
          </span>
          <span className={`text-xs font-medium ${description.length > 1000 ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-hint)]"}`}>
            {description.length} / 1000
          </span>
        </div>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={7}
          placeholder={"What's the campaign about? What should creators highlight, and is there anything to avoid mentioning?\n\ne.g. Launching our spring collection â€” show how the pieces work for everyday wear. Casual tone. No competitor brands in frame."}
          className="min-h-[180px] py-3.5 leading-7"
        />
      </div>

      {/* Moodboard image */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
          Moodboard image <span className="font-normal normal-case text-[var(--color-text-hint)] tracking-normal">Â· Optional</span>
        </p>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/[0.12]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Moodboard preview" className="h-full w-full object-cover" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="glass flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/[0.15] transition hover:border-white/[0.30]"
            >
              <span className="text-2xl">ðŸ–¼ï¸</span>
            </button>
          )}
          <div>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="glass rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:opacity-80 active:scale-[0.98]"
            >
              {imagePreview ? "Change image" : "Upload image"}
            </button>
            <p className="mt-1.5 text-xs text-[var(--color-text-hint)]">JPG, PNG, WEBP Â· max 5 MB</p>
          </div>
        </div>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
      </div>

      {/* Reference document */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text)]">
          Reference document <span className="font-normal normal-case text-[var(--color-text-hint)] tracking-normal">Â· Optional</span>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="glass rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:opacity-80 active:scale-[0.98]"
          >
            {docFile ? docFile.name : "Upload document"}
          </button>
          {docFile ? (
            <button
              type="button"
              onClick={onRemoveDoc}
              className="text-xs text-[var(--color-text-hint)] transition hover:text-[var(--color-text-muted)]"
            >
              Remove
            </button>
          ) : null}
        </div>
        <p className="mt-1.5 text-xs text-[var(--color-text-hint)]">PDF, DOCX, DOC Â· max 15 MB</p>
        <input ref={docInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={onDocChange} />
      </div>
    </div>
  );
}

