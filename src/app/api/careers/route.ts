import { NextResponse } from "next/server";
import { insert } from "@/lib/db";
import { formRateLimitResponse } from "@/lib/form-rate-limit";
import { sendNotification } from "@/lib/mailer";
import {
  HONEYPOT_FIELD,
  isHoneypotFilled,
  noteHoneypotHit,
} from "@/lib/spam";
import { nullableText, text, validateCommon } from "@/lib/validation";

/** Mirrors the limit shown on the form and enforced client-side. */
const RESUME_MAX_BYTES = 2.4 * 1024 * 1024;
const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];

export async function POST(request: Request) {
  // Before the body is even parsed, so a flood costs as little as possible.
  const limited = formRateLimitResponse(request, "/api/careers");
  if (limited) return limited;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected multipart form data." },
      { status: 400 }
    );
  }

  // Honeypot: report success so the bot does not retry or adapt, but store
  // nothing and send no email. Checked before anything else, so an automated
  // upload is discarded without the resume ever being read into memory.
  if (isHoneypotFilled(form.get(HONEYPOT_FIELD))) {
    noteHoneypotHit("/api/careers");
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const name = text(form.get("name"), 255);
  const email = text(form.get("email"), 254);
  const phone = text(form.get("phone"), 50);
  const yearsExperience = nullableText(form.get("yearsExperience"), 60);
  const startDate = nullableText(form.get("startDate"), 120);
  const expectedWage = nullableText(form.get("expectedWage"), 120);
  const comments = nullableText(form.get("comments"), 5000);

  // Sent as repeated fields so the order the applicant ticked them is kept.
  const proficiencies = form
    .getAll("proficiencies")
    .map((value) => text(value, 120))
    .filter(Boolean);

  const errors = validateCommon({ name, email, phone, requirePhone: true });

  const resume = form.get("resume");
  let resumeBuffer: Buffer | null = null;
  let resumeFilename: string | null = null;
  let resumeMimetype: string | null = null;

  if (resume instanceof File && resume.size > 0) {
    const lowerName = resume.name.toLowerCase();
    const hasAllowedExtension = ALLOWED_RESUME_EXTENSIONS.some((extension) =>
      lowerName.endsWith(extension)
    );

    if (!hasAllowedExtension) {
      errors.resume = "Resume must be a PDF, DOC or DOCX file.";
    } else if (resume.size > RESUME_MAX_BYTES) {
      errors.resume = "Resume must be smaller than 2.4MB.";
    } else {
      resumeBuffer = Buffer.from(await resume.arrayBuffer());
      resumeFilename = text(resume.name, 255);
      resumeMimetype = text(resume.type, 120) || "application/octet-stream";
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  let id: number;
  try {
    id = await insert(
      `INSERT INTO career_applications
         (name, email, phone, years_experience, start_date, expected_wage,
          proficiencies, comments, resume_filename, resume_mimetype, resume_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        yearsExperience,
        startDate,
        expectedWage,
        proficiencies.length > 0 ? JSON.stringify(proficiencies) : null,
        comments,
        resumeFilename,
        resumeMimetype,
        resumeBuffer,
      ]
    );
  } catch (error) {
    console.error("[api/careers] Database insert failed:", error);
    return NextResponse.json(
      { error: "We couldn't save your application. Please try again." },
      { status: 500 }
    );
  }

  console.log(`[api/careers] Stored career_applications row ${id}`);

  await sendNotification({
    dashboardPath: `/admin?tab=careers&id=${id}`,
    subject: `New career application from ${name}`,
    replyTo: email,
    lines: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone],
      ["Years of experience", yearsExperience ?? ""],
      ["Available to start", startDate ?? ""],
      ["Expected wage", expectedWage ?? ""],
      ["Proficient in", proficiencies.join(", ")],
      ["Comments", comments ?? ""],
      ["Resume", resumeFilename ?? "Not attached"],
    ],
    attachments:
      resumeBuffer && resumeFilename
        ? [
            {
              filename: resumeFilename,
              content: resumeBuffer,
              contentType: resumeMimetype ?? undefined,
            },
          ]
        : undefined,
  });

  // Body is deliberately identical to the honeypot response above, so an
  // automated submitter cannot tell a discarded post from a stored one. The row
  // id stays server-side; nothing in the UI needs it.
  return NextResponse.json({ ok: true }, { status: 201 });
}
