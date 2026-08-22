import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { query } from "@/lib/db";

interface ResumeRow {
  resume_filename: string | null;
  resume_mimetype: string | null;
  resume_data: Buffer | null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const applicationId = Number(id);
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let rows: ResumeRow[];
  try {
    rows = await query<ResumeRow>(
      `SELECT resume_filename, resume_mimetype, resume_data
         FROM career_applications
        WHERE id = ?`,
      [applicationId]
    );
  } catch (error) {
    console.error("[api/admin/resume] Query failed:", error);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  const row = rows[0];
  if (!row?.resume_data) {
    return NextResponse.json({ error: "No resume on file." }, { status: 404 });
  }

  // Strip any path separators so a stored filename can never escape the
  // Content-Disposition value.
  const filename = (row.resume_filename ?? `resume-${applicationId}`).replace(
    /[^\w.\-() ]/g,
    "_"
  );

  return new NextResponse(new Uint8Array(row.resume_data), {
    status: 200,
    headers: {
      "Content-Type": row.resume_mimetype ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(row.resume_data.length),
      "Cache-Control": "no-store",
    },
  });
}
