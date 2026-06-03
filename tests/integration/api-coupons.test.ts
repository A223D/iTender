/**
 * Integration tests for POST /api/validate-coupon and POST /api/redeem-coupon
 *
 * Both routes require an authenticated user (via Supabase session) and
 * interact with the `coupons` and `campaigns` tables.
 *
 * Skipped unless ALLOW_INTEGRATION_TESTS=true.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockClient, qChain, makeRequest } from "./helpers/mock-builders";

vi.mock("next/headers", () => ({ cookies: vi.fn().mockResolvedValue({}) }));
vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/utils/supabase/server";
import { POST as validateCoupon } from "@/app/api/validate-coupon/route";
import { POST as redeemCoupon } from "@/app/api/redeem-coupon/route";

const mockedCreateClient = vi.mocked(createClient);

const INTEGRATION = Boolean(process.env.ALLOW_INTEGRATION_TESTS);

const AUTH_USER = { id: "user-biz-1", email: "owner@acme.com" };

const VALID_COUPON = {
  discount: 100,
  max_uses: 10,
  uses_count: 2,
  expires_at: null,
};

describe.skipIf(!INTEGRATION)("Integration: coupon routes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  // ── validate-coupon ────────────────────────────────────────────────────────
  describe("POST /api/validate-coupon", () => {
    it("returns 401 when no session exists", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({ user: null }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/validate-coupon", { body: { code: "LAUNCH100" } });
      const res = await validateCoupon(req);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.valid).toBe(false);
    });

    it("returns 400 when no code is provided", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({ user: AUTH_USER }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/validate-coupon", { body: {} });
      const res = await validateCoupon(req);
      expect(res.status).toBe(400);
    });

    it("returns valid: true and discount for a valid active coupon", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({
          user: AUTH_USER,
          fromFn: () => qChain({ data: VALID_COUPON }),
        }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/validate-coupon", { body: { code: "LAUNCH100" } });
      const res = await validateCoupon(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.valid).toBe(true);
      expect(body.discount).toBe(100);
    });

    it("normalises the code to uppercase before lookup", async () => {
      let queriedCode: unknown;
      const chain = qChain({ data: VALID_COUPON });
      (chain.eq as ReturnType<typeof vi.fn>).mockImplementation((col: string, val: unknown) => {
        if (col === "code") queriedCode = val;
        return chain;
      });
      mockedCreateClient.mockReturnValue(
        mockClient({ user: AUTH_USER, fromFn: () => chain }) as ReturnType<typeof mockClient>,
      );

      const req = makeRequest("http://localhost/api/validate-coupon", { body: { code: "launch100" } });
      await validateCoupon(req);
      expect(queriedCode).toBe("LAUNCH100");
    });

    it("returns valid: false for an unknown coupon code", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({
          user: AUTH_USER,
          fromFn: () => qChain({ data: null, error: { message: "not found" } }),
        }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/validate-coupon", { body: { code: "BOGUS" } });
      const res = await validateCoupon(req);
      const body = await res.json();
      expect(body.valid).toBe(false);
      expect(body.error).toMatch(/invalid/i);
    });

    it("returns valid: false for an expired coupon", async () => {
      const expired = { ...VALID_COUPON, expires_at: "2020-01-01T00:00:00Z" };
      mockedCreateClient.mockReturnValue(
        mockClient({
          user: AUTH_USER,
          fromFn: () => qChain({ data: expired }),
        }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/validate-coupon", { body: { code: "OLD50" } });
      const res = await validateCoupon(req);
      const body = await res.json();
      expect(body.valid).toBe(false);
      expect(body.error).toMatch(/expired/i);
    });

    it("returns valid: false when the coupon has reached its max uses", async () => {
      const maxed = { ...VALID_COUPON, max_uses: 5, uses_count: 5 };
      mockedCreateClient.mockReturnValue(
        mockClient({
          user: AUTH_USER,
          fromFn: () => qChain({ data: maxed }),
        }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/validate-coupon", { body: { code: "FULL" } });
      const res = await validateCoupon(req);
      const body = await res.json();
      expect(body.valid).toBe(false);
      expect(body.error).toMatch(/limit/i);
    });

    it("accepts a coupon with null max_uses (unlimited uses)", async () => {
      const unlimited = { ...VALID_COUPON, max_uses: null, uses_count: 999 };
      mockedCreateClient.mockReturnValue(
        mockClient({
          user: AUTH_USER,
          fromFn: () => qChain({ data: unlimited }),
        }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/validate-coupon", { body: { code: "UNLIMITED" } });
      const res = await validateCoupon(req);
      const body = await res.json();
      expect(body.valid).toBe(true);
    });
  });

  // ── redeem-coupon ──────────────────────────────────────────────────────────
  describe("POST /api/redeem-coupon", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns 401 when no session exists", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({ user: null }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/redeem-coupon", {
        body: { code: "LAUNCH100", campaignId: "camp-1" },
      });
      const res = await redeemCoupon(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when code is missing", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({ user: AUTH_USER }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/redeem-coupon", {
        body: { campaignId: "camp-1" },
      });
      const res = await redeemCoupon(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 when campaignId is missing", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({ user: AUTH_USER }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/redeem-coupon", {
        body: { code: "LAUNCH100" },
      });
      const res = await redeemCoupon(req);
      expect(res.status).toBe(400);
    });

    it("returns 404 when the campaign does not belong to the authenticated user", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({
          user: AUTH_USER,
          fromFn: () => qChain({ data: null, error: { message: "not found" } }),
        }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/redeem-coupon", {
        body: { code: "LAUNCH100", campaignId: "camp-999" },
      });
      const res = await redeemCoupon(req);
      expect(res.status).toBe(404);
    });

    it("returns 500 when the RPC to increment uses fails", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({
          user: AUTH_USER,
          fromFn: () => qChain({ data: { id: "camp-1" } }),
          rpcError: { message: "rpc error" },
        }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/redeem-coupon", {
        body: { code: "LAUNCH100", campaignId: "camp-1" },
      });
      const res = await redeemCoupon(req);
      expect(res.status).toBe(500);
    });

    it("returns 200 success on a valid redemption", async () => {
      mockedCreateClient.mockReturnValue(
        mockClient({
          user: AUTH_USER,
          fromFn: () => qChain({ data: { id: "camp-1" } }),
        }) as ReturnType<typeof mockClient>,
      );
      const req = makeRequest("http://localhost/api/redeem-coupon", {
        body: { code: "LAUNCH100", campaignId: "camp-1" },
      });
      const res = await redeemCoupon(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("calls increment_coupon_uses RPC with the normalised uppercase code", async () => {
      let capturedRpcArgs: unknown;
      const client = mockClient({
        user: AUTH_USER,
        fromFn: () => qChain({ data: { id: "camp-1" } }),
      });
      (client.rpc as ReturnType<typeof vi.fn>).mockImplementation(
        (_fn: string, args: unknown) => {
          capturedRpcArgs = args;
          return Promise.resolve({ data: null, error: null });
        },
      );
      mockedCreateClient.mockReturnValue(client as ReturnType<typeof mockClient>);

      const req = makeRequest("http://localhost/api/redeem-coupon", {
        body: { code: "launch100", campaignId: "camp-1" },
      });
      await redeemCoupon(req);
      expect((capturedRpcArgs as { p_code: string }).p_code).toBe("LAUNCH100");
    });
  });
});
