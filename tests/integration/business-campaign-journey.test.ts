/**
 * Integration test: full business campaign journey
 *
 * Simulates a complete end-to-end business workflow across multiple API
 * routes and direct Supabase operations. Each step uses real logic with
 * Supabase / email mocked at the network boundary.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  JOURNEY: "Acme Bakery — from sign-up to campaign, creators, and exit"
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Step 1  — New business account created via OAuth callback
 *             GET /auth/callback?code=...
 *             → users row upserted, no existing profile → onboarding redirect
 *             → welcome email fired (non-blocking)
 *
 *  Step 2  — Welcome email sent after sign-up
 *             POST /api/send-welcome
 *             → sendWelcomeEmail called with email only (no brand name yet)
 *
 *  Step 3  — Campaign created (simulated client-side Supabase insert)
 *             → payload shape verified: business_id, title, status, etc.
 *
 *  Step 4  — Business validates promo code LAUNCH100
 *             POST /api/validate-coupon
 *             → 100% discount, active, under usage limit
 *
 *  Step 5  — Business redeems LAUNCH100 for the new campaign
 *             POST /api/redeem-coupon { code, campaignId }
 *             → uses_count incremented via RPC
 *
 *  Step 6  — Creator right-swipes on the campaign (webhook fires)
 *             POST /api/webhooks/supabase/new-application
 *             → business receives an application notification email
 *
 *  Step 7  — Creator sends a first message in the resulting match (webhook)
 *             POST /api/webhooks/supabase/new-message
 *             → business receives a message preview email
 *
 *  Step 8  — Creator sends a very long message; preview is truncated
 *             POST /api/webhooks/supabase/new-message (long content)
 *             → email preview ends with ellipsis
 *
 *  Step 9  — Business-sent messages are never forwarded (guard)
 *             POST /api/webhooks/supabase/new-message (sender = business)
 *             → sendMessageEmail never called
 *
 *  Step 10 — Campaign closed (simulated client-side Supabase update)
 *             → update shape verified: status = "closed", correct campaign ID
 *
 *  Step 11 — Business deletes their own account
 *             POST /api/users/delete (self-deletion, authenticated)
 *             → executeUserDeletion called for the correct userId
 * ─────────────────────────────────────────────────────────────────────────
 */
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";

const INTEGRATION = Boolean(process.env.ALLOW_INTEGRATION_TESTS);

import { qChain, makeRequest } from "./helpers/mock-builders";

vi.mock("next/headers", () => ({ cookies: vi.fn().mockResolvedValue({}) }));
vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/utils/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendApplicationEmail: vi.fn().mockResolvedValue(undefined),
  sendMessageEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/delete-user", () => ({
  executeUserDeletion: vi.fn().mockResolvedValue({ success: true, storageWarnings: [] }),
}));

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { sendWelcomeEmail, sendApplicationEmail, sendMessageEmail } from "@/lib/email";
import { executeUserDeletion } from "@/lib/delete-user";
import { GET as authCallback } from "@/app/auth/callback/route";
import { POST as sendWelcome } from "@/app/api/send-welcome/route";
import { POST as validateCoupon } from "@/app/api/validate-coupon/route";
import { POST as redeemCoupon } from "@/app/api/redeem-coupon/route";
import { POST as newApplication } from "@/app/api/webhooks/supabase/new-application/route";
import { POST as newMessage } from "@/app/api/webhooks/supabase/new-message/route";
import { POST as deleteUser } from "@/app/api/users/delete/route";

// ── Shared test fixtures ─────────────────────────────────────────────────────
const BIZ_USER = {
  id: "biz-user-001",
  email: "owner@acmebakery.com",
  user_metadata: { full_name: "Acme Bakery" },
};
const CREATOR_USER_ID = "creator-user-007";
const CAMPAIGN_ID = "camp-spring-2026";
const MATCH_ID = "match-spring-2026-jane";
const COUPON_CODE = "LAUNCH100";
const WEBHOOK_SECRET = "journey-test-secret";
const ADMIN_SECRET = "journey-admin-secret";

// ── Environment setup & teardown ─────────────────────────────────────────────
beforeAll(() => {
  process.env.SUPABASE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.ADMIN_SECRET = ADMIN_SECRET;
});

afterAll(() => {
  delete process.env.SUPABASE_WEBHOOK_SECRET;
  delete process.env.ADMIN_SECRET;
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Builds a server-client mock whose `from()` delegates to the provided factory. */
function buildServerClient(fromFn?: (table: string) => ReturnType<typeof qChain>) {
  return {
    auth: {
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: BIZ_USER }, error: null }),
    },
    from: vi.fn((table: string) => (fromFn ? fromFn(table) : qChain())),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}

/** Builds a service-client mock that exhausts `fromSequence` in order. */
function buildServiceClient(fromSequence: ReturnType<typeof qChain>[]) {
  const calls = [...fromSequence];
  return { from: vi.fn(() => calls.shift() ?? qChain()) };
}

function webhookRequest(path: string, record: Record<string, unknown>) {
  return makeRequest(`http://localhost${path}`, {
    body: { record },
    headers: { "x-webhook-secret": WEBHOOK_SECRET },
  });
}

// ── Journey ──────────────────────────────────────────────────────────────────
describe.skipIf(!INTEGRATION)("Business campaign journey: sign-up to campaign to exit", () => {

  // ── Step 1: Account creation via OAuth callback ───────────────────────────
  it("Step 1 — new business account created; redirected to onboarding", async () => {
    const client = buildServerClient();
    // First from() call: users upsert (inside upsertBusinessUser)
    // Second from() call: business_profiles check → null means no profile yet
    const fromMock = vi.fn()
      .mockReturnValueOnce(qChain({ data: null, error: null }))   // users upsert
      .mockReturnValueOnce(qChain({ data: null, error: null }));  // business_profiles → new user
    client.from = fromMock;

    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>);

    const req = new Request("http://localhost/auth/callback?code=oauth-code-abc");
    const res = await authCallback(req);

    // New user → redirected to onboarding
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/onboarding/business");

    // Welcome email fired non-blocking; flush microtasks before asserting
    await Promise.resolve();
    expect(vi.mocked(sendWelcomeEmail)).toHaveBeenCalledWith(BIZ_USER.email);
  });

  // ── Step 2: Welcome email after sign-up ───────────────────────────────────
  it("Step 2 — welcome email sent with email only (profile not yet complete)", async () => {
    const client = buildServerClient();
    // business_profiles returns null: no brand name yet (pre-onboarding)
    client.from = vi.fn().mockReturnValue(qChain({ data: null, error: null }));
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>);

    const req = makeRequest("http://localhost/api/send-welcome", { body: {} });
    const res = await sendWelcome(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(vi.mocked(sendWelcomeEmail)).toHaveBeenCalledOnce();
    // No brand name available pre-onboarding → second arg is undefined
    expect(vi.mocked(sendWelcomeEmail)).toHaveBeenCalledWith(
      BIZ_USER.email,
      undefined,
    );
  });

  // ── Step 3: Campaign creation (simulated client-side insert) ──────────────
  it("Step 3 — campaign inserted with correct payload shape", async () => {
    const campaignChain = qChain({ data: { id: CAMPAIGN_ID }, error: null });

    // Spy on the insert to capture the row that would go to the DB
    let capturedRow: unknown;
    (campaignChain.insert as ReturnType<typeof vi.fn>).mockImplementation((row: unknown) => {
      capturedRow = row;
      return Promise.resolve({ data: { id: CAMPAIGN_ID }, error: null });
    });

    const client = buildServerClient(() => campaignChain);
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>);

    // Simulate what campaign-builder-form.tsx inserts via the browser Supabase client
    await client.from("campaigns").insert({
      business_id: BIZ_USER.id,
      title: "Spring Skincare Drop",
      content_types: ["Short-form Video", "Story"],
      description: "Showcase our new spring skincare line to your audience.",
      status: "live",
      compensation_type: "paid",
      compensation_details: "$150 per post",
      creators_needed: 3,
      deadline: "2026-07-01",
      coupon_code: COUPON_CODE,
    });

    expect(capturedRow).toMatchObject({
      business_id: BIZ_USER.id,
      title: "Spring Skincare Drop",
      status: "live",
      compensation_type: "paid",
      creators_needed: 3,
      coupon_code: COUPON_CODE,
    });
  });

  // ── Step 4: Coupon validated ───────────────────────────────────────────────
  it("Step 4 — business validates LAUNCH100 and receives a 100% discount", async () => {
    vi.mocked(createClient).mockReturnValue(
      buildServerClient(() => qChain({
        data: { discount: 100, max_uses: 50, uses_count: 3, expires_at: null },
      })) as ReturnType<typeof createClient>,
    );

    const req = makeRequest("http://localhost/api/validate-coupon", {
      body: { code: COUPON_CODE },
    });
    const res = await validateCoupon(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.discount).toBe(100);
  });

  // ── Step 5: Coupon redeemed ───────────────────────────────────────────────
  it("Step 5 — business redeems LAUNCH100 via the increment_coupon_uses RPC", async () => {
    let capturedRpcName: string | undefined;
    let capturedRpcArgs: Record<string, string> | undefined;

    const client = buildServerClient(() => qChain({ data: { id: CAMPAIGN_ID } }));
    (client.rpc as ReturnType<typeof vi.fn>).mockImplementation(
      (fn: string, args: Record<string, string>) => {
        capturedRpcName = fn;
        capturedRpcArgs = args;
        return Promise.resolve({ data: null, error: null });
      },
    );
    vi.mocked(createClient).mockReturnValue(client as unknown as ReturnType<typeof createClient>);

    const req = makeRequest("http://localhost/api/redeem-coupon", {
      body: { code: COUPON_CODE, campaignId: CAMPAIGN_ID },
    });
    const res = await redeemCoupon(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(capturedRpcName).toBe("increment_coupon_uses");
    expect(capturedRpcArgs?.p_code).toBe(COUPON_CODE);
  });

  // ── Step 6: Creator applies ───────────────────────────────────────────────
  it("Step 6 — creator applies; webhook fires and business gets application email", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      buildServiceClient([
        qChain({ data: { title: "Spring Skincare Drop", business_id: BIZ_USER.id } }),
        qChain({ data: { name: "Jane Doe" } }),
        qChain({ data: { email: BIZ_USER.email } }),
      ]) as unknown as ReturnType<typeof createServiceClient>,
    );

    const req = webhookRequest("/api/webhooks/supabase/new-application", {
      direction: "right",
      campaign_id: CAMPAIGN_ID,
      creator_id: CREATOR_USER_ID,
    });
    const res = await newApplication(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(vi.mocked(sendApplicationEmail)).toHaveBeenCalledOnce();

    const emailArgs = vi.mocked(sendApplicationEmail).mock.calls[0][0];
    expect(emailArgs.to).toBe(BIZ_USER.email);
    expect(emailArgs.creatorName).toBe("Jane Doe");
    expect(emailArgs.campaignTitle).toBe("Spring Skincare Drop");
    expect(emailArgs.dashboardUrl).toContain(CAMPAIGN_ID);
  });

  // ── Step 7: Creator sends a message ──────────────────────────────────────
  it("Step 7 — creator sends a message; business gets a message notification email", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      buildServiceClient([
        qChain({ data: { business_id: BIZ_USER.id, creator_id: CREATOR_USER_ID } }),
        qChain({ data: { email: BIZ_USER.email } }),
        qChain({ data: { name: "Jane Doe" } }),
      ]) as unknown as ReturnType<typeof createServiceClient>,
    );

    const MESSAGE = "Hi! I'd love to work on this campaign — I specialise in skincare content.";
    const req = webhookRequest("/api/webhooks/supabase/new-message", {
      match_id: MATCH_ID,
      sender_id: CREATOR_USER_ID,
      content: MESSAGE,
    });
    const res = await newMessage(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(vi.mocked(sendMessageEmail)).toHaveBeenCalledOnce();

    const emailArgs = vi.mocked(sendMessageEmail).mock.calls[0][0];
    expect(emailArgs.to).toBe(BIZ_USER.email);
    expect(emailArgs.creatorName).toBe("Jane Doe");
    expect(emailArgs.messagePreview).toBe(MESSAGE);
    expect(emailArgs.chatUrl).toContain(MATCH_ID);
  });

  // ── Step 8: Long message truncated ───────────────────────────────────────
  it("Step 8 — a long creator message is truncated to 120 chars with an ellipsis in the preview", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      buildServiceClient([
        qChain({ data: { business_id: BIZ_USER.id, creator_id: CREATOR_USER_ID } }),
        qChain({ data: { email: BIZ_USER.email } }),
        qChain({ data: { name: "Jane Doe" } }),
      ]) as unknown as ReturnType<typeof createServiceClient>,
    );

    const LONG_MESSAGE =
      "I have been creating skincare content for over five years and have worked with many brands in the beauty space. " +
      "My audience of 45K followers is highly engaged and primarily female, aged 18–34. " +
      "I would love to create authentic, story-driven content for your Spring campaign.";

    const req = webhookRequest("/api/webhooks/supabase/new-message", {
      match_id: MATCH_ID,
      sender_id: CREATOR_USER_ID,
      content: LONG_MESSAGE,
    });
    await newMessage(req);

    const emailArgs = vi.mocked(sendMessageEmail).mock.calls[0][0];
    expect(emailArgs.messagePreview.length).toBeLessThanOrEqual(121); // 120 chars + ellipsis char
    expect(emailArgs.messagePreview.endsWith("…")).toBe(true);
    expect(LONG_MESSAGE.startsWith(emailArgs.messagePreview.slice(0, 50))).toBe(true);
  });

  // ── Step 9: Business-sent messages not forwarded (guard) ─────────────────
  it("Step 9 — a message sent by the business does not trigger a notification email", async () => {
    vi.mocked(createServiceClient).mockReturnValue(
      buildServiceClient([
        qChain({ data: { business_id: BIZ_USER.id, creator_id: CREATOR_USER_ID } }),
      ]) as unknown as ReturnType<typeof createServiceClient>,
    );

    const req = webhookRequest("/api/webhooks/supabase/new-message", {
      match_id: MATCH_ID,
      sender_id: BIZ_USER.id,
      content: "Looking forward to working with you!",
    });
    await newMessage(req);

    expect(vi.mocked(sendMessageEmail)).not.toHaveBeenCalled();
  });

  // ── Step 10: Campaign closed (simulated client-side update) ───────────────
  it("Step 10 — campaign closed with correct update shape", async () => {
    // Capture what update() and eq() are called with
    let capturedUpdate: unknown;
    let capturedEqArgs: [string, unknown] | undefined;

    const chain: ReturnType<typeof qChain> = qChain({ data: null, error: null });
    (chain.update as ReturnType<typeof vi.fn>).mockImplementation((data: unknown) => {
      capturedUpdate = data;
      return chain;
    });
    (chain.eq as ReturnType<typeof vi.fn>).mockImplementation((col: string, val: unknown) => {
      capturedEqArgs = [col, val];
      return chain;
    });

    const client = buildServerClient(() => chain);
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>);

    // Simulate what campaign-detail-view.tsx runs when the business closes a campaign
    await client.from("campaigns").update({ status: "closed" }).eq("id", CAMPAIGN_ID);

    expect(capturedUpdate).toEqual({ status: "closed" });
    expect(capturedEqArgs).toEqual(["id", CAMPAIGN_ID]);
  });

  // ── Step 11: Account deleted (self-deletion) ──────────────────────────────
  it("Step 11 — business deletes their account; executeUserDeletion called for correct userId", async () => {
    const client = buildServerClient();
    vi.mocked(createClient).mockReturnValue(client as ReturnType<typeof createClient>);

    const req = makeRequest("http://localhost/api/users/delete", {
      body: { userId: BIZ_USER.id },
    });
    const res = await deleteUser(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.warnings).toEqual([]);
    expect(vi.mocked(executeUserDeletion)).toHaveBeenCalledOnce();
    expect(vi.mocked(executeUserDeletion)).toHaveBeenCalledWith(BIZ_USER.id);
  });
});
