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

type FormData = {
  title: string;
  description: string;
  compensationType: string;
  compensationDetails: string;
  creatorsNeeded: string;
  deadline: string;
};

const STEP_TITLES = ["Campaign basics", "Description & materials", "Compensation & timing"];
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

      router.push("/dashboard");
    } catch (e) {
      console.error("[campaigns/new] unexpected error:", e);
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
          {STEP_TITLES[step]}
        </h1>
        <p className="mt-2 text-sm text-ink/55">{STEP_SUBTITLES[step]}</p>
        <div className="mt-6 flex items-center gap-2">
          <div className="h-1.5 w-8 rounded-full bg-moss" />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? "bg-moss" : "bg-black/10"}`} />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? "bg-moss" : "bg-black/10"}`} />
        </div>
      </div>

      {/* Step content */}
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

      {/* Error */}
      {error ? (
        <p className="mt-4 rounded-2xl border border-coral/20 bg-coral/[0.06] px-4 py-3 text-sm text-coral">
          {error}
        </p>
      ) : null}

      {/* Navigation */}
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

        {step < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-2xl bg-moss px-5 py-3 text-sm font-bold text-white transition hover:bg-moss/90 active:scale-[0.98]"
          >
            Continue →
          </button>
        ) : coupon.status === "valid" && coupon.discount === 100 ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-2xl bg-moss px-5 py-3 text-sm font-bold text-white transition hover:bg-moss/90 active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Publishing…" : "Publish Campaign"}
          </button>
        ) : (
          <div className="flex flex-1 flex-col items-stretch gap-1.5">
            <button
              type="button"
              disabled
              className="flex-1 cursor-not-allowed rounded-2xl bg-black/10 px-5 py-3 text-sm font-bold text-ink/30"
            >
              Complete Payment
            </button>
            <p className="text-center text-xs text-ink/40">
              Payment integration coming soon — apply a 100% coupon to publish now
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
