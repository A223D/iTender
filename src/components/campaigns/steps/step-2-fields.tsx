"use client";

import { useRef } from "react";

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
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">
            Description <span className="text-coral">*</span>
          </span>
          <span className={`text-xs font-medium ${description.length > 1000 ? "text-coral" : "text-ink/40"}`}>
            {description.length} / 1000
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={7}
          placeholder={"What's the campaign about? What should creators highlight, and is there anything to avoid mentioning?\n\ne.g. Launching our spring collection — show how the pieces work for everyday wear. Casual tone. No competitor brands in frame."}
          className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
        />
      </div>

      {/* Moodboard image */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          Moodboard image <span className="font-normal text-ink/35">· Optional</span>
        </p>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Moodboard preview" className="h-full w-full object-cover" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-black/15 bg-white transition hover:border-moss/40"
            >
              <span className="text-2xl">🖼️</span>
            </button>
          )}
          <div>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
            >
              {imagePreview ? "Change image" : "Upload image"}
            </button>
            <p className="mt-1.5 text-xs text-ink/40">JPG, PNG, WEBP</p>
          </div>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageChange}
        />
      </div>

      {/* Reference document */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          Reference document <span className="font-normal text-ink/35">· Optional</span>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
          >
            {docFile ? docFile.name : "Upload document"}
          </button>
          {docFile ? (
            <button
              type="button"
              onClick={onRemoveDoc}
              className="text-xs text-ink/40 transition hover:text-coral"
            >
              Remove
            </button>
          ) : null}
        </div>
        <p className="mt-1.5 text-xs text-ink/40">PDF, DOCX, DOC</p>
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={onDocChange}
        />
      </div>
    </div>
  );
}
