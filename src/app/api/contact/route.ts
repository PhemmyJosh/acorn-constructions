import { NextResponse } from "next/server";
import { insert } from "@/lib/db";
import { sendNotification } from "@/lib/mailer";
import { nullableText, text, validateCommon } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
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
      { error: "We couldn't save your message. Please try again or call us." },
      { status: 500 }
    );
  }

  // The submission is already stored, so a mail failure must not fail the
  // request; sendNotification logs and reports rather than throwing.
  await sendNotification({
    subject: `New contact message from ${name}`,
    replyTo: email,
    lines: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone ?? ""],
      ["Message", message],
    ],
  });

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
