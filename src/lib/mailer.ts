import nodemailer, { type Transporter } from "nodemailer";

/**
 * Email notifications for form submissions.
 *
 * If SMTP_HOST is set, real SMTP is used. If it is blank (the local dev
 * default), a throwaway Ethereal test account is created on first send and the
 * preview URL for each message is logged, so mail can be inspected in a
 * browser without configuring a mail server.
 */
const globalForMail = globalThis as unknown as {
  acornTransporter?: Transporter;
  acornUsingEthereal?: boolean;
};

async function getTransporter(): Promise<Transporter> {
  if (globalForMail.acornTransporter) return globalForMail.acornTransporter;

  const host = process.env.SMTP_HOST?.trim();

  if (host) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    globalForMail.acornTransporter = nodemailer.createTransport({
      host,
      port,
      // 465 is implicit TLS; 587 and 25 upgrade via STARTTLS.
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
    globalForMail.acornUsingEthereal = false;
    return globalForMail.acornTransporter;
  }

  // No SMTP configured: spin up an Ethereal test inbox.
  const testAccount = await nodemailer.createTestAccount();
  globalForMail.acornTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  globalForMail.acornUsingEthereal = true;

  console.log(
    "\n[mailer] SMTP_HOST is not set, using an Ethereal test inbox.\n" +
      `[mailer] Ethereal login: ${testAccount.user} / ${testAccount.pass}\n`
  );

  return globalForMail.acornTransporter;
}

export interface NotificationAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

/**
 * Sends a notification. Never throws: a mail failure must not lose a
 * submission that has already been written to the database, so problems are
 * logged and reported back as a boolean.
 */
export async function sendNotification(options: {
  subject: string;
  lines: Array<[label: string, value: string]>;
  replyTo?: string;
  attachments?: NotificationAttachment[];
}): Promise<{ sent: boolean; previewUrl?: string }> {
  const to = process.env.NOTIFY_EMAIL?.trim();
  if (!to) {
    console.warn("[mailer] NOTIFY_EMAIL is not set, skipping notification.");
    return { sent: false };
  }

  try {
    const transporter = await getTransporter();

    const text = options.lines
      .map(([label, value]) => `${label}: ${value || "-"}`)
      .join("\n");

    const html = `<table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
${options.lines
  .map(
    ([label, value]) =>
      `<tr><td style="border-bottom:1px solid #eee"><strong>${escapeHtml(
        label
      )}</strong></td><td style="border-bottom:1px solid #eee">${escapeHtml(
        value || "-"
      ).replace(/\n/g, "<br>")}</td></tr>`
  )
  .join("\n")}
</table>`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER?.trim() || to,
      to,
      replyTo: options.replyTo,
      subject: options.subject,
      text,
      html,
      attachments: options.attachments,
    });

    const previewUrl = globalForMail.acornUsingEthereal
      ? (nodemailer.getTestMessageUrl(info) as string | false) || undefined
      : undefined;

    if (previewUrl) {
      console.log(`[mailer] Preview this email: ${previewUrl}`);
    }

    return { sent: true, previewUrl };
  } catch (error) {
    console.error("[mailer] Failed to send notification:", error);
    return { sent: false };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
