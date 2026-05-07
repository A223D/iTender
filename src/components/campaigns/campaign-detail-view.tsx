"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { CampaignDetail, InterestedCreator } from "@/app/campaigns/[id]/page";
import { createClient } from "@/utils/supabase/client";
import { CONTENT_TYPES, COMPENSATION_TYPES, COMP_LABELS, DOC_MIME_TYPES } from "@/lib/campaign-constants";
import { addDays, daysLeft } from "@/lib/dates";
import { extractStoragePath } from "@/lib/storage-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { CreatorPipeline } from "./creator-pipeline";
import type { NormalizedCreator } from "./creator-card";

// ── Types ──────────────────────────────────────────────────────────────────────

type Props = {
  campaign: CampaignDetail;
  interestedCreators: InterestedCreator[];
  userId: string;
  existingMatches?: Map<string, string>;
};

type EditForm = {
  title: string;
  description: string;
  compensationType: string;
  compensationDetails: string;
  creatorsNeeded: string;
  deadline: string;
};

// ── Main component ─────────────────────────────────────────────────────────────

export function CampaignDetailView({ campaign, interestedCreators, userId, existingMatches = new Map() }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Accept state
  const [accepting, setAccepting] = useState<string | null>(null);
  const [localMatches, setLocalMatches] = useState<Map<string, string>>(existingMatches);

  // Creator filter state
  const [sortBy, setSortBy] = useState<"followers" | "recent">("followers");
  const [minFollowers, setMinFollowers] = useState(0);
  const [nicheFilter, setNicheFilter] = useState("all");

  // Edit form state
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

  // ── Normalize creators ────────────────────────────────────────────────────────

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

  const allNiches = [...new Set(creators.flatMap((c) => c.brand_categories))].sort();

  const filteredCreators = creators
    .filter((c) => {
      if (minFollowers === 0) return true;
      return Math.max(c.instagram_followers, c.tiktok_followers, c.youtube_followers) >= minFollowers;
    })
    .filter((c) => nicheFilter === "all" || c.brand_categories.includes(nicheFilter))
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

  async function handleAccept(creator: NormalizedCreator) {
    setAccepting(creator.id);
    const { data, error: acceptError } = await supabase
      .from("matches")
      .insert({ campaign_id: campaign.id, creator_id: creator.id, business_id: userId })
      .select("id")
      .single();
    if (data) {
      await supabase.rpc("decrement_interested", { campaign_id: campaign.id });
      setLocalMatches((prev) => new Map(prev).set(creator.id, data.id));
    }
    if (acceptError) setError("Could not accept creator. They may already be matched.");
    setAccepting(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Moodboard image must be under 5 MB.");
      e.target.value = "";
      return;
    }
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
    setImageRemoved(false);
  }

  function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError("Reference document must be under 15 MB.");
      e.target.value = "";
      return;
    }
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

  // ── Derived values ────────────────────────────────────────────────────────────

  const left = daysLeft(campaign.deadline);
  const isExpired = left === 0 && campaign.status === "live";
  const isExpiringSoon = left > 0 && left <= 3 && campaign.status === "live";
  const currentImageUrl = campaign.photo_urls?.[0] ?? null;
  const editImageSrc = imageRemoved ? null : newImagePreview ?? currentImageUrl;
  const editDocName = docRemoved ? null : newDocFile?.name ?? campaign.reference_doc_name;

  // ── Shared pipeline props ─────────────────────────────────────────────────────

  const pipelineProps = {
    creators,
    filteredCreators,
    sortBy,
    setSortBy,
    minFollowers,
    setMinFollowers,
    nicheFilter,
    setNicheFilter,
    allNiches,
    localMatches,
    accepting,
    onAccept: handleAccept,
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
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

      {/* Close confirmation dialog */}
      {closing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_24px_64px_rgba(22,20,18,0.2)]">
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

      {editing ? (
        /* ── EDIT MODE ────────────────────────────────────────────────────────── */
        <>
          <header className="sticky top-0 z-30 border-b border-black/[0.08] bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-[57px] max-w-7xl items-center gap-3 px-4 lg:px-8">
              <Link
                href="/dashboard"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink/50 transition hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12L6 8l4-4" />
                </svg>
                <span>All Campaigns</span>
              </Link>
              <div className="hidden h-5 w-px bg-black/10 lg:block" />
              <div className="hidden min-w-0 flex-1 items-center gap-2.5 lg:flex">
                <h1 className="truncate font-display text-sm font-semibold text-ink">{campaign.title}</h1>
                <StatusBadge status={campaign.status} />
              </div>
              <div className="flex-1 lg:hidden" />
            </div>
          </header>

          <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
            {/* Sticky edit action bar */}
            <div className="sticky top-[57px] z-20 -mx-4 mb-6 flex items-center justify-between bg-[#F7F6FF]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-ink">Edit Campaign</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setEditing(false); setError(null); }}
                  disabled={saving}
                  className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink/60 transition hover:text-ink disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-coral to-violet px-4 py-2 text-sm font-bold text-white shadow-glow transition active:scale-[0.98] disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#07070E]">Campaign title <span className="text-coral">*</span></span>
                  <span className={`text-xs font-medium ${editForm.title.length > 80 ? "text-coral" : "text-ink/40"}`}>
                    {editForm.title.length} / 80
                  </span>
                </div>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-coral focus:shadow-[0_0_0_4px_rgba(255,69,102,0.15)]"
                />
              </label>

              {/* Content types */}
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">Content types <span className="text-coral">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((type) => {
                    const selected = selectedContentTypes.has(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleContentType(type)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          selected ? "border-[#07070E] bg-[#07070E] text-coral" : "border-black/10 bg-white text-ink hover:border-black/30"
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
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#07070E]">Description <span className="text-coral">*</span></span>
                  <span className={`text-xs font-medium ${editForm.description.length > 1000 ? "text-coral" : "text-ink/40"}`}>
                    {editForm.description.length} / 1000
                  </span>
                </div>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-coral focus:shadow-[0_0_0_4px_rgba(255,69,102,0.15)]"
                />
              </div>

              {/* Moodboard image */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
                  Moodboard image <span className="font-normal normal-case text-black/35 tracking-normal">· Optional</span>
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
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-black/15 bg-white transition hover:border-coral/40"
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
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
                  Reference document <span className="font-normal normal-case text-black/35 tracking-normal">· Optional</span>
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
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#07070E]">Compensation type <span className="text-coral">*</span></p>
                <div className="space-y-2">
                  {COMPENSATION_TYPES.map((ct) => {
                    const selected = editForm.compensationType === ct.value;
                    return (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setField("compensationType", ct.value)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          selected ? "border-coral/40 bg-coral/[0.05]" : "border-black/10 bg-white hover:border-black/20"
                        }`}
                      >
                        <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${selected ? "border-coral bg-coral" : "border-black/25"}`} />
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
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#07070E]">
                  Compensation details <span className="font-normal normal-case text-black/35 tracking-normal">· Optional</span>
                </span>
                <input
                  type="text"
                  value={editForm.compensationDetails}
                  onChange={(e) => setField("compensationDetails", e.target.value)}
                  placeholder="e.g. Free dinner for 2 + $100 cash"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-coral focus:shadow-[0_0_0_4px_rgba(255,69,102,0.15)]"
                />
              </label>

              {/* Creators needed */}
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#07070E]">Creators needed <span className="text-coral">*</span></span>
                <input
                  type="number"
                  min={1}
                  value={editForm.creatorsNeeded}
                  onChange={(e) => setField("creatorsNeeded", e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-coral focus:shadow-[0_0_0_4px_rgba(255,69,102,0.15)]"
                />
              </label>

              {/* Deadline */}
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#07070E]">Application deadline <span className="text-coral">*</span></span>
                <input
                  type="date"
                  value={editForm.deadline}
                  min={addDays(1)}
                  max={addDays(180)}
                  onChange={(e) => setField("deadline", e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-coral focus:shadow-[0_0_0_4px_rgba(255,69,102,0.15)]"
                />
              </label>

              {error ? (
                <p className="rounded-2xl border border-coral/20 bg-coral/[0.06] px-4 py-3 text-sm text-coral">{error}</p>
              ) : null}
            </div>
          </div>
        </>

      ) : (
        /* ── VIEW MODE ────────────────────────────────────────────────────────── */
        <>
          {/* ── Dark hero band ────────────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #07070E 0%, #0F0F1A 60%, #161628 100%)" }}
          >
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-coral/15 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-teal/10 blur-3xl" />

            {/* Moodboard as cinematic blurred background */}
            {currentImageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.18] blur-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07070E]/95 via-[#07070E]/60 to-[#07070E]/30" />
              </>
            ) : null}

            {/* Navigation row */}
            <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 pt-5 lg:px-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/45 transition hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12L6 8l4-4" />
                </svg>
                All Campaigns
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-xl border border-white/15 bg-white/[0.07] px-3 py-1.5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  Edit
                </button>
                {campaign.status !== "closed" ? (
                  <button
                    type="button"
                    onClick={() => setClosing(true)}
                    className="rounded-xl border border-coral/30 px-3 py-1.5 text-sm font-semibold text-coral transition hover:bg-coral/[0.08]"
                  >
                    Close
                  </button>
                ) : null}
              </div>
            </div>

            {/* Hero content */}
            <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 lg:px-8">
              <div className="flex items-start gap-6">
                <div className="min-w-0 flex-1">
                  {/* Status + content type chips */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      campaign.status === "live"
                        ? "bg-teal/20 text-teal"
                        : campaign.status === "closed"
                        ? "bg-white/10 text-white/50"
                        : "bg-coral/20 text-coral"
                    }`}>
                      {campaign.status === "live" ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                      ) : null}
                      {campaign.status === "live" ? "Live" : campaign.status === "closed" ? "Closed" : campaign.status}
                    </span>
                    {(campaign.content_types ?? []).map((t) => (
                      <span key={t} className="rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-0.5 text-xs font-medium text-white/55">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="font-display text-3xl font-bold text-white lg:text-4xl">{campaign.title}</h1>

                  {campaign.compensation_details ? (
                    <p className="mt-2 max-w-xl text-sm text-white/40">{campaign.compensation_details}</p>
                  ) : null}
                </div>

                {/* Moodboard thumbnail (desktop only — clickable to lightbox) */}
                {currentImageUrl ? (
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="group relative hidden h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/20 shadow-2xl transition hover:border-white/40 lg:block"
                    aria-label="View full moodboard"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentImageUrl} alt="Moodboard" className="h-full w-full object-cover transition group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 transition group-hover:opacity-100">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                    </div>
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* ── Body ──────────────────────────────────────────────────────────── */}
          <div className="bg-[#F7F6FF] pb-16">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-4">
                <div className="rounded-2xl border border-coral/15 bg-gradient-to-br from-coral/[0.08] to-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-coral/70">Compensation</p>
                  <p className="mt-1 font-semibold text-ink">{COMP_LABELS[campaign.compensation_type] ?? campaign.compensation_type}</p>
                </div>
                <div className="rounded-2xl border border-violet/15 bg-gradient-to-br from-violet/[0.06] to-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-violet/70">Spots</p>
                  <p className="mt-1 font-semibold text-ink">{campaign.creators_needed} needed</p>
                </div>
                <div className={`rounded-2xl border p-4 shadow-sm ${
                  isExpired || isExpiringSoon
                    ? "border-coral/20 bg-gradient-to-br from-coral/[0.08] to-white"
                    : "border-black/[0.07] bg-white"
                }`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wide ${isExpired || isExpiringSoon ? "text-coral/70" : "text-ink/40"}`}>
                    Deadline
                  </p>
                  <p className={`mt-1 font-semibold ${isExpired || isExpiringSoon ? "text-coral" : "text-ink"}`}>
                    {isExpired ? "Expired" : `${left}d left`}
                  </p>
                  <p className="text-xs text-ink/40">
                    {new Date(campaign.deadline).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">Interested</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {(campaign.interested_count ?? 0) > 0 ? (
                      <span className="h-2 w-2 rounded-full bg-coral" />
                    ) : null}
                    <p className="font-semibold text-ink">{campaign.interested_count ?? 0} creators</p>
                  </div>
                </div>
              </div>

              {/* Content + pipeline */}
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

                {/* Left: info cards */}
                <div className="min-w-0 flex-1 space-y-4 lg:pb-16">

                  {/* Mobile moodboard */}
                  {currentImageUrl ? (
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="group relative block w-full overflow-hidden rounded-2xl border border-black/[0.08] lg:hidden"
                      aria-label="View full image"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={currentImageUrl} alt="Campaign moodboard" className="h-48 w-full object-cover transition group-hover:scale-[1.01]" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/0 opacity-0 transition group-hover:bg-white/90 group-hover:opacity-100">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ) : null}

                  {/* Description */}
                  <div className="rounded-2xl border border-black/[0.07] bg-white px-5 py-4 shadow-sm">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink/40">Description</p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-ink/80">{campaign.description}</p>
                  </div>

                  {/* Compensation details */}
                  {campaign.compensation_details ? (
                    <div className="rounded-2xl border border-black/[0.07] bg-white px-5 py-4 shadow-sm">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink/40">Compensation details</p>
                      <p className="text-sm text-ink/80">{campaign.compensation_details}</p>
                    </div>
                  ) : null}

                  {/* Reference doc */}
                  {campaign.reference_doc_url ? (
                    <div className="rounded-2xl border border-black/[0.07] bg-white px-5 py-4 shadow-sm">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink/40">Reference document</p>
                      <a
                        href={campaign.reference_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-coral underline underline-offset-2 transition hover:text-coral/70"
                      >
                        📄 {campaign.reference_doc_name ?? "View document"}
                      </a>
                    </div>
                  ) : null}

                  {/* Mobile: pipeline */}
                  <div className="lg:hidden">
                    <CreatorPipeline {...pipelineProps} sticky={false} />
                  </div>
                </div>

                {/* Right: pipeline (desktop sticky) */}
                <div className="hidden w-full shrink-0 lg:sticky lg:top-6 lg:block lg:max-h-[calc(100vh-6rem)] lg:w-[420px] lg:overflow-y-auto">
                  <CreatorPipeline {...pipelineProps} sticky={true} />
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
