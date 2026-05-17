"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { DOC_MIME_TYPES } from "@/lib/campaign-constants";
import { FILE_SIZE_LIMITS } from "@/lib/app-config";
import { addDays } from "@/lib/dates";
import { Step1Fields } from "./steps/step-1-fields";
import { Step2Fields } from "./steps/step-2-fields";
import { Step3Fields, type CouponState } from "./steps/step-3-fields";
import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { Spinner } from "@/components/ui/spinner";

type FormData = {
  title: string;
  description: string;
  compensationType: string;
  compensationDetails: string;
  creatorsNeeded: string;
  deadline: string;
};

const CAMPAIGN_STEPS = [
  { label: "Campaign basics", sub: "Title & content types" },
  { label: "Brief & materials", sub: "Description & uploads" },
  { label: "Compensation", sub: "Budget, timing & launch" },
];

const STEP_HEADINGS = [
  <>Campaign <em className="text-[var(--color-text-muted)]">basics</em>.</>,
  <>Brief & <em className="text-[var(--color-text-muted)]">materials</em>.</>,
  <>Compensation & <em className="text-[var(--color-text-muted)]">launch</em>.</>,
];

const STEP_SUBTITLES = [
  "Give your campaign a title and tell us what content you need.",
  "Describe what creators should make and share any reference materials.",
  "Set your budget type, creator count, and deadline.",
];

export function CampaignBuilderForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponState>({ status: "idle" });

  const [selectedContentTypes, setSelectedContentTypes] = useState<Set<string>>(new Set());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    compensationType: "paid",
    compensationDetails: "",
    creatorsNeeded: "1",
    deadline: addDays(14),
  });

  function setField(key: keyof FormData, value: string) {
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
    if (file.size > FILE_SIZE_LIMITS.image) {
      setError("Moodboard image must be under 5 MB.");
      e.target.value = "";
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > FILE_SIZE_LIMITS.doc) {
      setError("Reference document must be under 15 MB.");
      e.target.value = "";
      return;
    }
    setError(null);
    setDocFile(file);
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.title.trim()) return "Please enter a campaign title.";
      if (form.title.trim().length > 80) return "Title must be under 80 characters.";
      if (selectedContentTypes.size === 0) return "Please select at least one content type.";
    }
    if (step === 1) {
      if (!form.description.trim()) return "Please enter a campaign description.";
      if (form.description.length > 1000) return "Description must be under 1000 characters.";
    }
    return null;
  }

  function handleNext() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCoupon({ status: "validating" });
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (json.valid) {
        setCoupon({ status: "valid", discount: json.discount });
      } else {
        setCoupon({ status: "invalid", message: json.error ?? "Invalid code" });
      }
    } catch {
      setCoupon({ status: "invalid", message: "Could not validate code. Try again." });
    }
  }

  async function handleSubmit() {
    setError(null);
    setSaving(true);

    try {
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

      const appliedCode = coupon.status === "valid" ? couponInput.trim().toUpperCase() : null;

      const { data: inserted, error: insertError } = await supabase
        .from("campaigns")
        .insert({
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
          coupon_code: appliedCode,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("[campaigns/new] insert error:", insertError?.code, insertError?.message);
        setError("Something went wrong creating your campaign. Please try again.");
        setSaving(false);
        return;
      }

      if (appliedCode) {
        await fetch("/api/redeem-coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: appliedCode, campaignId: inserted.id }),
        });
      }

      setPublished(true);
      setConfettiKey((k) => k + 1);
      setTimeout(() => router.push("/dashboard"), 2600);
    } catch (e) {
      console.error("[campaigns/new] unexpected error:", e);
      setError("An unexpected error occurred. Please try again.");
      setSaving(false);
    }
  }

  const isLastStep = step === 2;
  const canPublish = coupon.status === "valid" && coupon.discount === 100;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row">
      <CampaignPanel currentStep={step} campaignTitle={form.title} />

      <section className="relative flex flex-1 flex-col glass">
        {/* â”€â”€ Published success overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {published ? (
          <div className="scout-onboarding-step-in absolute inset-0 z-20 flex flex-col items-center justify-center glass px-8 text-center">
            <ConfettiBurst trigger={confettiKey} />
            <div className="relative z-10">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full glass text-4xl">
                ðŸŽ‰
              </div>
              <h2 className="font-display text-3xl font-bold text-[var(--color-text)]">Campaign is live!</h2>
              <p className="mt-3 max-w-xs text-base text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text)]">{form.title}</span> is now visible to creators on iTender.
              </p>
              <p className="mt-6 text-sm text-[var(--color-text-hint)]">Redirecting to dashboardâ€¦</p>
            </div>
          </div>
        ) : null}

        {/* Step counter header */}
        <div className="flex h-14 items-center justify-between border-b border-white/[0.08] px-5 sm:px-9">
          <div className="font-mono text-[11px] font-semibold uppercase text-black/40">
            Step{" "}
            <span className="text-[var(--color-text)]">{String(step + 1).padStart(2, "0")}</span>
            <span className="text-black/35"> / {String(CAMPAIGN_STEPS.length).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-xs font-semibold text-black/55 transition hover:text-[var(--color-text)] sm:text-sm"
            >
              Save & exit
            </button>
            <div className="hidden h-4 w-px bg-black/10 sm:block" />
            <a
              href="mailto:support@itender.com?subject=Campaign%20help"
              className="hidden text-sm font-semibold text-black/55 transition hover:text-[var(--color-text)] sm:inline"
            >
              Need help?
            </a>
          </div>
        </div>

        {/* Step content */}
        <div className="relative flex-1 overflow-auto">
          <div
            key={step}
            className="scout-onboarding-step-in mx-auto max-w-[620px] px-5 py-10 sm:px-10 md:mx-0 lg:px-12 lg:py-12"
          >
            <h1 className="font-display text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-[34px]">
              {STEP_HEADINGS[step]}
            </h1>
            <p className="mt-3 max-w-[460px] text-[15px] leading-7 text-black/55">
              {STEP_SUBTITLES[step]}
            </p>

            <div className="mt-8">
              {step === 0 ? (
                <Step1Fields
                  title={form.title}
                  selectedContentTypes={selectedContentTypes}
                  onTitleChange={(v) => setField("title", v)}
                  onTitleKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
                  onToggleContentType={toggleContentType}
                />
              ) : null}

              {step === 1 ? (
                <Step2Fields
                  description={form.description}
                  imagePreview={imagePreview}
                  docFile={docFile}
                  onDescriptionChange={(v) => setField("description", v)}
                  onImageChange={handleImageChange}
                  onDocChange={handleDocChange}
                  onRemoveDoc={() => setDocFile(null)}
                />
              ) : null}

              {step === 2 ? (
                <Step3Fields
                  compensationType={form.compensationType}
                  compensationDetails={form.compensationDetails}
                  creatorsNeeded={form.creatorsNeeded}
                  deadline={form.deadline}
                  couponInput={couponInput}
                  coupon={coupon}
                  setField={setField}
                  onCouponInputChange={(v) => {
                    setCouponInput(v);
                    if (coupon.status !== "idle") setCoupon({ status: "idle" });
                  }}
                  onApplyCoupon={handleApplyCoupon}
                  onCreatorsNeededKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                />
              ) : null}
            </div>

            {error ? (
              <p className="mt-5 rounded-xl border border-error/25 bg-error/10 px-4 py-3 text-sm font-medium text-error">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center gap-3 border-t border-white/[0.12] glass px-5 py-5 sm:px-10 lg:px-12">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => { setError(null); setStep((s) => s - 1); }}
              className="rounded-xl border border-white/[0.12] glass px-5 py-3 text-sm font-semibold transition hover:border-white/[0.12] hover:bg-black/[0.03] active:scale-[0.98]"
            >
              Back
            </button>
          ) : null}
          <div className="flex-1" />

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="min-h-12 min-w-[160px] rounded-xl bg-[var(--color-text)] px-6 py-3 text-sm font-bold text-slate-950 transition hover:opacity-90 active:scale-[0.98]"
            >
              Continue -&gt;
            </button>
          ) : canPublish ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="min-h-12 min-w-[160px] rounded-xl bg-[var(--color-text)] px-6 py-3 text-sm font-bold text-slate-950 transition hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
            >
              {saving ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" />Publishingâ€¦</span> : "Publish Campaign ->"}
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1.5">
              <button
                type="button"
                disabled
                className="min-h-12 cursor-not-allowed rounded-xl bg-black/10 px-6 py-3 text-sm font-bold text-[var(--color-text-muted)]"
              >
                Complete Payment
              </button>
              <p className="text-right text-xs text-[var(--color-text-muted)]">
                Apply a 100% coupon to publish now
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const PANEL_STEPS = [
  { label: "Campaign basics", sub: "Title & content types" },
  { label: "Brief & materials", sub: "Description & uploads" },
  { label: "Compensation", sub: "Budget, timing & launch" },
];

function CampaignPanel({ currentStep, campaignTitle }: { currentStep: number; campaignTitle: string }) {
  return (
    <aside
      className="relative flex min-h-[360px] overflow-hidden px-6 py-8 text-white sm:px-10 md:min-h-screen md:w-[340px] md:shrink-0 md:flex-col md:px-8 md:py-10 lg:w-[420px] lg:px-11"
      style={{ background: "linear-gradient(145deg, #07070E 0%, #0F0F1A 60%, #161628 100%)" }}
    >
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-1/4 h-[380px] w-[380px] rounded-full bg-fuchsia-500/[0.08] blur-[100px]" />
        <div className="absolute right-0 top-1/2 h-[300px] w-[300px] rounded-full bg-fuchsia-400/[0.06] blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-[240px] w-[240px] rounded-full bg-teal/[0.07] blur-[80px]" />
      </div>

      <div className="relative z-10 flex w-full flex-col">
        {/* Logo */}
        <div>
          <PanelLogo />
          <div className="ml-[38px] mt-1 font-mono text-[11px] font-medium uppercase text-white/35">
            Campaign Creator
          </div>
        </div>

        {/* Heading */}
        <div className="mt-9 lg:mt-16">
          <div className="mb-3 font-mono text-[11px] font-semibold uppercase text-[var(--color-text-muted)]">
            -&gt; New campaign
          </div>
          <h2 className="font-display text-[36px] font-bold leading-none text-white">
            Launch a campaign
            <br />
            creators <em className="text-[var(--color-text-muted)]">want</em>
            <br />
            to join.
          </h2>
          <p className="mt-5 max-w-[300px] text-sm leading-6 text-white/65">
            Set your brief once. iTender matches you with creators in your city who are ready to apply.
          </p>
        </div>

        {/* Step list */}
        <ol className="mt-8 grid gap-3 p-0 lg:flex lg:flex-col lg:gap-1">
          {PANEL_STEPS.map((item, index) => {
            const active = index === currentStep;
            const done = index < currentStep;
            return (
              <li key={item.label} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                      done
                        ? "bg-[var(--color-text)] text-slate-950"
                        : active
                          ? "glass text-[var(--color-text)]"
                          : "border border-white/15 text-white/35"
                    }`}
                  >
                    {done ? <PanelCheckIcon /> : index + 1}
                  </span>
                  {index < PANEL_STEPS.length - 1 ? (
                    <span
                      className={`mt-1 hidden h-6 w-px lg:block ${done ? "bg-[var(--color-text)]" : "bg-white/10"}`}
                    />
                  ) : null}
                </div>
                <div className="pt-1">
                  <div className={`text-sm font-semibold ${active || done ? "text-white" : "text-white/35"}`}>
                    {item.label}
                  </div>
                  <div className="mt-0.5 text-xs text-white/35">{item.sub}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="hidden flex-1 lg:block" />

        {/* Live preview or stats */}
        {campaignTitle.trim() ? (
          <div className="mt-8 hidden rounded-[14px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:block">
            <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase text-white/40">
              Campaign preview
            </div>
            <div className="text-sm font-semibold leading-snug text-white">
              {campaignTitle.trim()}
            </div>
          </div>
        ) : (
          <div className="mt-8 hidden flex-wrap gap-2 sm:flex">
            {[["12k+", "creators"], ["140+", "cities"], ["48hr", "avg match"]].map(([value, label]) => (
              <div
                key={label}
                className="inline-flex items-baseline gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <span className="font-mono text-[13px] font-semibold text-white">{value}</span>
                <span className="text-[11px] text-white/65">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function PanelLogo() {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M14 4L16.5 11.5L24 14L16.5 16.5L14 24L11.5 16.5L4 14L11.5 11.5L14 4Z"
            fill="#FF4566"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-2xl italic leading-none text-white">iTender</span>
    </div>
  );
}

function PanelCheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6L4.75 8.25L9.5 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}



