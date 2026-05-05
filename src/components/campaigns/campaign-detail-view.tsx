"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { CampaignDetail, InterestedCreator } from "@/app/campaigns/[id]/page";
import { createClient } from "@/utils/supabase/client";

// ── Constants ──────────────────────────────────────────────────────────────────

const CONTENT_TYPES = ["Post", "Short-form Video", "Long-form Video", "Story", "Blog / Article"];

const COMPENSATION_TYPES = [
  { value: "paid", label: "Paid", description: "Cash payment to the creator" },
  { value: "product", label: "Product or Service", description: "Free product, service, or experience" },
  { value: "paid_product", label: "Paid + Product", description: "Cash plus free product or service" },
  { value: "affiliate", label: "Affiliate", description: "% of sales the creator drives" },
  { value: "negotiable", label: "Negotiable", description: "Discuss details in chat" },
];

const COMP_LABELS: Record<string, string> = {
  paid: "Paid",
  product: "Product or Service",
  paid_product: "Paid + Product",
  affiliate: "Affiliate",
  negotiable: "Negotiable",
};

const DOC_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

const STATUS_STYLES: Record<string, string> = {
  live: "bg-moss/10 text-moss",
  draft: "bg-black/[0.06] text-ink/50",
  closed: "bg-coral/10 text-coral",
  pending: "bg-yellow-100 text-yellow-700",
};

const STATUS_LABELS: Record<string, string> = {
  live: "Live",
  draft: "Draft",
  closed: "Closed",
  pending: "Pending",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatFollowers(n: number | null): string {
  if (!n || n === 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : null;
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function daysLeft(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-black/[0.06] text-ink/50"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

type NormalizedCreator = {
  pitch: string | null;
  created_at: string;
  id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  profile_photo_url: string | null;
  bio: string | null;
  brand_categories: string[];
  instagram_handle: string | null;
  instagram_followers: number;
  tiktok_handle: string | null;
  tiktok_followers: number;
  youtube_handle: string | null;
  youtube_followers: number;
};

function CreatorCard({ creator }: { creator: NormalizedCreator }) {
  const photo = creator.profile_photo_url ?? creator.avatar_url;
  const handle = creator.instagram_handle ? `@${creator.instagram_handle}` : creator.city ?? null;
  const platforms = [
    { label: "IG", count: creator.instagram_followers },
    { label: "TK", count: creator.tiktok_followers },
    { label: "YT", count: creator.youtube_followers },
  ].filter((p) => p.count > 0);

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={creator.name} className="h-12 w-12 rounded-xl object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-coral/20 to-violet/20 text-sm font-bold text-ink/60">
              {creator.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{creator.name}</p>
          {handle ? <p className="text-xs text-ink/45">{handle}</p> : null}

          {/* Follower counts */}
          {platforms.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-2">
              {platforms.map((p) => (
                <span key={p.label} className="rounded-full bg-black/[0.05] px-2 py-0.5 text-xs font-semibold text-ink/60">
                  {p.label} {formatFollowers(p.count)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bio */}
      {creator.bio ? (
        <p className="mt-3 line-clamp-3 text-sm text-ink/60">{creator.bio}</p>
      ) : null}

      {/* Categories */}
      {creator.brand_categories.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {creator.brand_categories.map((cat) => (
            <span key={cat} className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs text-ink/55">
              {cat}
            </span>
          ))}
        </div>
      ) : null}

      {/* Pitch */}
      {creator.pitch ? (
        <div className="mt-4 rounded-xl border border-moss/20 bg-moss/[0.04] px-4 py-3">
          <p className="mb-1 text-xs font-semibold text-moss">Why they&apos;re a fit</p>
          <p className="text-sm text-ink/70">{creator.pitch}</p>
        </div>
      ) : null}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

type Props = {
  campaign: CampaignDetail;
  interestedCreators: InterestedCreator[];
  userId: string;
};

type EditForm = {
  title: string;
  description: string;
  compensationType: string;
  compensationDetails: string;
  creatorsNeeded: string;
  deadline: string;
};

export function CampaignDetailView({ campaign, interestedCreators, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Creator filter state
  const [sortBy, setSortBy] = useState<"followers" | "recent">("followers");
  const [minFollowers, setMinFollowers] = useState(0);
  const [nicheFilter, setNicheFilter] = useState("all");

  // Edit form state — refreshed from prop each time editing starts
  const [editForm, setEditForm] = useState<EditForm>({
    title: campaign.title,
    description: campaign.description,
    compensationType: campaign.compensation_type,
    compensationDetails: campaign.compensation_details ?? "",
    creatorsNeeded: String(campaign.creators_needed),
    deadline: campaign.deadline,
  });
  const [selectedContentTypes, setSelectedContentTypes] = useState<Set<string>>(
    new Set(campaign.content_types ?? []),
  );

  // Image edit state
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Doc edit state
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [docRemoved, setDocRemoved] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Normalize interested creators (handle Supabase array/object join ambiguity)
  const creators: NormalizedCreator[] = interestedCreators.map((row) => {
    const usersNode = Array.isArray(row.users) ? row.users[0] : row.users;
    const cpNode = usersNode?.creator_profiles;
    const cp = Array.isArray(cpNode) ? cpNode[0] : cpNode;
    return {
      pitch: row.pitch,
      created_at: row.created_at,
      id: usersNode?.id ?? "",
      name: usersNode?.name ?? "Unknown",
      avatar_url: usersNode?.avatar_url ?? null,
      city: usersNode?.city ?? null,
      profile_photo_url: cp?.profile_photo_url ?? null,
      bio: cp?.bio ?? null,
      brand_categories: cp?.brand_categories ?? [],
      instagram_handle: cp?.instagram_handle ?? null,
      instagram_followers: cp?.instagram_followers ?? 0,
      tiktok_handle: cp?.tiktok_handle ?? null,
      tiktok_followers: cp?.tiktok_followers ?? 0,
      youtube_handle: cp?.youtube_handle ?? null,
      youtube_followers: cp?.youtube_followers ?? 0,
    };
  });

  // Collect unique niches across all creators
  const allNiches = [...new Set(creators.flatMap((c) => c.brand_categories))].sort();

  // Apply filters and sort
  const filteredCreators = creators
    .filter((c) => {
      if (minFollowers === 0) return true;
      return Math.max(c.instagram_followers, c.tiktok_followers, c.youtube_followers) >= minFollowers;
    })
    .filter((c) => {
      if (nicheFilter === "all") return true;
      return c.brand_categories.includes(nicheFilter);
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      const totalA = a.instagram_followers + a.tiktok_followers + a.youtube_followers;
      const totalB = b.instagram_followers + b.tiktok_followers + b.youtube_followers;
      if (totalB !== totalA) return totalB - totalA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function setField(key: keyof EditForm, value: string) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleContentType(type: string) {
    setSelectedContentTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function startEditing() {
    setEditForm({
      title: campaign.title,
      description: campaign.description,
      compensationType: campaign.compensation_type,
      compensationDetails: campaign.compensation_details ?? "",
      creatorsNeeded: String(campaign.creators_needed),
      deadline: campaign.deadline,
    });
    setSelectedContentTypes(new Set(campaign.content_types ?? []));
    setNewImageFile(null);
    setNewImagePreview(null);
    setImageRemoved(false);
    setNewDocFile(null);
    setDocRemoved(false);
    setError(null);
    setEditing(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
    setImageRemoved(false);
  }

  function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewDocFile(file);
    setDocRemoved(false);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!editForm.title.trim()) { setError("Please enter a campaign title."); return; }
    if (editForm.title.trim().length > 80) { setError("Title must be under 80 characters."); return; }
    if (selectedContentTypes.size === 0) { setError("Please select at least one content type."); return; }
    if (!editForm.description.trim()) { setError("Please enter a description."); return; }
    if (editForm.description.length > 1000) { setError("Description must be under 1000 characters."); return; }

    setSaving(true);
    setError(null);

    try {
      // Handle image
      let photoUrls = campaign.photo_urls ?? [];
      const existingImageUrl = campaign.photo_urls?.[0];

      if (imageRemoved) {
        if (existingImageUrl) {
          const path = extractStoragePath(existingImageUrl, "campaign-images");
          if (path) await supabase.storage.from("campaign-images").remove([path]);
        }
        photoUrls = [];
      } else if (newImageFile) {
        if (existingImageUrl) {
          const path = extractStoragePath(existingImageUrl, "campaign-images");
          if (path) await supabase.storage.from("campaign-images").remove([path]);
        }
        const ext = newImageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const uploadPath = `${userId}/${Date.now()}.${ext}`;
        const { error: imgErr } = await supabase.storage
          .from("campaign-images")
          .upload(uploadPath, newImageFile, { upsert: true });
        if (!imgErr) {
          photoUrls = [supabase.storage.from("campaign-images").getPublicUrl(uploadPath).data.publicUrl];
        } else {
          console.error("[campaigns/edit] image upload error:", imgErr.message);
        }
      }

      // Handle doc
      let referenceDocUrl = campaign.reference_doc_url;
      let referenceDocName = campaign.reference_doc_name;

      if (docRemoved) {
        if (campaign.reference_doc_url) {
          const path = extractStoragePath(campaign.reference_doc_url, "campaign-images");
          if (path) await supabase.storage.from("campaign-images").remove([path]);
        }
        referenceDocUrl = null;
        referenceDocName = null;
      } else if (newDocFile) {
        if (campaign.reference_doc_url) {
          const path = extractStoragePath(campaign.reference_doc_url, "campaign-images");
          if (path) await supabase.storage.from("campaign-images").remove([path]);
        }
        const ext = newDocFile.name.split(".").pop()?.toLowerCase() ?? "pdf";
        const uploadPath = `${userId}/${Date.now()}-doc.${ext}`;
        const { error: docErr } = await supabase.storage
          .from("campaign-images")
          .upload(uploadPath, newDocFile, {
            upsert: true,
            contentType: DOC_MIME_TYPES[ext] ?? "application/octet-stream",
          });
        if (!docErr) {
          referenceDocUrl = supabase.storage.from("campaign-images").getPublicUrl(uploadPath).data.publicUrl;
          referenceDocName = newDocFile.name;
        } else {
          console.error("[campaigns/edit] doc upload error:", docErr.message);
        }
      }

      // Update campaign row
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({
          title: editForm.title.trim(),
          content_types: [...selectedContentTypes],
          description: editForm.description.trim(),
          photo_urls: photoUrls,
          reference_doc_url: referenceDocUrl,
          reference_doc_name: referenceDocName,
          compensation_type: editForm.compensationType,
          compensation_details: editForm.compensationDetails.trim() || null,
          creators_needed: Math.max(1, parseInt(editForm.creatorsNeeded, 10) || 1),
          deadline: editForm.deadline,
        })
        .eq("id", campaign.id);

      if (updateError) {
        console.error("[campaigns/edit] update error:", updateError.code, updateError.message);
        setError("Something went wrong saving your changes. Please try again.");
        setSaving(false);
        return;
      }

      router.refresh();
      setEditing(false);
    } catch (e) {
      console.error("[campaigns/edit] unexpected error:", e);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Close ─────────────────────────────────────────────────────────────────────

  async function handleClose() {
    setSaving(true);
    try {
      const { error: closeError } = await supabase
        .from("campaigns")
        .update({ status: "closed" })
        .eq("id", campaign.id);

      if (closeError) {
        console.error("[campaigns/close] error:", closeError.message);
        setClosing(false);
        setSaving(false);
        return;
      }

      router.push("/dashboard");
    } catch (e) {
      console.error("[campaigns/close] unexpected error:", e);
      setClosing(false);
      setSaving(false);
    }
  }

  // ── Derived view values ───────────────────────────────────────────────────────

  const left = daysLeft(campaign.deadline);
  const isExpired = left === 0 && campaign.status === "live";
  const currentImageUrl = campaign.photo_urls?.[0] ?? null;

  // In edit mode, which image to preview?
  const editImageSrc = imageRemoved
    ? null
    : newImagePreview ?? currentImageUrl;

  // In edit mode, which doc to show?
  const editDocName = docRemoved ? null : newDocFile?.name ?? campaign.reference_doc_name;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Close confirmation dialog */}
      {/* Image lightbox */}
      {lightboxOpen && currentImageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImageUrl}
            alt="Campaign moodboard"
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>
      ) : null}

      {closing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">Close campaign?</h2>
            <p className="mt-2 text-sm text-ink/55">
              This will stop new creators from seeing it. Existing matches are not affected.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setClosing(false)}
                disabled={saving}
                className="flex-1 rounded-2xl border border-black/10 py-3 text-sm font-semibold text-ink transition hover:bg-black/[0.03] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="flex-1 rounded-2xl bg-coral py-3 text-sm font-bold text-white transition hover:bg-coral/90 disabled:opacity-60"
              >
                {saving ? "Closing…" : "Close it"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 transition hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          All Campaigns
        </Link>

        {editing ? (
          /* ── EDIT MODE ─────────────────────────────────────────────────────── */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-semibold text-ink">Edit Campaign</h1>
              <button
                type="button"
                onClick={() => { setEditing(false); setError(null); }}
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink/60 transition hover:text-ink"
              >
                Cancel
              </button>
            </div>

            {/* Title */}
            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Campaign title <span className="text-coral">*</span></span>
                <span className={`text-xs font-medium ${editForm.title.length > 80 ? "text-coral" : "text-ink/40"}`}>
                  {editForm.title.length} / 80
                </span>
              </div>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setField("title", e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
              />
            </label>

            {/* Content types */}
            <div>
              <p className="mb-3 text-sm font-semibold text-ink">Content types <span className="text-coral">*</span></p>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((type) => {
                  const selected = selectedContentTypes.has(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleContentType(type)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selected ? "border-moss bg-moss text-white" : "border-black/10 bg-white text-ink hover:border-moss/40"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Description <span className="text-coral">*</span></span>
                <span className={`text-xs font-medium ${editForm.description.length > 1000 ? "text-coral" : "text-ink/40"}`}>
                  {editForm.description.length} / 1000
                </span>
              </div>
              <textarea
                value={editForm.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={6}
                className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
              />
            </div>

            {/* Moodboard image */}
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">
                Moodboard image <span className="font-normal text-ink/35">· Optional</span>
              </p>
              <div className="flex items-center gap-4">
                {editImageSrc ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editImageSrc} alt="Moodboard" className="h-full w-full object-cover" />
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
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
                  >
                    {editImageSrc ? "Change image" : "Upload image"}
                  </button>
                  {editImageSrc ? (
                    <button
                      type="button"
                      onClick={() => { setImageRemoved(true); setNewImageFile(null); setNewImagePreview(null); }}
                      className="text-xs text-ink/40 transition hover:text-coral"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="mt-1.5 text-xs text-ink/40">JPG, PNG, WEBP</p>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Reference doc */}
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
                  {editDocName ?? "Upload document"}
                </button>
                {editDocName ? (
                  <button
                    type="button"
                    onClick={() => { setDocRemoved(true); setNewDocFile(null); }}
                    className="text-xs text-ink/40 transition hover:text-coral"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <p className="mt-1.5 text-xs text-ink/40">PDF, DOCX, DOC</p>
              <input ref={docInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleDocChange} />
            </div>

            {/* Compensation type */}
            <div>
              <p className="mb-3 text-sm font-semibold text-ink">Compensation type <span className="text-coral">*</span></p>
              <div className="space-y-2">
                {COMPENSATION_TYPES.map((ct) => {
                  const selected = editForm.compensationType === ct.value;
                  return (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => setField("compensationType", ct.value)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        selected ? "border-moss bg-moss/[0.04]" : "border-black/10 bg-white hover:border-black/20"
                      }`}
                    >
                      <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${selected ? "border-moss bg-moss" : "border-black/25"}`} />
                      <div>
                        <p className="text-sm font-semibold text-ink">{ct.label}</p>
                        <p className="text-xs text-ink/45">{ct.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compensation details */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                Compensation details <span className="font-normal text-ink/35">· Optional</span>
              </span>
              <input
                type="text"
                value={editForm.compensationDetails}
                onChange={(e) => setField("compensationDetails", e.target.value)}
                placeholder="e.g. Free dinner for 2 + $100 cash"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss"
              />
            </label>

            {/* Creators needed */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Creators needed <span className="text-coral">*</span></span>
              <input
                type="number"
                min={1}
                value={editForm.creatorsNeeded}
                onChange={(e) => setField("creatorsNeeded", e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
              />
            </label>

            {/* Deadline */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Application deadline <span className="text-coral">*</span></span>
              <input
                type="date"
                value={editForm.deadline}
                min={addDays(1)}
                max={addDays(180)}
                onChange={(e) => setField("deadline", e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-moss"
              />
            </label>

            {/* Error */}
            {error ? (
              <p className="rounded-2xl border border-coral/20 bg-coral/[0.06] px-4 py-3 text-sm text-coral">{error}</p>
            ) : null}

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-2xl bg-moss px-5 py-3 text-sm font-bold text-white transition hover:bg-moss/90 active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        ) : (
          /* ── VIEW MODE ─────────────────────────────────────────────────────── */
          <div>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={campaign.status} />
                  {(campaign.content_types ?? []).map((t) => (
                    <span key={t} className="rounded-full border border-black/10 px-2.5 py-0.5 text-xs font-medium text-ink/55">
                      {t}
                    </span>
                  ))}
                </div>
                <h1 className="font-display text-2xl font-semibold text-ink">{campaign.title}</h1>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-black/20 hover:bg-black/[0.03]"
                >
                  Edit
                </button>
                {campaign.status !== "closed" ? (
                  <button
                    type="button"
                    onClick={() => setClosing(true)}
                    className="rounded-xl border border-coral/20 px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral/[0.05]"
                  >
                    Close
                  </button>
                ) : null}
              </div>
            </div>

            {/* Moodboard image — click to expand */}
            {currentImageUrl ? (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group relative mb-6 block w-full overflow-hidden rounded-2xl border border-black/[0.08]"
                aria-label="View full image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentImageUrl} alt="Campaign moodboard" className="h-56 w-full object-cover transition group-hover:scale-[1.01] sm:h-72" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/0 shadow-sm opacity-0 transition group-hover:bg-white/90 group-hover:opacity-100">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </div>
                </div>
              </button>
            ) : null}

            {/* Details grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3">
                <p className="text-xs text-ink/40">Compensation</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{COMP_LABELS[campaign.compensation_type] ?? campaign.compensation_type}</p>
              </div>
              <div className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3">
                <p className="text-xs text-ink/40">Creators needed</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{campaign.creators_needed}</p>
              </div>
              <div className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3">
                <p className="text-xs text-ink/40">Deadline</p>
                <p className={`mt-0.5 text-sm font-semibold ${isExpired ? "text-coral" : "text-ink"}`}>
                  {isExpired ? "Expired" : `${left}d left`}
                </p>
              </div>
              <div className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3">
                <p className="text-xs text-ink/40">Interested</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{campaign.interested_count ?? 0}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 rounded-2xl border border-black/[0.08] bg-white px-5 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Description</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-ink/80">{campaign.description}</p>
            </div>

            {/* Compensation details */}
            {campaign.compensation_details ? (
              <div className="mb-6 rounded-2xl border border-black/[0.08] bg-white px-5 py-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">Compensation details</p>
                <p className="text-sm text-ink/80">{campaign.compensation_details}</p>
              </div>
            ) : null}

            {/* Deadline date */}
            <div className="mb-6 rounded-2xl border border-black/[0.08] bg-white px-5 py-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/40">Application deadline</p>
              <p className="text-sm text-ink/80">
                {new Date(campaign.deadline).toLocaleDateString("en-CA", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Reference doc */}
            {campaign.reference_doc_url ? (
              <div className="mb-6 rounded-2xl border border-black/[0.08] bg-white px-5 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Reference document</p>
                <a
                  href={campaign.reference_doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-moss underline underline-offset-2 transition hover:text-moss/70"
                >
                  📄 {campaign.reference_doc_name ?? "View document"}
                </a>
              </div>
            ) : null}

            {/* Interested creators */}
            <div className="mt-10">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Interested Creators
                  {creators.length > 0 ? (
                    <span className="ml-2 rounded-full bg-moss/10 px-2.5 py-0.5 text-sm font-semibold text-moss">
                      {filteredCreators.length}{filteredCreators.length !== creators.length ? ` / ${creators.length}` : ""}
                    </span>
                  ) : null}
                </h2>
              </div>

              {creators.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
                  <span className="mb-3 text-4xl">👀</span>
                  <p className="font-semibold text-ink">No creators yet</p>
                  <p className="mt-1 text-sm text-ink/50">Creators who express interest will appear here.</p>
                </div>
              ) : (
                <>
                  {/* Filter bar */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {/* Sort */}
                    <div className="flex overflow-hidden rounded-xl border border-black/10">
                      {(["followers", "recent"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSortBy(s)}
                          className={`px-3 py-1.5 text-xs font-semibold transition ${sortBy === s ? "bg-moss text-white" : "bg-white text-ink/55 hover:bg-black/[0.03]"}`}
                        >
                          {s === "followers" ? "Most Followers" : "Most Recent"}
                        </button>
                      ))}
                    </div>

                    {/* Min followers */}
                    <div className="flex overflow-hidden rounded-xl border border-black/10">
                      {[
                        { label: "Any", value: 0 },
                        { label: "1K+", value: 1_000 },
                        { label: "5K+", value: 5_000 },
                        { label: "10K+", value: 10_000 },
                        { label: "50K+", value: 50_000 },
                      ].map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setMinFollowers(f.value)}
                          className={`px-3 py-1.5 text-xs font-semibold transition ${minFollowers === f.value ? "bg-moss text-white" : "bg-white text-ink/55 hover:bg-black/[0.03]"}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Niche filter */}
                    {allNiches.length > 0 ? (
                      <select
                        value={nicheFilter}
                        onChange={(e) => setNicheFilter(e.target.value)}
                        className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink outline-none transition focus:border-moss"
                      >
                        <option value="all">All Niches</option>
                        {allNiches.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>

                  {filteredCreators.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-black/15 bg-white px-5 py-8 text-center text-sm text-ink/40">
                      No creators match the current filters.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filteredCreators.map((creator, i) => (
                        <CreatorCard key={creator.id || i} creator={creator} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
