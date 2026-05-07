import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_NAME = process.env.RESEND_FROM_NAME ?? "Scout for Business";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL!;
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;

// ── Shared layout ─────────────────────────────────────────────────────────────

function layout(body: string) {
  return `
<html>
<body style="margin:0;padding:40px 16px;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:24px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,0.07);">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:52px;height:52px;line-height:52px;background:linear-gradient(135deg,#FF6B6B,#8B5CF6);border-radius:14px;font-size:18px;font-weight:700;color:#fff;text-align:center;">S</div>
      <p style="margin:12px 0 0;font-size:18px;font-weight:600;color:#1a1a1a;">${FROM_NAME}</p>
    </div>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0 20px;">
    <p style="margin:0;font-size:12px;color:#bbb;text-align:center;">${FROM_NAME} &mdash; find creators that fit your brand</p>
  </div>
</body>
</html>`;
}

// ── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, brandName?: string) {
  const greeting = brandName ? `Welcome, ${brandName}!` : "Welcome aboard!";
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to ${FROM_NAME}`,
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1a1a;">${greeting}</h2>
      <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7;">
        Your account is ready. You can now create campaigns, browse creator applications, and start chatting with the creators you choose.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://itender.app"}/dashboard"
         style="display:inline-block;background:#4a7c59;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:14px;text-decoration:none;">
        Go to your dashboard →
      </a>
      <p style="margin:20px 0 0;font-size:13px;color:#999;line-height:1.6;">
        If you have any questions, just reply to this email.
      </p>
    `),
  });
}

// ── New application email ─────────────────────────────────────────────────────

export async function sendApplicationEmail({
  to,
  creatorName,
  campaignTitle,
  dashboardUrl,
}: {
  to: string;
  creatorName: string;
  campaignTitle: string;
  dashboardUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New application on "${campaignTitle}"`,
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1a1a;">You have a new applicant</h2>
      <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.7;">
        <strong>${creatorName}</strong> just applied to your campaign <strong>"${campaignTitle}"</strong>.
        Head to your dashboard to view their profile and decide if it's a match.
      </p>
      <a href="${dashboardUrl}"
         style="display:inline-block;background:#4a7c59;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:14px;text-decoration:none;">
        View application →
      </a>
      <p style="margin:20px 0 0;font-size:13px;color:#999;line-height:1.6;">
        You're receiving this because you have an active campaign on ${FROM_NAME}.
      </p>
    `),
  });
}

// ── New message email ─────────────────────────────────────────────────────────

export async function sendMessageEmail({
  to,
  creatorName,
  messagePreview,
  chatUrl,
}: {
  to: string;
  creatorName: string;
  messagePreview: string;
  chatUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${creatorName} sent you a message`,
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1a1a;">New message</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
        <strong>${creatorName}</strong> sent you a message:
      </p>
      <div style="background:#f5f5f0;border-radius:14px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#333;line-height:1.6;font-style:italic;">"${messagePreview}"</p>
      </div>
      <a href="${chatUrl}"
         style="display:inline-block;background:#4a7c59;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:14px;text-decoration:none;">
        Reply →
      </a>
      <p style="margin:20px 0 0;font-size:13px;color:#999;line-height:1.6;">
        You're receiving this because you're matched with ${creatorName} on ${FROM_NAME}.
      </p>
    `),
  });
}
