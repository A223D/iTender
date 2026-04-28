import jobsData from "@/data/jobs.json";
import { FilterDefinition, FilterableValue, JobRecord } from "@/types/jobs";

export const filterDefinitions: FilterDefinition[] = [
  { key: "companyCategory", label: "Company category" },
  { key: "jobCategory", label: "Job category" },
  { key: "platform", label: "Platform" },
];

export const jobs = jobsData as JobRecord[];

const budgetFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function getInitialFilters() {
  return Object.fromEntries(filterDefinitions.map((definition) => [String(definition.key), "All"]));
}

export function getFilterOptions(records: JobRecord[], key: keyof JobRecord) {
  const values = new Set<string>();

  for (const record of records) {
    const currentValue = record[key];

    if (Array.isArray(currentValue)) {
      currentValue.forEach((item) => values.add(String(item)));
      continue;
    }

    if (currentValue !== undefined && typeof currentValue !== "object") {
      values.add(String(currentValue));
    }
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

export function getFilterOptionsMap(records: JobRecord[]) {
  return Object.fromEntries(
    filterDefinitions.map((definition) => [String(definition.key), getFilterOptions(records, definition.key)]),
  );
}

export function matchesFilter(value: FilterableValue | FilterableValue[] | undefined, activeValue: string) {
  if (!activeValue || activeValue === "All") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.map(String).includes(activeValue);
  }

  return String(value) === activeValue;
}

export function filterJobs(records: JobRecord[], searchQuery: string, filters: Record<string, string>) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return records.filter((job) => {
    const matchesSearch = normalizedSearch.length === 0 || job.brief.toLowerCase().includes(normalizedSearch);
    const matchesAllFilters = filterDefinitions.every((definition) =>
      matchesFilter(job[definition.key], filters[String(definition.key)] ?? "All"),
    );

    return matchesSearch && matchesAllFilters;
  });
}

export function formatBudget(value: number) {
  return budgetFormatter.format(value);
}

export function getBriefPreview(brief: string, maxLength = 150) {
  const normalized = brief.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

export function getCampaignSummaryLine(job: Pick<JobRecord, "jobCategory" | "platform">) {
  return `${job.jobCategory} campaign | ${job.platform.join(", ")}`;
}
