import jobsData from "@/data/jobs.json";
import { FilterDefinition, FilterableValue, JobRecord } from "@/types/jobs";

export const filterDefinitions: FilterDefinition[] = [
  { key: "companyCategory", label: "Company category" },
  { key: "jobCategory", label: "Job category" },
  { key: "platform", label: "Platform" },
];

export const jobs = jobsData as JobRecord[];

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

export function matchesFilter(value: FilterableValue | FilterableValue[] | undefined, activeValue: string) {
  if (!activeValue || activeValue === "All") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.map(String).includes(activeValue);
  }

  return String(value) === activeValue;
}
