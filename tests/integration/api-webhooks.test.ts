/**
 * Integration tests for Supabase webhook handlers:
 *   POST /api/webhooks/supabase/new-application
 *   POST /api/webhooks/supabase/new-message
 *
 * These routes use the service-role Supabase client and send transactional
 * emails via Resend. Both are mocked at the module boundary.
 *
 * Skipped unless ALLOW_INTEGRATION_TESTS=true.
 */
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import { qChain, makeRequest } from "./helpers/mock-builders";

vi.mock("@/utils/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/email", () => ({
  sendApplicationEmail: vi.fn().mockResolvedValue(undefined),
  sendMessageEmail: vi.fn().mockResolvedValue(undefined),
}));

import { createServiceClient } from "@/utils/supabase/service";
import { sendApplicationEmail, sendMessageEmail } from "@/lib/email";
import { POST as newApplication } from "@/app/api/webhooks/supabase/new-application/route";
import { POST as newMessage } from "@/app/api/webhooks/supabase/new-message/route";

const mockedServiceClient = vi.mocked(createServiceClient);
const mockedSendApplicationEmail = vi.mocked(sendApplicationEmail);
const mockedSendMessageEmail = vi.mocked(sendMessageEmail);

const INTEGRATION = Boolean(process.env.ALLOW_INTEGRATION_TESTS);

const WEBHOOK_SECRET = "test-secret-xyz";

function withSecret(headers: Record<string, string> = {}) {
  return { "x-webhook-secret": WEBHOOK_SECRET, ...headers };
}

describe.skipIf(!INTEGRATION)("Integration: webhook handlers", () => {
  beforeEach(() => {
    process.env.SUPABASE_WEBHOOK_SECRET = WEBHOOK_SECRET;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.SUPABASE_WEBHOOK_SECRET;
  });

  // ── new-application ────────────────────────────────────────────────────────
  describe("POST /webhooks/supabase/new-application", () => {
    function makeApplicationReq(record: Record<string, unknown>, headers: Record<string, string> = {}) {
      return makeRequest("http://localhost/api/webhooks/supabase/new-application", {
        body: { record },
        headers: withSecret(headers),
      });
    }

    it("returns 401 when the webhook secret is missing", async () => {
      const req = makeRequest("http://localhost/api/webhooks/supabase/new-application", {
        body: { record: {} },
      });
      const res = await newApplication(req);
      expect(res.status).toBe(401);
    });

    it("returns 401 when the webhook secret is wrong", async () => {
      const req = makeRequest("http://localhost/api/webhooks/supabase/new-application", {
        body: { record: {} },
        headers: { "x-webhook-secret": "wrong-secret" },
      });
      const res = await newApplication(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when the payload has no record", async () => {
      const req = makeRequest("http://localhost/api/webhooks/supabase/new-application", {
        body: {},
        headers: withSecret(),
      });
      const res = await newApplication(req);
      expect(res.status).toBe(400);
    });

    it("silently ignores left-swipes (direction !== 'right')", async () => {
      const req = makeApplicationReq({ direction: "left", campaign_id: "c1", creator_id: "u1" });
      const res = await newApplication(req);
      expect(res.status).toBe(200);
      expect(mockedSendApplicationEmail).not.toHaveBeenCalled();
    });

    it("sends an application email on a right-swipe with full data", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(qChain({ data: { title: "Spring Skincare Drop", business_id: "biz-1" } }))
          .mockReturnValueOnce(qChain({ data: { name: "Jane Doe" } }))
          .mockReturnValueOnce(qChain({ data: { email: "owner@acme.com" } })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeApplicationReq({
        direction: "right",
        campaign_id: "camp-001",
        creator_id: "creator-001",
      });
      const res = await newApplication(req);
      expect(res.status).toBe(200);
      expect(mockedSendApplicationEmail).toHaveBeenCalledOnce();
      expect(mockedSendApplicationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "owner@acme.com",
          creatorName: "Jane Doe",
          campaignTitle: "Spring Skincare Drop",
        }),
      );
    });

    it("falls back to 'A creator' when the creator user row has no name", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(qChain({ data: { title: "Drop", business_id: "biz-1" } }))
          .mockReturnValueOnce(qChain({ data: null }))
          .mockReturnValueOnce(qChain({ data: { email: "owner@acme.com" } })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeApplicationReq({ direction: "right", campaign_id: "c1", creator_id: "u1" });
      await newApplication(req);
      expect(mockedSendApplicationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ creatorName: "A creator" }),
      );
    });

    it("does not send email when the campaign is not found", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(qChain({ data: null, error: { message: "not found" } }))
          .mockReturnValueOnce(qChain({ data: { name: "Jane" } })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeApplicationReq({ direction: "right", campaign_id: "missing", creator_id: "u1" });
      const res = await newApplication(req);
      expect(res.status).toBe(200);
      expect(mockedSendApplicationEmail).not.toHaveBeenCalled();
    });

    it("does not send email when the business has no email address", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(qChain({ data: { title: "Drop", business_id: "biz-1" } }))
          .mockReturnValueOnce(qChain({ data: { name: "Jane" } }))
          .mockReturnValueOnce(qChain({ data: null })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeApplicationReq({ direction: "right", campaign_id: "c1", creator_id: "u1" });
      const res = await newApplication(req);
      expect(res.status).toBe(200);
      expect(mockedSendApplicationEmail).not.toHaveBeenCalled();
    });

    it("includes a link to the campaign detail page in the email", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(qChain({ data: { title: "Drop", business_id: "biz-1" } }))
          .mockReturnValueOnce(qChain({ data: { name: "Jane" } }))
          .mockReturnValueOnce(qChain({ data: { email: "owner@acme.com" } })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeApplicationReq({ direction: "right", campaign_id: "camp-42", creator_id: "u1" });
      await newApplication(req);
      const call = mockedSendApplicationEmail.mock.calls[0][0];
      expect(call.dashboardUrl).toMatch(/camp-42/);
    });
  });

  // ── new-message ────────────────────────────────────────────────────────────
  describe("POST /webhooks/supabase/new-message", () => {
    function makeMessageReq(record: Record<string, unknown>) {
      return makeRequest("http://localhost/api/webhooks/supabase/new-message", {
        body: { record },
        headers: withSecret(),
      });
    }

    it("returns 401 for a missing webhook secret", async () => {
      const req = makeRequest("http://localhost/api/webhooks/supabase/new-message", {
        body: { record: {} },
      });
      const res = await newMessage(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when the payload has no record", async () => {
      const req = makeRequest("http://localhost/api/webhooks/supabase/new-message", {
        body: {},
        headers: withSecret(),
      });
      const res = await newMessage(req);
      expect(res.status).toBe(400);
    });

    it("does not send email when the sender is the business (not the creator)", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue(
          qChain({ data: { business_id: "biz-1", creator_id: "creator-1" } }),
        ),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeMessageReq({ match_id: "m1", sender_id: "biz-1", content: "Hello" });
      const res = await newMessage(req);
      expect(res.status).toBe(200);
      expect(mockedSendMessageEmail).not.toHaveBeenCalled();
    });

    it("sends a message email when the creator sends a message", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(qChain({ data: { business_id: "biz-1", creator_id: "creator-1" } }))
          .mockReturnValueOnce(qChain({ data: { email: "owner@acme.com" } }))
          .mockReturnValueOnce(qChain({ data: { name: "Jane Doe" } })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeMessageReq({
        match_id: "match-001",
        sender_id: "creator-1",
        content: "Hi! I'd love to collaborate.",
      });
      const res = await newMessage(req);
      expect(res.status).toBe(200);
      expect(mockedSendMessageEmail).toHaveBeenCalledOnce();
      expect(mockedSendMessageEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "owner@acme.com",
          creatorName: "Jane Doe",
          messagePreview: "Hi! I'd love to collaborate.",
        }),
      );
    });

    it("truncates long message content to MESSAGE_PREVIEW_MAX characters", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(qChain({ data: { business_id: "biz-1", creator_id: "creator-1" } }))
          .mockReturnValueOnce(qChain({ data: { email: "owner@acme.com" } }))
          .mockReturnValueOnce(qChain({ data: { name: "Jane" } })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const longContent = "X".repeat(200);
      const req = makeMessageReq({ match_id: "m1", sender_id: "creator-1", content: longContent });
      await newMessage(req);
      const call = mockedSendMessageEmail.mock.calls[0][0];
      expect(call.messagePreview.length).toBeLessThanOrEqual(200);
      expect(call.messagePreview.endsWith("…")).toBe(true);
    });

    it("includes a link to the correct match chat URL", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn()
          .mockReturnValueOnce(qChain({ data: { business_id: "biz-1", creator_id: "creator-1" } }))
          .mockReturnValueOnce(qChain({ data: { email: "owner@acme.com" } }))
          .mockReturnValueOnce(qChain({ data: { name: "Jane" } })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeMessageReq({ match_id: "match-999", sender_id: "creator-1", content: "Hey" });
      await newMessage(req);
      const call = mockedSendMessageEmail.mock.calls[0][0];
      expect(call.chatUrl).toMatch(/match-999/);
    });

    it("does not send email when the match cannot be found", async () => {
      mockedServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue(qChain({ data: null, error: { message: "not found" } })),
      } as unknown as ReturnType<typeof createServiceClient>);

      const req = makeMessageReq({ match_id: "missing", sender_id: "creator-1", content: "Hey" });
      const res = await newMessage(req);
      expect(res.status).toBe(200);
      expect(mockedSendMessageEmail).not.toHaveBeenCalled();
    });
  });
});
