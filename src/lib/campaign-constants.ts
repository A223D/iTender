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
  live: "bg-moss/10 text-moss",
  draft: "bg-black/[0.06] text-ink/50",
  closed: "bg-coral/10 text-coral",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-teal/10 text-teal",
};
