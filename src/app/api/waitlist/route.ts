import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const schema = z.object({
  email: z.string().min(3).max(200).regex(EMAIL_RE),
  name: z.string().min(1).max(80).optional(),
  role: z.enum(["user", "investor", "partner"]).default("user"),
  message: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const { email, name, role, message } = parsed.data;
    const normalized = email.trim().toLowerCase();

    const existing = await db.waitlistEntry.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ ok: true, existing: true });
    }

    const entry = await db.waitlistEntry.create({
      data: { email: normalized, name, role, message },
    });

    const position = await db.waitlistEntry.count();

    return NextResponse.json({ ok: true, position, id: entry.id });
  } catch (err) {
    console.error("[waitlist] POST failed:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await db.waitlistEntry.count();
    return NextResponse.json({ ok: true, count });
  } catch (err) {
    console.error("[waitlist] GET failed:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
