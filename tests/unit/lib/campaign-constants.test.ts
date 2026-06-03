import { describe, it, expect } from "vitest";
import {
  CONTENT_TYPES,
  COMPENSATION_TYPES,
  COMP_LABELS,
  DOC_MIME_TYPES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/lib/campaign-constants";

describe("CONTENT_TYPES", () => {
  it("is a non-empty array of strings", () => {
    expect(Array.isArray(CONTENT_TYPES)).toBe(true);
    expect(CONTENT_TYPES.length).toBeGreaterThan(0);
    for (const t of CONTENT_TYPES) {
      expect(typeof t).toBe("string");
    }
  });

  it("includes the expected types", () => {
    expect(CONTENT_TYPES).toContain("Post");
    expect(CONTENT_TYPES).toContain("Short-form Video");
    expect(CONTENT_TYPES).toContain("Long-form Video");
    expect(CONTENT_TYPES).toContain("Story");
    expect(CONTENT_TYPES).toContain("Blog / Article");
  });
});

describe("COMPENSATION_TYPES", () => {
  it("every entry has a value, label, and description", () => {
    for (const c of COMPENSATION_TYPES) {
      expect(typeof c.value).toBe("string");
      expect(c.value.length).toBeGreaterThan(0);
      expect(typeof c.label).toBe("string");
      expect(c.label.length).toBeGreaterThan(0);
      expect(typeof c.description).toBe("string");
      expect(c.description.length).toBeGreaterThan(0);
    }
  });

  it("includes all expected compensation type values", () => {
    const values = COMPENSATION_TYPES.map((c) => c.value);
    expect(values).toContain("paid");
    expect(values).toContain("product");
    expect(values).toContain("paid_product");
    expect(values).toContain("affiliate");
    expect(values).toContain("negotiable");
  });

  it("has no duplicate values", () => {
    const values = COMPENSATION_TYPES.map((c) => c.value);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

describe("COMP_LABELS", () => {
  it("maps every COMPENSATION_TYPES value to a label", () => {
    for (const c of COMPENSATION_TYPES) {
      expect(COMP_LABELS[c.value]).toBeDefined();
    }
  });

  it("labels match COMPENSATION_TYPES labels for shared keys", () => {
    for (const c of COMPENSATION_TYPES) {
      expect(COMP_LABELS[c.value]).toBe(c.label);
    }
  });
});

describe("DOC_MIME_TYPES", () => {
  it("maps pdf to the correct MIME type", () => {
    expect(DOC_MIME_TYPES["pdf"]).toBe("application/pdf");
  });

  it("maps docx to the correct MIME type", () => {
    expect(DOC_MIME_TYPES["docx"]).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
  });

  it("maps doc to the correct MIME type", () => {
    expect(DOC_MIME_TYPES["doc"]).toBe("application/msword");
  });

  it("all MIME type values are non-empty strings", () => {
    for (const mime of Object.values(DOC_MIME_TYPES)) {
      expect(typeof mime).toBe("string");
      expect(mime.length).toBeGreaterThan(0);
    }
  });
});

describe("STATUS_LABELS", () => {
  const expectedStatuses = ["live", "draft", "closed", "pending", "completed"];

  it("provides a label for every expected campaign status", () => {
    for (const status of expectedStatuses) {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(typeof STATUS_LABELS[status]).toBe("string");
    }
  });

  it("all labels are non-empty strings", () => {
    for (const label of Object.values(STATUS_LABELS)) {
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("STATUS_STYLES", () => {
  const expectedStatuses = ["live", "draft", "closed", "pending", "completed"];

  it("provides a style string for every expected campaign status", () => {
    for (const status of expectedStatuses) {
      expect(STATUS_STYLES[status]).toBeDefined();
      expect(typeof STATUS_STYLES[status]).toBe("string");
    }
  });

  it("STATUS_LABELS and STATUS_STYLES cover the same set of statuses", () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(Object.keys(STATUS_STYLES).sort());
  });
});
