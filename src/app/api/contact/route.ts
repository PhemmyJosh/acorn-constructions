import { NextResponse } from "next/server";
import { insert } from "@/lib/db";
import { sendNotification } from "@/lib/mailer";
import {
  HONEYPOT_FIELD,
  isHoneypotFilled,
  noteHoneypotHit,
} from "@/lib/spam";
import { nullableText, text, validateCommon } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;

  // Honeypot: report success so the bot does not retry or adapt, but store
  // nothing and send no email. Checked before validation so the response looks
  // identical whatever else the bot filled in.
  if (isHoneypotFilled(body[HONEYPOT_FIELD])) {
    noteHoneypotHit("/api/contact");
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const name = text(body.name, 255);
  const email = text(body.email, 254);
  const phone = nullableText(body.phone, 50);
  const message = text(body.message, 5000);

  const errors = validateCommon({ name, email });
  if (!message) errors.message = "Message is required.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  let id: number;
  try {
    id = await insert(
      `INSERT INTO contact_submissions (name, email, phone, message)
       VALUES (?, ?, ?, ?)`,
      [name, email, phone, message]
    );
  } catch (error) {
    console.error("[api/contact] Database insert failed:", error);
    return NextResponse.json(
      { error: "We couldn't save your message. Please try again." },
      { status: 500 }
    );
  }

  console.log(`[api/contact] Stored contact_submissions row ${id}`);

  // The submission is already stored, so a mail failure must not fail the
  // request; sendNotification logs and reports rather than throwing.
  await sendNotification({
    dashboardPath: `/admin?tab=contact&id=${id}`,
    subject: `New contact message from ${name}`,
    replyTo: email,
    lines: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone ?? ""],
      ["Message", message],
    ],
  });

  // Body is deliberately identical to the honeypot response above, so an
  // automated submitter cannot tell a discarded post from a stored one. The row
  // id stays server-side; nothing in the UI needs it.
  return NextResponse.json({ ok: true }, { status: 201 });
}
