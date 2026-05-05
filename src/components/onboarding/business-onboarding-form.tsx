"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { createClient } from "@/utils/supabase/client";

const INDUSTRIES = [
  "UGC",
  "Food & Beverage",
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Tech & Electronics",
  "Health & Wellness",
  "Travel & Hospitality",
  "Home & Lifestyle",
  "Sports & Fitness",
  "Entertainment",
  "Other",
];

type InitialProfile = {
  brandName: string;
  industry: string;
  city: string;
  websiteUrl: string;
  brandValues: string;
  logoUrl: string | null;
};

type Props = {
  userId: string;
  email: string;
  name: string;
  initialProfile?: InitialProfile;
};

type FormData = {
  brandName: string;
  industry: string;
  city: string;
  websiteUrl: string;
  brandValues: string;
};

export function BusinessOnboardingForm({ userId, email, name, initialProfile }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!initialProfile;

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logo state — pre-fill with existing URL when editing
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialProfile?.logoUrl ?? null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    brandName: initialProfile?.brandName ?? name,
    industry: initialProfile?.industry ?? "",
    city: initialProfile?.city ?? "",
    websiteUrl: initialProfile?.websiteUrl ?? "",
    brandValues: initialProfile?.brandValues ?? "",
  });

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  // ── Step 1 validation ──────────────────────────────────────────────────────
  function validateStep1(): string | null {
    if (!logoFile && !logoPreview) return "Please add a business logo.";
    if (!form.brandName.trim()) return "Please enter your business name.";
    if (!form.industry) return "Please select an industry.";
    if (!form.city.trim()) return "Please enter your city.";
    return null;
  }

  function handleNextStep() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null);
    setStep(1);
  }

  // ── Final submit ───────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.brandValues.trim()) { setError("Please tell creators about your brand."); return; }
    if (form.brandValues.length > 1000) { setError("Brand description must be under 1000 characters."); return; }
    setError(null);
    setSaving(true);

    try {
      // 1. Upload logo — keep existing URL if no new file picked
      let logoUrl: string | null = initialProfile?.logoUrl ?? null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userId}/logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(path, logoFile, { upsert: true });

        if (uploadError) {
          console.error("[onboarding] Logo upload error:", uploadError.message);
          // Non-fatal — continue without logo
        } else {
          logoUrl = supabase.storage.from("profile-images").getPublicUrl(path).data.publicUrl;
        }
      }

      // 2. Upsert users row
      const { error: userError } = await supabase.from("users").upsert(
        {
          id: userId,
          role: "business",
          name: form.brandName.trim(),
          email,
          city: form.city.trim(),
        },
        { onConflict: "id" },
      );
      if (userError) console.error("[onboarding] users upsert error:", userError.message);

      // 3. Upsert business_profiles
      const { error: profileError } = await supabase.from("business_profiles").upsert(
        {
          user_id: userId,
          brand_name: form.brandName.trim(),
          industry: form.industry,
          logo_url: logoUrl,
          website_url: form.websiteUrl.trim() || null,
          brand_values: form.brandValues.trim(),
        },
        { onConflict: "user_id" },
      );

      if (profileError) {
        console.error("[onboarding] business_profiles upsert error:", profileError.code, profileError.message);
        setError("Something went wrong saving your profile. Please try again.");
        setSaving(false);
        return;
      }

      router.push("/dashboard");
    } catch (e) {
      console.error("[onboarding] Unexpected error:", e);
      setError("An unexpected error occurred. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-violet text-sm font-bold text-white shadow-glow">
          S
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
          {step === 0 ? (isEditing ? "Edit your brand" : "Set up your brand") : "About your brand"}
        </h1>
        <p className="mt-2 text-sm text-ink/55">
          {step === 0
            ? "Tell creators who you are so they know what to expect."
            : "Give creators a sense of your brand values and what makes you unique."}
        </p>

        {/* Step indicator */}
        <div className="mt-6 flex items-center gap-2">
          <div className="h-1.5 w-8 rounded-full bg-moss" />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 1 ? "bg-moss" : "bg-black/10"}`} />
        </div>
      </div>

      {/* ── STEP 1 ─────────────────────────────────────────────────────────── */}
      {step === 0 ? (
        <div className="space-y-6">
          {/* Logo */}
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Brand logo</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/15 bg-white transition hover:border-moss/40"
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">🏪</span>
                )}
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
                >
                  {logoPreview ? "Change logo" : "Upload logo"}
                </button>
                <p className="mt-1.5 text-xs text-ink/40">Optional · JPG, PNG, WEBP</p>
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          {/* Brand name */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              Business name <span className="text-coral">*</span>
            </span>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => set("brandName", e.target.value)}
              placeholder="e.g. Bloom Cafe"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
            />
          </label>

          {/* Industry */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              Industry <span className="text-coral">*</span>
            </span>
            <select
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
            >
              <option value="" disabled>Select your industry…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </label>

          {/* City */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">
              City <span className="text-coral">*</span>
            </span>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Toronto"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
            />
          </label>

          {/* Website */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Website URL</span>
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(e) => set("websiteUrl", e.target.value)}
              placeholder="https://yourbrand.com"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
            />
          </label>
        </div>
      ) : null}

      {/* ── STEP 2 ─────────────────────────────────────────────────────────── */}
      {step === 1 ? (
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                Brand bio <span className="text-coral">*</span>
              </span>
              <span className={`text-xs font-medium ${form.brandValues.length > 1000 ? "text-coral" : "text-ink/40"}`}>
                {form.brandValues.length} / 1000
              </span>
            </div>
            <textarea
              value={form.brandValues}
              onChange={(e) => set("brandValues", e.target.value)}
              rows={8}
              placeholder="Tell creators what your brand is about — your values, vibe, the kind of content you're looking for, and what makes working with you exciting."
              className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
            />
          </div>
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
        {step === 1 ? (
          <button
            type="button"
            onClick={() => { setError(null); setStep(0); }}
            className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
          >
            Back
          </button>
        ) : null}

        <button
          type="button"
          onClick={step === 0 ? handleNextStep : handleSubmit}
          disabled={saving}
          className="flex-1 rounded-2xl bg-moss px-5 py-3 text-sm font-bold text-white transition hover:bg-moss/90 active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "Saving…" : step === 0 ? "Continue →" : isEditing ? "Save changes" : "Create your profile"}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-ink/35">
        Signed in as{" "}
        <span className="font-medium text-ink/55">{email}</span>
      </p>
    </div>
  );
}
