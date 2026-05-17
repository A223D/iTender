export const CONTENT_TYPES = [
  "Post",
  "Short-form Video",
  "Long-form Video",
  "Story",
  "Blog / Article",
];

export const COMPENSATION_TYPES = [
  { value: "paid", label: "Paid", description: "Cash payment to the creator" },
  { value: "product", label: "Product or Service", description: "Free product, service, or experience" },
  { value: "paid_product", label: "Paid + Product", description: "Cash plus free product or service" },
  { value: "affiliate", label: "Affiliate", description: "% of sales the creator drives" },
  { value: "negotiable", label: "Negotiable", description: "Discuss details in chat" },
];

export const COMP_LABELS: Record<string, string> = {
  paid: "Paid",
  product: "Product or Service",
  paid_product: "Paid + Product",
  affiliate: "Affiliate",
  negotiable: "Negotiable",
};

export const DOC_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

export const STATUS_LABELS: Record<string, string> = {
  live: "Live",
  draft: "Draft",
  closed: "Closed",
  pending: "Pending",
  completed: "Completed",
};

export const STATUS_STYLES: Record<string, string> = {
  live: "bg-[var(--color-accent-fg)]/10 text-[var(--color-accent-fg)]",
  draft: "bg-white/[0.06] text-[var(--color-text-muted)]",
  closed: "bg-error/10 text-error",
  pending: "bg-white/[0.06] text-[var(--color-text-muted)]",
  completed: "bg-white/[0.08] text-[var(--color-text-muted)]",
};


