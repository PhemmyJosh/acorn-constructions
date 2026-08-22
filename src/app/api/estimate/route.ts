import { NextResponse } from "next/server";
import { insert } from "@/lib/db";
import { sendNotification } from "@/lib/mailer";
import {
  nullableDate,
  nullableInt,
  nullableText,
  text,
  validateCommon,
} from "@/lib/validation";

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
  const mailingAddress = nullableText(body.mailingAddress, 255);
  const city = nullableText(body.city, 120);
  const province = nullableText(body.region, 120);
  const postalCode = nullableText(body.postalCode, 30);
  const country = nullableText(body.country, 120);
  const buildingType = nullableText(body.buildingType, 60);
  const buildingLocation = nullableText(body.buildingLocation, 255);
  const proposedStartDate = nullableDate(body.startDate);
  const buildingSize = nullableInt(body.buildingSize);
  const description = nullableText(body.buildingDescription, 5000);
  const comments = nullableText(body.additionalComments, 5000);

  const errors = validateCommon({ name, email });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  let id: number;
  try {
    id = await insert(
      `INSERT INTO estimate_requests
         (name, email, phone, mailing_address, city, province, postal_code,
          country, building_type, building_location, proposed_start_date,
          building_size_sqft, description, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        mailingAddress,
        city,
        province,
        postalCode,
        country,
        buildingType,
        buildingLocation,
        proposedStartDate,
        buildingSize,
        description,
        comments,
      ]
    );
  } catch (error) {
    console.error("[api/estimate] Database insert failed:", error);
    return NextResponse.json(
      { error: "We couldn't save your request. Please try again or call us." },
      { status: 500 }
    );
  }

  await sendNotification({
    subject: `New estimate request from ${name}`,
    replyTo: email,
    lines: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone ?? ""],
      ["Mailing address", mailingAddress ?? ""],
      ["City", city ?? ""],
      ["Province / region", province ?? ""],
      ["Postal code", postalCode ?? ""],
      ["Country", country ?? ""],
      ["Building type", buildingType ?? ""],
      ["Building location", buildingLocation ?? ""],
      ["Proposed start date", proposedStartDate ?? ""],
      ["Approximate size (sq ft)", buildingSize === null ? "" : String(buildingSize)],
      ["Description", description ?? ""],
      ["Additional comments", comments ?? ""],
    ],
  });

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
