import { describe, it, expect } from "vitest";
import { extractProfilePhoto } from "@/types/models";
import type { RawCreatorJoin } from "@/types/models";

function makeCreator(overrides: Partial<RawCreatorJoin> = {}): RawCreatorJoin {
  return {
    id: "user-1",
    name: "Jane Doe",
    avatar_url: null,
    creator_profiles: null,
    ...overrides,
  };
}

describe("extractProfilePhoto", () => {
  it("returns null when creator is null", () => {
    expect(extractProfilePhoto(null)).toBeNull();
  });

  it("returns null when creator_profiles is null", () => {
    const creator = makeCreator({ creator_profiles: null });
    expect(extractProfilePhoto(creator)).toBeNull();
  });

  it("extracts profile_photo_url from an object shape", () => {
    const creator = makeCreator({ creator_profiles: { profile_photo_url: "https://cdn.example.com/photo.jpg" } });
    expect(extractProfilePhoto(creator)).toBe("https://cdn.example.com/photo.jpg");
  });

  it("returns null when profile_photo_url is null in object shape", () => {
    const creator = makeCreator({ creator_profiles: { profile_photo_url: null } });
    expect(extractProfilePhoto(creator)).toBeNull();
  });

  it("extracts profile_photo_url from a single-element array shape", () => {
    const creator = makeCreator({
      creator_profiles: [{ profile_photo_url: "https://cdn.example.com/array-photo.jpg" }],
    });
    expect(extractProfilePhoto(creator)).toBe("https://cdn.example.com/array-photo.jpg");
  });

  it("returns null when array is empty", () => {
    const creator = makeCreator({ creator_profiles: [] as { profile_photo_url: string | null }[] });
    expect(extractProfilePhoto(creator)).toBeNull();
  });

  it("returns null when the first array element has a null photo", () => {
    const creator = makeCreator({ creator_profiles: [{ profile_photo_url: null }] });
    expect(extractProfilePhoto(creator)).toBeNull();
  });

  it("uses the first element of the array when multiple entries exist", () => {
    const creator = makeCreator({
      creator_profiles: [
        { profile_photo_url: "https://cdn.example.com/first.jpg" },
        { profile_photo_url: "https://cdn.example.com/second.jpg" },
      ],
    });
    expect(extractProfilePhoto(creator)).toBe("https://cdn.example.com/first.jpg");
  });
});
