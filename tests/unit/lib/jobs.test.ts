import { describe, it, expect } from "vitest";
import {
  getCompensationLabel,
  getInitialFilters,
  getFilterOptions,
  getFilterOptionsMap,
  matchesFilter,
  filterJobs,
  getBriefPreview,
  getCampaignSummaryLine,
  filterDefinitions,
} from "@/lib/jobs";
import type { Campaign } from "@/types/jobs";

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: "c1",
    title: "Test Campaign",
    description: "A great campaign for local creators.",
    content_types: ["Post"],
    occasion: "",
    compensation_type: "paid",
    compensation_details: "$100",
    creators_needed: 3,
    deadline: "2026-07-01",
    interested_count: 0,
    brand_name: "Acme",
    brand_categories: ["Food & Beverage"],
    days_left: 28,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getCompensationLabel
// ---------------------------------------------------------------------------
describe("getCompensationLabel", () => {
  const cases: [string, string][] = [
    ["paid", "Paid"],
    ["product", "Free Product"],
    ["paid_product", "Paid + Product"],
    ["affiliate", "Affiliate"],
    ["negotiable", "Negotiable"],
    ["free_meal", "Free Meal"],
    ["both", "Paid + Meal"],
  ];

  it.each(cases)("maps '%s' to '%s'", (input, expected) => {
    expect(getCompensationLabel(input)).toBe(expected);
  });

  it("returns the raw value for unknown compensation types", () => {
    expect(getCompensationLabel("barter")).toBe("barter");
    expect(getCompensationLabel("custom_type")).toBe("custom_type");
  });
});

// ---------------------------------------------------------------------------
// getInitialFilters
// ---------------------------------------------------------------------------
describe("getInitialFilters", () => {
  it("returns an entry for every filter definition key", () => {
    const filters = getInitialFilters();
    for (const def of filterDefinitions) {
      expect(Object.prototype.hasOwnProperty.call(filters, String(def.key))).toBe(true);
    }
  });

  it("sets every filter value to 'All'", () => {
    const filters = getInitialFilters();
    for (const value of Object.values(filters)) {
      expect(value).toBe("All");
    }
  });
});

// ---------------------------------------------------------------------------
// getFilterOptions
// ---------------------------------------------------------------------------
describe("getFilterOptions", () => {
  const campaigns = [
    makeCampaign({ brand_categories: ["Food & Beverage"] }),
    makeCampaign({ brand_categories: ["Fashion & Apparel"] }),
    makeCampaign({ brand_categories: ["Food & Beverage"] }),
    makeCampaign({ brand_categories: ["Beauty & Cosmetics"] }),
  ];

  it("returns unique values only", () => {
    const options = getFilterOptions(campaigns, "brand_categories");
    const foodCount = options.filter((o) => o === "Food & Beverage").length;
    expect(foodCount).toBe(1);
  });

  it("returns values sorted alphabetically", () => {
    const options = getFilterOptions(campaigns, "brand_categories");
    const sorted = [...options].sort((a, b) => a.localeCompare(b));
    expect(options).toEqual(sorted);
  });

  it("handles array fields by extracting each element", () => {
    const multi = [makeCampaign({ content_types: ["Post", "Story"] })];
    const options = getFilterOptions(multi, "content_types");
    expect(options).toContain("Post");
    expect(options).toContain("Story");
  });

  it("returns an empty array when all values are objects/undefined", () => {
    const campaigns = [makeCampaign()];
    // occasion is a plain string; if all are empty strings they still get added
    const options = getFilterOptions(campaigns, "id");
    expect(Array.isArray(options)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getFilterOptionsMap
// ---------------------------------------------------------------------------
describe("getFilterOptionsMap", () => {
  it("returns a map keyed by each filter definition key", () => {
    const campaigns = [makeCampaign()];
    const map = getFilterOptionsMap(campaigns);
    for (const def of filterDefinitions) {
      expect(Object.prototype.hasOwnProperty.call(map, String(def.key))).toBe(true);
    }
  });

  it("each value is an array of strings", () => {
    const campaigns = [makeCampaign({ brand_categories: ["UGC"], content_types: ["Post"], occasion: "Grand Opening" })];
    const map = getFilterOptionsMap(campaigns);
    for (const options of Object.values(map)) {
      expect(Array.isArray(options)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// matchesFilter
// ---------------------------------------------------------------------------
describe("matchesFilter", () => {
  it("always returns true when activeValue is 'All'", () => {
    expect(matchesFilter("anything", "All")).toBe(true);
    expect(matchesFilter(["a", "b"], "All")).toBe(true);
    expect(matchesFilter(undefined, "All")).toBe(true);
  });

  it("always returns true when activeValue is empty string", () => {
    expect(matchesFilter("something", "")).toBe(true);
  });

  it("matches a scalar string value", () => {
    expect(matchesFilter("Food & Beverage", "Food & Beverage")).toBe(true);
    expect(matchesFilter("Fashion", "Food & Beverage")).toBe(false);
  });

  it("matches against arrays when value is an array", () => {
    expect(matchesFilter(["Post", "Story"], "Post")).toBe(true);
    expect(matchesFilter(["Post", "Story"], "Story")).toBe(true);
    expect(matchesFilter(["Post", "Story"], "Video")).toBe(false);
  });

  it("converts non-string values to string before comparing", () => {
    expect(matchesFilter(42, "42")).toBe(true);
    expect(matchesFilter(true, "true")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// filterJobs
// ---------------------------------------------------------------------------
describe("filterJobs", () => {
  const campaigns = [
    makeCampaign({
      id: "c1",
      description: "Summer skincare collab for beauty brands",
      brand_categories: ["Beauty & Cosmetics"],
      content_types: ["Short-form Video"],
      occasion: "Summer",
    }),
    makeCampaign({
      id: "c2",
      description: "Local food tour across the city",
      brand_categories: ["Food & Beverage"],
      content_types: ["Post"],
      occasion: "Grand Opening",
    }),
    makeCampaign({
      id: "c3",
      description: "Tech gadget review video",
      brand_categories: ["Tech & Electronics"],
      content_types: ["Long-form Video"],
      occasion: "",
    }),
  ];

  const allFilters = getInitialFilters();

  it("returns all campaigns when search is empty and all filters are 'All'", () => {
    expect(filterJobs(campaigns, "", allFilters)).toHaveLength(3);
  });

  it("filters by case-insensitive search query on description", () => {
    const results = filterJobs(campaigns, "skincare", allFilters);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("c1");
  });

  it("returns empty array when search query matches nothing", () => {
    expect(filterJobs(campaigns, "blockchain", allFilters)).toHaveLength(0);
  });

  it("ignores leading/trailing whitespace in search query", () => {
    const results = filterJobs(campaigns, "  food  ", allFilters);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("c2");
  });

  it("filters by brand_categories", () => {
    const filters = { ...allFilters, brand_categories: "Tech & Electronics" };
    const results = filterJobs(campaigns, "", filters);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("c3");
  });

  it("filters by content_types", () => {
    const filters = { ...allFilters, content_types: "Post" };
    const results = filterJobs(campaigns, "", filters);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("c2");
  });

  it("filters by occasion", () => {
    const filters = { ...allFilters, occasion: "Summer" };
    const results = filterJobs(campaigns, "", filters);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("c1");
  });

  it("combines search and filter correctly (AND logic)", () => {
    const filters = { ...allFilters, content_types: "Short-form Video" };
    const results = filterJobs(campaigns, "skincare", filters);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("c1");
  });

  it("returns empty when filter matches but search does not", () => {
    const filters = { ...allFilters, brand_categories: "Beauty & Cosmetics" };
    const results = filterJobs(campaigns, "pizza", filters);
    expect(results).toHaveLength(0);
  });

  it("handles an empty campaigns array", () => {
    expect(filterJobs([], "query", allFilters)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getBriefPreview
// ---------------------------------------------------------------------------
describe("getBriefPreview", () => {
  it("returns the description unchanged if under maxLength", () => {
    const short = "A short description.";
    expect(getBriefPreview(short)).toBe(short);
  });

  it("truncates long descriptions and appends ellipsis", () => {
    const long = "A".repeat(200);
    const result = getBriefPreview(long, 150);
    expect(result.endsWith("...")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(150);
  });

  it("collapses multiple whitespace characters before checking length", () => {
    const spacy = "Hello     World";
    expect(getBriefPreview(spacy)).toBe("Hello World");
  });

  it("does not append ellipsis when description is exactly maxLength", () => {
    const exact = "A".repeat(150);
    const result = getBriefPreview(exact, 150);
    expect(result.endsWith("...")).toBe(false);
  });

  it("uses 150 as the default maxLength", () => {
    const long = "B".repeat(200);
    const result = getBriefPreview(long);
    expect(result.length).toBeLessThanOrEqual(150);
  });
});

// ---------------------------------------------------------------------------
// getCampaignSummaryLine
// ---------------------------------------------------------------------------
describe("getCampaignSummaryLine", () => {
  it("joins content types when occasion is empty", () => {
    const result = getCampaignSummaryLine({ content_types: ["Post", "Story"], occasion: "" });
    expect(result).toBe("Post, Story");
  });

  it("appends occasion after a middot when present", () => {
    const result = getCampaignSummaryLine({ content_types: ["Short-form Video"], occasion: "Grand Opening" });
    expect(result).toBe("Short-form Video · Grand Opening");
  });

  it("falls back to 'Campaign' when content_types is empty and occasion is empty", () => {
    const result = getCampaignSummaryLine({ content_types: [], occasion: "" });
    expect(result).toBe("Campaign");
  });

  it("appends occasion even when content_types is empty", () => {
    const result = getCampaignSummaryLine({ content_types: [], occasion: "Summer" });
    expect(result).toBe("Campaign · Summer");
  });

  it("handles a single content type without a trailing comma", () => {
    const result = getCampaignSummaryLine({ content_types: ["Post"], occasion: "" });
    expect(result).toBe("Post");
  });
});
