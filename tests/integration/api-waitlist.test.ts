/**
 * Integration tests for POST /api/waitlist
 *
 * Tests the full request → validation → DB insert → response pipeline.
 * Supabase is mocked at the client boundary; all business logic runs for real.
 *
 * Skipped unless ALLOW_INTEGRATION_TESTS=true.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockClient, qChain, makeRequest } from "./helpers/mock-builders";

vi.mock("next/headers", () => ({ cookies: vi.fn().mockResolvedValue({}) }));
vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/utils/supabase/server";
import { POST } from "@/app/api/waitlist/route";

const mockedCreateClient = vi.mocked(createClient);

const INTEGRATION = Boolean(process.env.ALLOW_INTEGRATION_TESTS);

// ── Helpers ──────────────────────────────────────────────────────────────────
function validBrand(overrides: Record<string, unknown> = {}) {
  return {
    name: "Acme Bakery",
    email: "owner@acme.com",
    phone: "",
    role: "brand",
    instagramHandle: "",
    companyName: "Acme Bakery LLC",
    websiteUrl: "https://acmebakery.com",
    ...overrides,
  };
}

function validCreator(overrides: Record<string, unknown> = {}) {
  return {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "",
    role: "creator",
    instagramHandle: "@janedoe",
    companyName: "",
    websiteUrl: "",
    ...overrides,
  };
}

async function post(body: unknown) {
  const req = makeRequest("http://localhost/api/waitlist", { body });
  const res = await POST(req);
  return { status: res.status, body: await res.json() };
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe.skipIf(!INTEGRATION)("POST /api/waitlist", () => {
  beforeEach(() => {
    mockedCreateClient.mockReturnValue(
      mockClient({ fromFn: () => qChain({ data: null, error: null }) }) as ReturnType<typeof mockClient>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Happy paths ────────────────────────────────────────────────────────────
  it("inserts a valid brand entry and returns 201", async () => {
    const { status, body } = await post(validBrand());
    expect(status).toBe(201);
    expect(body).toEqual({ ok: true });
  });

  it("inserts a valid creator entry and returns 201", async () => {
    const { status, body } = await post(validCreator());
    expect(status).toBe(201);
    expect(body).toEqual({ ok: true });
  });

  it("accepts phone-only contact (no email)", async () => {
    const { status } = await post(validBrand({ email: "", phone: "07911123456" }));
    expect(status).toBe(201);
  });

  it("normalises a websiteUrl without protocol before insert", async () => {
    let captured: Record<string, unknown> | null = null;
    const chain = qChain();
    (chain.insert as ReturnType<typeof vi.fn>).mockImplementation((row: Record<string, unknown>) => {
      captured = row;
      return Promise.resolve({ data: null, error: null });
    });
    mockedCreateClient.mockReturnValue(mockClient({ fromFn: () => chain }) as ReturnType<typeof mockClient>);

    await post(validBrand({ websiteUrl: "acmebakery.com" }));
    expect(captured?.website_url).toBe("https://acmebakery.com");
  });

  it("stores instagram_handle without leading @ for creator entries", async () => {
    let captured: Record<string, unknown> | null = null;
    const chain = qChain();
    (chain.insert as ReturnType<typeof vi.fn>).mockImplementation((row: Record<string, unknown>) => {
      captured = row;
      return Promise.resolve({ data: null, error: null });
    });
    mockedCreateClient.mockReturnValue(mockClient({ fromFn: () => chain }) as ReturnType<typeof mockClient>);

    await post(validCreator({ instagramHandle: "@janedoe" }));
    expect(captured?.instagram_handle).toBe("janedoe");
  });

  it("lowercases email before insert", async () => {
    let captured: Record<string, unknown> | null = null;
    const chain = qChain();
    (chain.insert as ReturnType<typeof vi.fn>).mockImplementation((row: Record<string, unknown>) => {
      captured = row;
      return Promise.resolve({ data: null, error: null });
    });
    mockedCreateClient.mockReturnValue(mockClient({ fromFn: () => chain }) as ReturnType<typeof mockClient>);

    await post(validBrand({ email: "Owner@Acme.COM" }));
    expect(captured?.email).toBe("owner@acme.com");
  });

  it("stores source as 'homepage'", async () => {
    let captured: Record<string, unknown> | null = null;
    const chain = qChain();
    (chain.insert as ReturnType<typeof vi.fn>).mockImplementation((row: Record<string, unknown>) => {
      captured = row;
      return Promise.resolve({ data: null, error: null });
    });
    mockedCreateClient.mockReturnValue(mockClient({ fromFn: () => chain }) as ReturnType<typeof mockClient>);

    await post(validBrand());
    expect(captured?.source).toBe("homepage");
  });

  // ── Validation failures ────────────────────────────────────────────────────
  it("returns 400 when name is missing", async () => {
    const { status, body } = await post(validBrand({ name: "" }));
    expect(status).toBe(400);
    expect(body.error).toContain("name");
  });

  it("returns 400 when both email and phone are absent", async () => {
    const { status, body } = await post(validBrand({ email: "", phone: "" }));
    expect(status).toBe(400);
    expect(body.error).toBeTruthy();
  });

  it("returns 400 for a malformed email address", async () => {
    const { status, body } = await post(validBrand({ email: "not-an-email" }));
    expect(status).toBe(400);
    expect(body.error).toMatch(/email/i);
  });

  it("returns 400 when role is absent", async () => {
    const { status } = await post(validBrand({ role: "" }));
    expect(status).toBe(400);
  });

  it("returns 400 for an unrecognised role value", async () => {
    const { status } = await post(validBrand({ role: "admin" }));
    expect(status).toBe(400);
  });

  it("returns 400 when a creator omits their Instagram handle", async () => {
    const { status, body } = await post(validCreator({ instagramHandle: "" }));
    expect(status).toBe(400);
    expect(body.error).toMatch(/instagram/i);
  });

  it("returns 400 when a brand omits their company name", async () => {
    const { status, body } = await post(validBrand({ companyName: "" }));
    expect(status).toBe(400);
    expect(body.error).toMatch(/company/i);
  });

  it("returns 400 when the request body is not JSON", async () => {
    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  // ── DB error propagation ───────────────────────────────────────────────────
  it("returns 500 when Supabase insert fails", async () => {
    const chain = qChain();
    (chain.insert as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { message: "duplicate key" },
    });
    mockedCreateClient.mockReturnValue(mockClient({ fromFn: () => chain }) as ReturnType<typeof mockClient>);

    const { status, body } = await post(validBrand());
    expect(status).toBe(500);
    expect(body.error).toBeTruthy();
  });
});
