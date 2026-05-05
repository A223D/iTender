"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

const CONTENT_TYPES = [
  "Post",
  "Short-form Video",
  "Long-form Video",
  "Story",
  "Blog / Article",
];

const COMPENSATION_TYPES = [
  { value: "paid", label: "Paid", description: "Cash payment to the creator" },
  { value: "product", label: "Product or Service", description: "Free product, service, or experience" },
  { value: "paid_product", label: "Paid + Product", description: "Cash plus free product or service" },
  { value: "affiliate", label: "Affiliate", description: "% of sales the creator drives" },
  { value: "negotiable", label: "Negotiable", description: "Discuss details in chat" },
];

const DOC_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

type Props = { userId: string };

type FormData = {
  title: string;
  description: string;
  compensationType: string;
  compensationDetails: string;
  creatorsNeeded: string;
  deadline: string;
};

export function CampaignBuilderForm({ userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedContentTypes, setSelectedContentTypes] = useState<Set<string>>(new Set());

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [docFile, setDocFile] = useState<File | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    compensationType: "paid",
    compensationDetails: "",
    creatorsNeeded: "1",
    deadline: addDays(14),
  });

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleContentType(type: string) {
    setSelectedContentTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);
  }

  function validateStep1(): string | null {
    if (!form.title.trim()) return "Please enter a campaign title.";
    if (form.title.trim().length > 80) return "Title must be under 80 characters.";
    if (selectedContentTypes.size === 0) return "Please select at least one content type.";
    return null;
  }

  function validateStep2(): string | null {
    if (!form.description.trim()) return "Please enter a campaign description.";
    if (form.description.length > 1000) return "Description must be under 1000 characters.";
    return null;
  }

  function handleNext() {
    const err = step === 0 ? validateStep1() : validateStep2();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    setError(null);
    setSaving(true);

    try {
      // Upload moodboard image
      let photoUrls: string[] = [];
      if (imageFile) {
        const ext = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("campaign-images")
          .upload(path, imageFile, { upsert: true });
        if (uploadError) {
          console.error("[campaigns/new] image upload error:", uploadError.message);
        } else {
          photoUrls = [supabase.storage.from("campaign-images").getPublicUrl(path).data.publicUrl];
        }
      }

      // Upload reference document
      let referenceDocUrl: string | null = null;
      let referenceDocName: string | null = null;
      if (docFile) {
        const ext = docFile.name.split(".").pop()?.toLowerCase() ?? "pdf";
        const path = `${userId}/${Date.now()}-doc.${ext}`;
        const { error: docUploadError } = await supabase.storage
          .from("campaign-images")
          .upload(path, docFile, {
            upsert: true,
            contentType: DOC_MIME_TYPES[ext] ?? "application/octet-stream",
          });
        if (docUploadError) {
          console.error("[campaigns/new] doc upload error:", docUploadError.message);
        } else {
          referenceDocUrl = supabase.storage.from("campaign-images").getPublicUrl(path).data.publicUrl;
          referenceDocName = docFile.name;
        }
      }

      // Insert campaign
      const { error: insertError } = await supabase.from("campaigns").insert({
        business_id: userId,
        title: form.title.trim(),
        content_types: [...selectedContentTypes],
        description: form.description.trim(),
        compensation_type: form.compensationType,
        compensation_details: form.compensationDetails.trim() || null,
        creators_needed: Math.max(1, parseInt(form.creatorsNeeded, 10) || 1),
        deadline: form.deadline,
        photo_urls: photoUrls,
        reference_doc_url: referenceDocUrl,
        reference_doc_name: referenceDocName,
      });

      if (insertError) {
        console.error("[campaigns/new] insert error:", insertError.code, insertError.message);
        setError("Something went wrong creating your campaign. Please try again.");
        setSaving(false);
        return;
      }

      router.push("/dashboard");
    } catch (e) {
      console.error("[campaigns/new] unexpected error:", e);
      setError("An unexpected error occurred. Please try again.");
      setSaving(false);
    }
  }

  const stepTitles = ["Campaign basics", "Description & materials", "Compensation & timing"];
  const stepSubtitles = [
    "Give your campaign a title and tell us what content you need.",
    "Describe what creators should make and share any reference materials.",
    "Set your budget type, creator count, and deadline.",
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white shadow-glow">
          S
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
          {stepTitles[step]}
        </h1>
        <p className="mt-2 text-sm text-ink/55">{stepSubtitles[step]}</p>
        <div className="mt-6 flex items-center gap-2">
          <div className="h-1.5 w-8 rounded-full bg-moss" />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? "bg-moss" : "bg-black/10"}`} />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? "bg-moss" : "bg-black/10"}`} />
        </div>
      </div>

      {/* ── STEP 1 ── */}
      {step === 0 ? (
        <div className="space-y-6">
          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                Campaign title <span className="text-coral">*</span>
              </span>
              <span className={`text-xs font-medium ${form.title.length > 80 ? "text-coral" : "text-ink/40"}`}>
                {form.title.length} / 80
              </span>
            </div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
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
                    onClick={() => toggleContentType(type)}
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
      ) : null}

      {/* ── STEP 2 ── */}
      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                Description <span className="text-coral">*</span>
              </span>
              <span className={`text-xs font-medium ${form.description.length > 1000 ? "text-coral" : "text-ink/40"}`}>
                {form.description.length} / 1000
              </span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={7}
              placeholder={"What's the campaign about? What should creators highlight, and is there anything to avoid mentioning?\n\ne.g. Launching our spring collection — show how the pieces work for everyday wear. Casual tone. No competitor brands in frame."}
              className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">
              Moodboard image{" "}
              <span className="font-normal text-ink/35">· Optional</span>
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
              onChange={handleImageChange}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">
              Reference document{" "}
              <span className="font-normal text-ink/35">· Optional</span>
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
                  onClick={() => setDocFile(null)}
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
              onChange={handleDocChange}
            />
          </div>
        </div>
      ) : null}

      {/* ── STEP 3 ── */}
      {step === 2 ? (
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-ink">
              Compensation type <span className="text-coral">*</span>
            </p>
            <div className="space-y-2">
              {COMPENSATION_TYPES.map((ct) => {
                const selected = form.compensationType === ct.value;
                return (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => set("compensationType", ct.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-moss bg-moss/[0.04]"
                        : "border-black/10 bg-white hover:border-black/20"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${
                        selected ? "border-moss bg-moss" : "border-black/25"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">{ct.label}</p>
                      <p className="text-xs text-ink/45">{ct.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              Compensation details{" "}
              <span className="font-normal text-ink/35">· Optional</span>
            </span>
            <input
              type="text"
              value={form.compensationDetails}
              onChange={(e) => set("compensationDetails", e.target.value)}
              placeholder="e.g. Free dinner for 2 + $100 cash"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              Creators needed <span className="text-coral">*</span>
            </span>
            <input
              type="number"
              min={1}
              value={form.creatorsNeeded}
              onChange={(e) => set("creatorsNeeded", e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              Application deadline <span className="text-coral">*</span>
            </span>
            <input
              type="date"
              value={form.deadline}
              min={addDays(1)}
              max={addDays(180)}
              onChange={(e) => set("deadline", e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
            />
          </label>
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <p className="mt-4 rounded-2xl border border-coral/20 bg-coral/[0.06] px-4 py-3 text-sm text-coral">
          {error}
        </p>
      ) : null}

      {/* Actions */}
      <div className="mt-8 flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => { setError(null); setStep((s) => s - 1); }}
            className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          onClick={step < 2 ? handleNext : handleSubmit}
          disabled={saving}
          className="flex-1 rounded-2xl bg-moss px-5 py-3 text-sm font-bold text-white transition hover:bg-moss/90 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Publishing…" : step < 2 ? "Continue →" : "Publish Campaign"}
        </button>
      </div>
    </div>
  );
}
