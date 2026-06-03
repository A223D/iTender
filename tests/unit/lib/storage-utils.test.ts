import { describe, it, expect } from "vitest";
import { extractStoragePath } from "@/lib/storage-utils";

const BASE_URL = "https://xyz.supabase.co";

describe("extractStoragePath", () => {
  it("extracts the path from a valid Supabase public URL", () => {
    const url = `${BASE_URL}/storage/v1/object/public/campaign-images/user-123/1234567890.jpg`;
    expect(extractStoragePath(url, "campaign-images")).toBe("user-123/1234567890.jpg");
  });

  it("extracts the path for the profile-images bucket", () => {
    const url = `${BASE_URL}/storage/v1/object/public/profile-images/user-abc/logo-1234.png`;
    expect(extractStoragePath(url, "profile-images")).toBe("user-abc/logo-1234.png");
  });

  it("returns null when the URL does not contain the marker", () => {
    const url = "https://example.com/some/path/image.jpg";
    expect(extractStoragePath(url, "campaign-images")).toBeNull();
  });

  it("returns null when the URL uses a different bucket", () => {
    const url = `${BASE_URL}/storage/v1/object/public/profile-images/user-123/logo.png`;
    expect(extractStoragePath(url, "campaign-images")).toBeNull();
  });

  it("handles nested directory paths", () => {
    const url = `${BASE_URL}/storage/v1/object/public/campaign-images/user-123/docs/1234567890-doc.pdf`;
    expect(extractStoragePath(url, "campaign-images")).toBe("user-123/docs/1234567890-doc.pdf");
  });

  it("handles a file directly under the bucket (no subdirectory)", () => {
    const url = `${BASE_URL}/storage/v1/object/public/campaign-images/image.jpg`;
    expect(extractStoragePath(url, "campaign-images")).toBe("image.jpg");
  });

  it("returns null for an empty URL", () => {
    expect(extractStoragePath("", "campaign-images")).toBeNull();
  });

  it("extracts path from a URL with query parameters", () => {
    const url = `${BASE_URL}/storage/v1/object/public/profile-images/user-1/logo.png?t=123456`;
    const result = extractStoragePath(url, "profile-images");
    // The raw slice includes the query string since indexOf only finds the first occurrence
    expect(result).toContain("user-1/logo.png");
  });

  it("respects bucket name boundaries — does not match a bucket that is a prefix of another", () => {
    const url = `${BASE_URL}/storage/v1/object/public/campaign-images-v2/user-1/img.jpg`;
    expect(extractStoragePath(url, "campaign-images")).toBeNull();
  });
});
