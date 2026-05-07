"use client";

import { useRef } from "react";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm text-[#07070E] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-coral focus:shadow-[0_0_0_4px_rgba(255,69,102,0.15)]";

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
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
            Description <span className="text-coral">*</span>
          </span>
          <span className={`text-xs font-medium ${description.length > 1000 ? "text-coral" : "text-black/40"}`}>
            {description.length} / 1000
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={7}
          placeholder={"What's the campaign about? What should creators highlight, and is there anything to avoid mentioning?\n\ne.g. Launching our spring collection — show how the pieces work for everyday wear. Casual tone. No competitor brands in frame."}
          className={`${inputClass} min-h-[180px] resize-none leading-7`}
        />
      </div>

      {/* Moodboard image */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
          Moodboard image <span className="font-normal normal-case text-black/35 tracking-normal">· Optional</span>
        </p>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Moodboard preview" className="h-full w-full object-cover" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-black/15 bg-white transition hover:border-coral/40"
            >
              <span className="text-2xl">🖼️</span>
            </button>
          )}
          <div>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#07070E] transition hover:border-black/30 hover:bg-black/[0.03] active:scale-[0.98]"
            >
              {imagePreview ? "Change image" : "Upload image"}
            </button>
            <p className="mt-1.5 text-xs text-black/40">JPG, PNG, WEBP · max 5 MB</p>
          </div>
        </div>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
      </div>

      {/* Reference document */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
          Reference document <span className="font-normal normal-case text-black/35 tracking-normal">· Optional</span>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#07070E] transition hover:border-black/30 hover:bg-black/[0.03] active:scale-[0.98]"
          >
            {docFile ? docFile.name : "Upload document"}
          </button>
          {docFile ? (
            <button
              type="button"
              onClick={onRemoveDoc}
              className="text-xs text-black/40 transition hover:text-coral"
            >
              Remove
            </button>
          ) : null}
        </div>
        <p className="mt-1.5 text-xs text-black/40">PDF, DOCX, DOC · max 15 MB</p>
        <input ref={docInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={onDocChange} />
      </div>
    </div>
  );
}
