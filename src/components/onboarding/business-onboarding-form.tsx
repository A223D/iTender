"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Graphics, Sprite } from "pixi.js";

import { createClient } from "@/utils/supabase/client";
import { FILE_SIZE_LIMITS } from "@/lib/app-config";

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

const STEPS = [
  { id: "brand", label: "Your brand", sub: "Logo, name, location" },
  { id: "story", label: "Brand story", sub: "What you stand for" },
];

const THEME_STYLE = {
  "--scout-ink": "#0E0E0C",
  "--scout-ink-soft": "#1A1A17",
  "--scout-cream": "#FBF7EE",
  "--scout-paper": "#F4EFE6",
  "--scout-lime": "#D4FF3F",
  "--scout-lime-deep": "#B8E028",
  "--scout-coral": "#FF5A4D",
  "--scout-violet": "#7B5FFF",
  "--scout-sky": "#B8D4FF",
} as CSSProperties;

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

type PixiBlob = {
  sprite: Sprite;
  baseX: number;
  baseY: number;
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  phase: number;
  baseAlpha: number;
  pulse: number;
};

type PixiStar = {
  g: Graphics;
  phase: number;
  sp: number;
  max: number;
};

function stripWebsiteProtocol(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function BusinessOnboardingForm({ userId, email, name, initialProfile }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!initialProfile;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialProfile?.logoUrl ?? null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    brandName: initialProfile?.brandName ?? name,
    industry: initialProfile?.industry ?? "",
    city: initialProfile?.city ?? "",
    websiteUrl: initialProfile?.websiteUrl ? stripWebsiteProtocol(initialProfile.websiteUrl) : "",
    brandValues: initialProfile?.brandValues ?? "",
  });

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > FILE_SIZE_LIMITS.logo) {
      setError("Logo must be under 5 MB.");
      e.target.value = "";
      return;
    }
    setError(null);
    if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function validateBasics() {
    if (!form.brandName.trim()) return "Please enter your business name.";
    if (!form.industry) return "Please select an industry.";
    if (!form.city.trim()) return "Please enter your city.";
    return null;
  }

  function handleNextStep() {
    const err = validateBasics();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setDirection(1);
    setStep(1);
  }

  async function handleSubmit() {
    const basicsError = validateBasics();
    if (basicsError) {
      setDirection(-1);
      setStep(0);
      setError(basicsError);
      return;
    }

    if (!form.brandValues.trim()) {
      setError("Please tell creators about your brand.");
      return;
    }

    if (form.brandValues.length > 1000) {
      setError("Brand description must be under 1000 characters.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      let logoUrl: string | null = initialProfile?.logoUrl ?? null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userId}/logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(path, logoFile, { upsert: true });

        if (uploadError) {
          console.error("[onboarding] Logo upload error:", uploadError.message);
        } else {
          logoUrl = supabase.storage.from("profile-images").getPublicUrl(path).data.publicUrl;
        }
      }

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

      const { error: profileError } = await supabase.from("business_profiles").upsert(
        {
          user_id: userId,
          brand_name: form.brandName.trim(),
          industry: form.industry,
          logo_url: logoUrl,
          website_url: normalizeWebsiteUrl(form.websiteUrl),
          brand_values: form.brandValues.trim(),
        },
        { onConflict: "user_id" },
      );

      if (profileError) {
        console.error("[onboarding] business_profiles upsert error:", profileError.code, profileError.message);
        setError("Something went wrong saving your profile. Please try again.");
        return;
      }

      setCompleted(true);
      setConfettiKey((key) => key + 1);
      router.refresh();
    } catch (e) {
      console.error("[onboarding] Unexpected error:", e);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={THEME_STYLE} className="min-h-screen bg-[var(--scout-cream)] text-[var(--scout-ink)]">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        <BrandPanel current={completed ? STEPS.length : step} isEditing={isEditing} />

        <section className="relative flex min-h-[680px] flex-1 flex-col bg-[var(--scout-cream)]">
          <ConfettiBurst trigger={confettiKey} />

          <div className="flex h-14 items-center justify-between border-b border-black/10 px-5 sm:px-9">
            <div className="font-mono text-[11px] font-semibold uppercase text-black/40">
              {completed ? (
                <span className="text-[var(--scout-ink)]">Complete</span>
              ) : (
                <>
                  Step <span className="text-[var(--scout-ink)]">{String(step + 1).padStart(2, "0")}</span>
                  <span className="text-black/35"> / {String(STEPS.length).padStart(2, "0")}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="text-xs font-semibold text-black/55 transition hover:text-[var(--scout-ink)] sm:text-sm"
              >
                Save & exit
              </button>
              <div className="hidden h-4 w-px bg-black/10 sm:block" />
              <a
                href="mailto:support@itender.com?subject=Business%20onboarding%20help"
                className="hidden text-sm font-semibold text-black/55 transition hover:text-[var(--scout-ink)] sm:inline"
              >
                Need help?
              </a>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {completed ? (
              <CompletionScreen
                brandName={form.brandName.trim() || "Your brand"}
                isEditing={isEditing}
                onDashboard={() => router.push("/dashboard")}
              />
            ) : (
              <div
                key={step}
                style={{ "--dir": direction } as CSSProperties}
                className="scout-onboarding-step-in mx-auto max-w-[680px] px-5 py-10 sm:px-10 md:mx-0 lg:px-14 lg:py-12"
              >
                <h1 className="m-0 font-serif text-4xl font-normal leading-tight text-[var(--scout-ink)] sm:text-[38px]">
                  {step === 0 ? (
                    <>
                      Tell us about{" "}
                      <em className="font-serif text-[var(--scout-coral)]">your brand</em>.
                    </>
                  ) : (
                    <>
                      What is your brand{" "}
                      <em className="font-serif text-[var(--scout-coral)]">about</em>?
                    </>
                  )}
                </h1>
                <p className="mt-3 max-w-[480px] text-[15px] leading-7 text-black/55">
                  {step === 0
                    ? "These basics help us match you with creators in your space."
                    : "Give creators a sense of your values, voice, and the content you love."}
                </p>

                <div className="mt-8">
                  {step === 0 ? (
                    <BrandBasicsStep
                      form={form}
                      logoPreview={logoPreview}
                      logoInputRef={logoInputRef}
                      onLogoChange={handleLogoChange}
                      set={set}
                    />
                  ) : (
                    <BrandStoryStep form={form} set={set} />
                  )}
                </div>

                {error ? (
                  <p className="mt-5 rounded-xl border border-[var(--scout-coral)]/25 bg-[var(--scout-coral)]/10 px-4 py-3 text-sm font-medium text-[var(--scout-coral)]">
                    {error}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {!completed ? (
            <div className="flex items-center gap-3 border-t border-black/10 bg-[var(--scout-cream)] px-5 py-5 sm:px-10 lg:px-14">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setDirection(-1);
                    setStep(0);
                  }}
                  className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold transition hover:border-black/30 hover:bg-black/[0.03] active:scale-[0.98]"
                >
                  Back
                </button>
              ) : null}
              <div className="flex-1" />
              <div className="hidden font-mono text-[11px] text-black/40 sm:block">{email}</div>
              <button
                type="button"
                onClick={step === 0 ? handleNextStep : handleSubmit}
                disabled={saving}
                className="min-h-12 min-w-[180px] rounded-xl border-2 border-[var(--scout-ink)] bg-[var(--scout-lime)] px-6 py-3 text-sm font-bold text-[var(--scout-ink)] shadow-[4px_4px_0_var(--scout-ink)] transition hover:bg-[var(--scout-lime-deep)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--scout-ink)] disabled:pointer-events-none disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : step === 0
                    ? "Continue ->"
                    : isEditing
                      ? "Save changes ->"
                      : "Create your profile ->"}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function BrandBasicsStep({
  form,
  logoPreview,
  logoInputRef,
  onLogoChange,
  set,
}: {
  form: FormData;
  logoPreview: string | null;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  onLogoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  set: (key: keyof FormData, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-[11px] font-bold uppercase text-[var(--scout-ink)]">Brand logo</div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-black/20 bg-white transition hover:border-[var(--scout-ink)]"
            aria-label={logoPreview ? "Change brand logo" : "Upload brand logo"}
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
            ) : (
              <PlusIcon />
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-black/30 hover:bg-black/[0.03]"
            >
              {logoPreview ? "Change logo" : "Upload logo"}
            </button>
            <p className="mt-2 text-xs text-black/40">Optional - JPG, PNG, WEBP</p>
          </div>
        </div>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
      </div>

      <FormField label="Business name" required>
        <input
          type="text"
          value={form.brandName}
          onChange={(e) => set("brandName", e.target.value)}
          placeholder="e.g. Bloom Cafe"
          className={fieldClassName}
        />
      </FormField>

      <FormField label="Industry" required>
        <select value={form.industry} onChange={(e) => set("industry", e.target.value)} className={fieldClassName}>
          <option value="" disabled>
            Select your industry...
          </option>
          {INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="City" required>
          <input
            type="text"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="e.g. Toronto"
            className={fieldClassName}
          />
        </FormField>

        <FormField label="Website URL">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[13px] font-medium text-black/40">
              https://
            </span>
            <input
              type="text"
              inputMode="url"
              value={form.websiteUrl}
              onChange={(e) => set("websiteUrl", stripWebsiteProtocol(e.target.value))}
              placeholder="yourbrand.com"
              className={`${fieldClassName} pl-16`}
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}

function BrandStoryStep({ form, set }: { form: FormData; set: (key: keyof FormData, value: string) => void }) {
  const count = form.brandValues.length;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <label className="text-[11px] font-bold uppercase text-[var(--scout-ink)]">
            Brand bio <span className="text-[var(--scout-coral)]">*</span>
          </label>
          <span className={`font-mono text-xs font-medium ${count > 1000 ? "text-[var(--scout-coral)]" : "text-black/40"}`}>
            {count} / 1000
          </span>
        </div>
        <textarea
          value={form.brandValues}
          onChange={(e) => set("brandValues", e.target.value)}
          rows={9}
          placeholder="Tell creators what your brand is about - your values, vibe, the kind of content you're looking for, and what makes working with you exciting."
          className={`${fieldClassName} min-h-[220px] resize-none leading-7`}
        />
      </div>

      <div className="overflow-hidden rounded-[14px] bg-[var(--scout-ink)] p-4 text-white">
        <div className="mb-2 flex items-center gap-2">
          <SparkIcon />
          <div className="text-[11px] font-bold uppercase text-[var(--scout-lime)]">Need inspiration?</div>
        </div>
        <p className="text-sm leading-6 text-white/75">
          Mention your founding story, who you make things for, the look and feel you want, and any creators or
          brands you admire.
        </p>
      </div>
    </div>
  );
}

function BrandPanel({ current, isEditing }: { current: number; isEditing: boolean }) {
  return (
    <aside className="relative flex min-h-[430px] overflow-hidden bg-[var(--scout-ink)] px-6 py-8 text-white sm:px-10 md:min-h-screen md:w-[360px] md:shrink-0 md:flex-col md:px-8 md:py-10 lg:w-[460px] lg:px-11">
      <ParticleShowlight />

      <div className="relative z-10 flex w-full flex-col">
        <div>
          <ITenderLogo />
          <div className="ml-[38px] mt-1 font-mono text-[11px] font-medium uppercase text-white/35">For Business</div>
        </div>

        <div className="mt-9 lg:mt-16">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase text-[var(--scout-lime)]">
            -&gt; {isEditing ? "Brand profile" : "New brand setup"}
          </div>
          <h2 className="m-0 font-serif text-[42px] font-normal leading-none text-white">
            Make creators
            <br />
            <em className="font-serif text-[var(--scout-lime)]">fall</em> for
            <br />
            your brand.
          </h2>
          <p className="mt-5 max-w-[330px] text-sm leading-6 text-white/65">
            Two minutes to set up. Then iTender lines up creators in your city who actually fit your vibe.
          </p>
        </div>

        <ol className="mt-8 grid gap-3 p-0 lg:flex lg:flex-col lg:gap-1">
          {STEPS.map((item, index) => {
            const active = index === current;
            const done = index < current;

            return (
              <li key={item.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                      done
                        ? "bg-[var(--scout-lime)] text-[var(--scout-ink)]"
                        : active
                          ? "bg-white text-[var(--scout-ink)]"
                          : "border border-white/15 text-white/35"
                    }`}
                  >
                    {done ? <CheckIcon /> : index + 1}
                  </span>
                  {index < STEPS.length - 1 ? (
                    <span className={`mt-1 hidden h-6 w-px lg:block ${done ? "bg-[var(--scout-lime)]" : "bg-white/10"}`} />
                  ) : null}
                </div>
                <div className="pt-1">
                  <div className={`text-sm font-semibold ${active || done ? "text-white" : "text-white/35"}`}>{item.label}</div>
                  <div className="mt-0.5 text-xs text-white/35">{item.sub}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="hidden flex-1 lg:block" />

        <div className="mt-8 hidden flex-wrap gap-2 sm:flex">
          {[
            ["12k+", "creators"],
            ["140+", "cities"],
            ["48hr", "avg match"],
          ].map(([value, label]) => (
            <div key={label} className="inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
              <span className="font-mono text-[13px] font-semibold text-white">{value}</span>
              <span className="text-[11px] text-white/65">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 hidden rounded-[14px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:block">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-white bg-[linear-gradient(135deg,#FF5A4D,#D4FF3F)]" />
            <div>
              <div className="text-xs font-semibold text-white">Maya Okafor</div>
              <div className="text-[11px] text-white/35">Founder, Bloom Cafe - Toronto</div>
            </div>
            <div className="flex-1" />
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <StarIcon key={i} />
              ))}
            </div>
          </div>
          <p className="font-serif text-[15px] italic leading-6 text-white">
            &quot;Found three creators in our city in a week. Our launch hit 2M views.&quot;
          </p>
        </div>
      </div>
    </aside>
  );
}

function CompletionScreen({
  brandName,
  isEditing,
  onDashboard,
}: {
  brandName: string;
  isEditing: boolean;
  onDashboard: () => void;
}) {
  return (
    <div className="scout-onboarding-step-in flex max-w-[560px] flex-col items-start px-5 py-16 sm:px-10 lg:px-14 lg:py-20">
      <div className="mb-8 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-[var(--scout-ink)] bg-[var(--scout-lime)] shadow-[6px_6px_0_var(--scout-ink)]">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <path d="M9 18.5L15 24.5L27 12.5" stroke="#0E0E0C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="m-0 font-serif text-[38px] font-normal leading-tight text-[var(--scout-ink)]">
        {brandName} is {isEditing ? "updated" : "ready"}
        <br />
        to meet <em className="font-serif text-[var(--scout-coral)]">creators</em>.
      </h1>
      <p className="mt-4 max-w-[440px] text-[15px] leading-7 text-black/55">
        Your profile is live. Browse creators in your city or post your first brief, and iTender will surface
        matches as they roll in.
      </p>
      <button
        type="button"
        onClick={onDashboard}
        className="mt-8 rounded-xl border-2 border-[var(--scout-ink)] bg-[var(--scout-lime)] px-6 py-3 text-sm font-bold text-[var(--scout-ink)] shadow-[4px_4px_0_var(--scout-ink)] transition hover:bg-[var(--scout-lime-deep)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--scout-ink)]"
      >
        Go to dashboard -&gt;
      </button>
    </div>
  );
}

function ConfettiBurst({ trigger }: { trigger: number }) {
  const pieces = useMemo(() => {
    if (!trigger) return [];
    const colors = ["#D4FF3F", "#FF5A4D", "#7B5FFF", "#B8D4FF", "#FFB800", "#0E0E0C"];
    return Array.from({ length: 70 }, (_, index) => ({
      id: `${trigger}-${index}`,
      color: colors[index % colors.length],
      x: Math.round(seededUnit(trigger * 101 + index * 13) * 560 - 280),
      y: Math.round(seededUnit(trigger * 103 + index * 17) * 300 - 240),
      rotate: Math.round(seededUnit(trigger * 107 + index * 19) * 720 - 360),
      delay: index * 8,
      width: 6 + seededUnit(trigger * 109 + index * 23) * 6,
      height: 10 + seededUnit(trigger * 113 + index * 29) * 8,
    }));
  }, [trigger]);

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="scout-confetti-piece absolute left-1/2 top-1/2 block rounded-sm"
          style={
            {
              "--tx": `${piece.x}px`,
              "--ty": `${piece.y}px`,
              "--rot": `${piece.rotate}deg`,
              animationDelay: `${piece.delay}ms`,
              backgroundColor: piece.color,
              width: piece.width,
              height: piece.height,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function seededUnit(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function ParticleShowlight() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let observer: ResizeObserver | null = null;
    let cleanupPixi: (() => void) | null = null;

    async function start() {
      const currentHost = hostRef.current;
      if (!currentHost) return;

      const PIXI = await import("pixi.js");
      if (disposed || !hostRef.current) return;

      const rect = currentHost.getBoundingClientRect();
      let sceneWidth = Math.max(1, Math.round(rect.width));
      let sceneHeight = Math.max(1, Math.round(rect.height));
      const resolution = Math.min(window.devicePixelRatio || 1, 2);

      const app = new PIXI.Application();
      await app.init({
        width: sceneWidth,
        height: sceneHeight,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution,
        preference: "webgl",
      });

      if (disposed || !hostRef.current) {
        app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
        return;
      }

      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.display = "block";
      currentHost.innerHTML = "";
      currentHost.appendChild(app.canvas);

      const makeGradTex = (hex: string, opacity = 1) => {
        const c = document.createElement("canvas");
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext("2d");
        if (!ctx) return PIXI.Texture.EMPTY;
        const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        const op = Math.round(opacity * 255).toString(16).padStart(2, "0");
        g.addColorStop(0, hex + op);
        g.addColorStop(0.5, hex + "44");
        g.addColorStop(1, hex + "00");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 256);
        return PIXI.Texture.from(c);
      };

      const palettes = [
        { hex: "#D4FF3F", weight: 4 },
        { hex: "#FF5A4D", weight: 1 },
        { hex: "#7B5FFF", weight: 2 },
        { hex: "#B8D4FF", weight: 2 },
        { hex: "#00E5CC", weight: 1 },
      ];
      const weighted = palettes.flatMap((palette) => Array(palette.weight).fill(palette.hex));

      const blobs: PixiBlob[] = [];
      for (let i = 0; i < 12; i += 1) {
        const tex = makeGradTex(weighted[i % weighted.length]);
        const sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5);
        const size = 220 + Math.random() * 260;
        sprite.width = size;
        sprite.height = size;
        sprite.x = Math.random() * sceneWidth;
        sprite.y = Math.random() * sceneHeight;
        sprite.alpha = 0.1 + Math.random() * 0.14;
        sprite.blendMode = "screen";
        app.stage.addChild(sprite);
        blobs.push({
          sprite,
          baseX: sprite.x,
          baseY: sprite.y,
          ax: 50 + Math.random() * 100,
          ay: 40 + Math.random() * 70,
          sx: 0.0003 + Math.random() * 0.0005,
          sy: 0.0004 + Math.random() * 0.0006,
          phase: Math.random() * Math.PI * 2,
          baseAlpha: sprite.alpha,
          pulse: 0.5 + Math.random() * 1,
        });
      }

      const stars: PixiStar[] = [];
      for (let i = 0; i < 40; i += 1) {
        const g = new PIXI.Graphics();
        const isAccent = Math.random() < 0.15;
        g.beginFill(isAccent ? 0xd4ff3f : 0xffffff, 1);
        g.drawCircle(0, 0, isAccent ? 1.6 : 1);
        g.endFill();
        g.x = Math.random() * sceneWidth;
        g.y = Math.random() * sceneHeight;
        g.alpha = 0;
        app.stage.addChild(g);
        stars.push({
          g,
          phase: Math.random() * Math.PI * 2,
          sp: 0.4 + Math.random() * 1.4,
          max: 0.4 + Math.random() * 0.5,
        });
      }

      let elapsed = 0;
      const tick = (ticker: { deltaTime: number }) => {
        elapsed += ticker.deltaTime;
        blobs.forEach((blob) => {
          blob.sprite.x = blob.baseX + Math.sin(elapsed * blob.sx + blob.phase) * blob.ax;
          blob.sprite.y = blob.baseY + Math.cos(elapsed * blob.sy + blob.phase * 1.3) * blob.ay;
          blob.sprite.alpha = blob.baseAlpha + Math.sin(elapsed * 0.02 * blob.pulse + blob.phase) * 0.06;
        });
        stars.forEach((star) => {
          star.g.alpha = Math.max(0, Math.sin(elapsed * 0.025 * star.sp + star.phase)) * star.max;
        });
      };

      app.ticker.add(tick);

      observer = new ResizeObserver(([entry]) => {
        const nextWidth = Math.max(1, Math.round(entry.contentRect.width));
        const nextHeight = Math.max(1, Math.round(entry.contentRect.height));
        if (nextWidth === sceneWidth && nextHeight === sceneHeight) return;

        const sx = nextWidth / sceneWidth;
        const sy = nextHeight / sceneHeight;
        app.renderer.resize(nextWidth, nextHeight, resolution);
        blobs.forEach((blob) => {
          blob.baseX *= sx;
          blob.baseY *= sy;
          blob.sprite.x *= sx;
          blob.sprite.y *= sy;
        });
        stars.forEach((star) => {
          star.g.x *= sx;
          star.g.y *= sy;
        });
        sceneWidth = nextWidth;
        sceneHeight = nextHeight;
      });
      observer.observe(currentHost);

      cleanupPixi = () => {
        observer?.disconnect();
        app.ticker.remove(tick);
        app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true });
      };
    }

    start().catch((error: unknown) => {
      console.error("[onboarding] Pixi showlight failed:", error);
    });

    return () => {
      disposed = true;
      cleanupPixi?.();
    };
  }, []);

  return <div ref={hostRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true" />;
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase text-[var(--scout-ink)]">
        {label} {required ? <span className="text-[var(--scout-coral)]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

const fieldClassName =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm text-[var(--scout-ink)] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-[var(--scout-ink)] focus:shadow-[0_0_0_4px_rgba(212,255,63,0.45)]";

function ITenderLogo() {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M14 4L16.5 11.5L24 14L16.5 16.5L14 24L11.5 16.5L4 14L11.5 11.5L14 4Z"
            fill="var(--scout-lime)"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-serif text-2xl italic leading-none text-white">iTender</span>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 6V22M6 14H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6L4.75 8.25L9.5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z" fill="var(--scout-lime)" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M6.5 1L8.18 4.4L12 4.95L9.25 7.6L9.86 11.4L6.5 9.6L3.14 11.4L3.75 7.6L1 4.95L4.82 4.4L6.5 1Z"
        fill="var(--scout-lime)"
      />
    </svg>
  );
}
