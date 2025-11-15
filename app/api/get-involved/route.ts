// app/api/get-involved/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveGetInvolvedSubmission } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, phone, area, linkedin, instagram, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    await saveGetInvolvedSubmission({
      name: String(name),
      email: String(email),
      phone: phone ? String(phone) : undefined,
      area: area ? String(area) : undefined,
      linkedin: linkedin ? String(linkedin) : undefined,
      instagram: instagram ? String(instagram) : undefined,
      message: message ? String(message) : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error in /api/get-involved:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
