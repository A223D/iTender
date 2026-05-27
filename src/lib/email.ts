import { Resend } from "resend";

import { APP_URL, MESSAGE_PREVIEW_MAX } from "@/lib/app-config";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_NAME = process.env.RESEND_FROM_NAME ?? "Scout for Business";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL!;
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;
const APP_ORIGIN = APP_URL.replace(/\/$/, "");

type EmailAction = {
  label: string;
  href: string;
};

type EmailContent = {
  preheader: string;
  eyebrow: string;
  title: string;
  body: string[];
  action: EmailAction;
  note?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value: string) {
  return escapeHtml(value);
}

function absoluteUrl(path: string) {
  return `${APP_ORIGIN}${path}`;
}

function paragraph(text: string) {
  return `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#475569;">
      ${escapeHtml(text)}
    </p>
  `;
}

function textFallback(content: EmailContent) {
  return [
    content.title,
    "",
    ...content.body,
    "",
    `${content.action.label}: ${content.action.href}`,
    content.note ? ["", content.note] : [],
  ].flat().join("\n");
}

function renderEmail(content: EmailContent) {
  const safePreheader = escapeHtml(content.preheader);
  const safeEyebrow = escapeHtml(content.eyebrow);
  const safeTitle = escapeHtml(content.title);
  const safeActionLabel = escapeHtml(content.action.label);
  const safeActionHref = escapeAttr(content.action.href);
  const logoUrl = absoluteUrl("/logo-mark.png");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#fbf7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;">
      ${safePreheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fbf7ff;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px;">
            <tr>
              <td style="padding:0 0 14px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <img src="${escapeAttr(logoUrl)}" width="32" height="32" alt="Scout" style="display:block;border:0;border-radius:10px;">
                    </td>
                    <td style="vertical-align:middle;padding-left:10px;">
                      <div style="font-size:16px;font-weight:800;letter-spacing:-0.01em;color:#0f172a;">Scout</div>
                      <div style="font-size:12px;line-height:1.2;color:#64748b;">Creator partnerships, made clear</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background:#fffffe;border:1px solid #ece7f3;border-radius:24px;box-shadow:0 18px 48px rgba(15,23,42,0.08);overflow:hidden;">
                <div style="height:6px;background:#0f172a;"></div>
                <div style="padding:34px 32px 30px;">
                  <div style="margin:0 0 14px;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#0891b2;">
                    ${safeEyebrow}
                  </div>
                  <h1 style="margin:0 0 18px;font-size:28px;line-height:1.18;font-weight:800;letter-spacing:-0.03em;color:#0f172a;">
                    ${safeTitle}
                  </h1>
                  ${content.body.map(paragraph).join("")}

                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                    <tr>
                      <td style="border-radius:999px;background:#0f172a;">
                        <a href="${safeActionHref}" style="display:inline-block;padding:14px 22px;font-size:14px;font-weight:800;line-height:1;color:#fffffe;text-decoration:none;border-radius:999px;">
                          ${safeActionLabel} &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                  ${content.note ? `
                    <p style="margin:22px 0 0;font-size:13px;line-height:1.55;color:#64748b;">
                      ${escapeHtml(content.note)}
                    </p>
                  ` : ""}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 4px 0;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                  Sent by Scout. Find creators that fit your brand.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendScoutEmail({
  to,
  subject,
  content,
}: {
  to: string;
  subject: string;
  content: EmailContent;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: renderEmail(content),
    text: textFallback(content),
  });
}

export async function sendWelcomeEmail(to: string, brandName?: string) {
  const safeBrandName = brandName?.trim();
  const title = safeBrandName ? `${safeBrandName} is ready for Scout` : "Welcome to Scout";

  await sendScoutEmail({
    to,
    subject: `Welcome to ${FROM_NAME}`,
    content: {
      preheader: "Your Scout business account is ready.",
      eyebrow: "Welcome",
      title,
      body: [
        "Your account is set up. You can create campaigns, review creator applications, and keep every collaboration in one place.",
        "Start with a clear brief: deliverables, compensation, timeline, and the kind of creator who fits your brand.",
      ],
      action: {
        label: "Go to dashboard",
        href: `${APP_ORIGIN}/dashboard`,
      },
      note: "Questions? Reply to this email and we will help.",
    },
  });
}

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
  const safeCreatorName = creatorName.trim() || "A creator";
  const safeCampaignTitle = campaignTitle.trim() || "your campaign";

  await sendScoutEmail({
    to,
    subject: `New application on "${safeCampaignTitle}"`,
    content: {
      preheader: `${safeCreatorName} applied to ${safeCampaignTitle}.`,
      eyebrow: "New application",
      title: `${safeCreatorName} applied`,
      body: [
        `${safeCreatorName} just applied to "${safeCampaignTitle}".`,
        "Review their profile, pitch, and social reach before deciding whether to start a match.",
      ],
      action: {
        label: "Review applicant",
        href: dashboardUrl,
      },
      note: "You are receiving this because you have an active campaign on Scout.",
    },
  });
}

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
  const safeCreatorName = creatorName.trim() || "A creator";
  const cleanPreview = messagePreview.trim();
  const preview = cleanPreview.length > MESSAGE_PREVIEW_MAX
    ? `${cleanPreview.slice(0, MESSAGE_PREVIEW_MAX).trimEnd()}...`
    : cleanPreview;

  await sendScoutEmail({
    to,
    subject: `${safeCreatorName} sent you a message`,
    content: {
      preheader: preview ? `${safeCreatorName}: ${preview}` : `${safeCreatorName} sent you a message.`,
      eyebrow: "New message",
      title: `${safeCreatorName} sent a message`,
      body: [
        preview ? `"${preview}"` : "You have a new message waiting in Scout.",
        "Open the conversation to reply and keep the collaboration moving.",
      ],
      action: {
        label: "Open conversation",
        href: chatUrl,
      },
      note: `You are receiving this because you are matched with ${safeCreatorName} on Scout.`,
    },
  });
}
