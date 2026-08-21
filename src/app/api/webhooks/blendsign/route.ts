import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { completeBlendSignEnvelope } from "@/lib/leasing-service";

function validSignature(body: string, header: string | null) {
  const secret = process.env.BLENDSIGN_WEBHOOK_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const supplied = header.slice(7);
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied, "utf8"), Buffer.from(expected, "utf8"));
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!validSignature(body, request.headers.get("x-blendsign-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const event = request.headers.get("x-blendsign-event");
  const envelopeId = typeof payload === "object" && payload !== null && "data" in payload && typeof payload.data === "object" && payload.data !== null && "envelopeId" in payload.data && typeof payload.data.envelopeId === "string" ? payload.data.envelopeId : null;
  if (!event || !envelopeId) return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  if (event !== "envelope.completed") return NextResponse.json({ received: true, ignored: true });

  try {
    const result = await completeBlendSignEnvelope(envelopeId);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "Envelope is not linked to a Stor24 lease." }, { status: 404 });
    throw error;
  }
}
