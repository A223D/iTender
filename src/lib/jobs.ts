import { Campaign, FilterDefinition, FilterableValue } from "@/types/jobs";

export const filterDefinitions: FilterDefinition[] = [
  { key: "brand_categories", label: "Company category" },
  { key: "content_types", label: "Content type" },
  { key: "occasion", label: "Occasion" },
];

const COMPENSATION_LABELS: Record<string, string> = {
  paid: "Paid",
  product: "Free Product",
  paid_product: "Paid + Product",
  affiliate: "Affiliate",
  negotiable: "Negotiable",
  free_meal: "Free Meal",
  both: "Paid + Meal",
};

export function getCompensationLabel(type: string): string {
  return COMPENSATION_LABELS[type] ?? type;
}

export function getInitialFilters() {
  return Object.fromEntries(filterDefinitions.map((def) => [String(def.key), "All"]));
}

export function getFilterOptions(records: Campaign[], key: keyof Campaign) {
  const values = new Set<string>();

  for (const record of records) {
    const current = record[key];

    if (Array.isArray(current)) {
      current.forEach((item) => values.add(String(item)));
      continue;
    }

    if (current !== undefined && typeof current !== "object") {
      values.add(String(current));
    }
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export function getFilterOptionsMap(records: Campaign[]) {
  return Object.fromEntries(
    filterDefinitions.map((def) => [String(def.key), getFilterOptions(records, def.key)]),
  );
}

export function matchesFilter(value: FilterableValue | FilterableValue[] | undefined, activeValue: string) {
  if (!activeValue || activeValue === "All") return true;

  if (Array.isArray(value)) {
    return value.map(String).includes(activeValue);
  }

  return String(value) === activeValue;
}

export function filterJobs(records: Campaign[], searchQuery: string, filters: Record<string, string>) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return records.filter((campaign) => {
    const matchesSearch =
      normalizedSearch.length === 0 || campaign.description.toLowerCase().includes(normalizedSearch);
    const matchesAllFilters = filterDefinitions.every((def) =>
      matchesFilter(campaign[def.key], filters[String(def.key)] ?? "All"),
    );

    return matchesSearch && matchesAllFilters;
  });
}

export function getBriefPreview(description: string, maxLength = 150) {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export function getCampaignSummaryLine(campaign: Pick<Campaign, "content_types" | "occasion">) {
  const types = campaign.content_types.join(", ") || "Campaign";
  return campaign.occasion ? `${types} · ${campaign.occasion}` : types;
}
