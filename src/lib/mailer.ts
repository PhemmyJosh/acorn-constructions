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

/**
 * Base URL used to build the "View in Dashboard" link.
 *
 * Set APP_URL in production to the real domain (see DEPLOYMENT.md). It is kept
 * separate from metadataBase because notification emails need an absolute URL
 * even while the public domain is still undecided. Any trailing slash is
 * trimmed so the joined path never doubles up.
 */
function appUrl(): string {
  const configured = process.env.APP_URL?.trim();
  return (configured || "http://localhost:3000").replace(/\/+$/, "");
}

export interface NotificationAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

/**
 * Parses NOTIFY_EMAIL into a recipient list.
 *
 * Accepts one address or several separated by commas, so
 * `mark@acornconstruction.ca` and
 * `mark@acornconstruction.ca,notifications@acornconstruction.ca` both work.
 *
 * Entries with no `@` are dropped rather than passed through, and deliberately:
 * a single bad address can make an SMTP server reject the whole message, which
 * would mean *nobody* gets notified because of one typo. Dropping it delivers
 * to everyone else and leaves a warning naming the offending value.
 */
export function notifyRecipients(raw = process.env.NOTIFY_EMAIL): string[] {
  const entries = (raw ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const valid: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!entry.includes("@")) {
      console.warn(
        `[mailer] NOTIFY_EMAIL entry ${JSON.stringify(entry)} is not an email ` +
          "address and was skipped. Separate addresses with commas."
      );
      continue;
    }
    // Case-insensitive dedupe, so the same mailbox listed twice is not mailed
    // twice; the original casing of the first occurrence is kept.
    const key = entry.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    valid.push(entry);
  }

  return valid;
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
  /**
   * Admin path for this submission, e.g. "/admin?tab=contact&id=17". Rendered
   * as a "View in Dashboard" button at the top of the email, and as a plain URL
   * in the text part.
   */
  dashboardPath?: string;
}): Promise<{ sent: boolean; previewUrl?: string }> {
  const recipients = notifyRecipients();
  if (recipients.length === 0) {
    console.warn(
      "[mailer] NOTIFY_EMAIL is not set (or held no usable address), " +
        "skipping notification."
    );
    return { sent: false };
  }

  try {
    const transporter = await getTransporter();

    const dashboardUrl = options.dashboardPath
      ? `${appUrl()}${options.dashboardPath}`
      : null;

    const fields = options.lines
      .map(([label, value]) => `${label}: ${value || "-"}`)
      .join("\n");

    const text = dashboardUrl
      ? `View in Dashboard: ${dashboardUrl}\n\n${fields}`
      : fields;

    // Table-based, inline-styled markup with the palette hardcoded: emails
    // render outside the site's stylesheet, and mail clients are unreliable
    // with anything more modern.
    const button = dashboardUrl
      ? `<p style="margin:0 0 20px;font-family:system-ui,sans-serif"><a href="${escapeHtml(
          dashboardUrl
        )}" style="display:inline-block;background:#c08a3e;color:#262018;font-size:14px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:2px">View in Dashboard</a></p>`
      : "";

    const html = `${button}<table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
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
      // `from` must be a single mailbox. Falling back to the whole recipient
      // list would produce an invalid From header as soon as NOTIFY_EMAIL
      // holds more than one address, so this falls back to the first.
      from: process.env.SMTP_USER?.trim() || recipients[0],
      // An array rather than the raw string: nodemailer tolerates a
      // comma-separated string, but passing the parsed list means the
      // trimming, dedupe and validation above actually apply.
      to: recipients,
      replyTo: options.replyTo,
      subject: options.subject,
      text,
      html,
      attachments: options.attachments,
    });

    const previewUrl = globalForMail.acornUsingEthereal
      ? (nodemailer.getTestMessageUrl(info) as string | false) || undefined
      : undefined;

    // Logged per send because "did it reach everyone?" is otherwise
    // unanswerable after the fact: a server can accept a message for some
    // recipients and refuse it for others, and that is not an error.
    const accepted = (info.accepted ?? []).map(addressOf);
    const rejected = (info.rejected ?? []).map(addressOf);
    console.log(
      `[mailer] Sent "${options.subject}" to ${accepted.length}/` +
        `${recipients.length} recipient(s): ${accepted.join(", ") || "none"}`
    );
    if (rejected.length > 0) {
      console.warn(
        `[mailer] Rejected by the mail server: ${rejected.join(", ")}`
      );
    }

    if (previewUrl) {
      console.log(`[mailer] Preview this email: ${previewUrl}`);
    }

    return { sent: true, previewUrl };
  } catch (error) {
    console.error("[mailer] Failed to send notification:", error);
    return { sent: false };
  }
}

/**
 * nodemailer reports accepted/rejected entries as either a plain string or an
 * `{ address, name }` object depending on the transport, so both are handled.
 */
function addressOf(entry: unknown): string {
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object" && "address" in entry) {
    return String((entry as { address: unknown }).address);
  }
  return String(entry);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
