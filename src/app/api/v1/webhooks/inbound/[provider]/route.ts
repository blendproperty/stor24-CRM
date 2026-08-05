import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request, context: RouteContext<"/api/v1/webhooks/inbound/[provider]">) {
  const { provider } = await context.params;
  const source = request.headers.get("x-stor24-source");
  const externalEventId = request.headers.get("x-event-id");
  const presentedKey = request.headers.get("x-webhook-key");
  const configuredHash = process.env.WEBHOOK_KEY_SHA256;
  const configuredSource = process.env.WEBHOOK_SOURCE;
  const configuredOrganisationId = process.env.WEBHOOK_ORGANISATION_ID;
  if (!source || !externalEventId || !presentedKey || !configuredHash || !configuredSource || !configuredOrganisationId) {
    return Response.json({ error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Signed webhook source configuration is required." } }, { status: 503 });
  }
  if (!secureEqual(source, configuredSource)) {
    return Response.json({ error: { code: "UNKNOWN_SOURCE", message: "Webhook source is not registered." } }, { status: 401 });
  }
  const presentedHash = createHash("sha256").update(presentedKey).digest("hex");
  if (!secureEqual(presentedHash, configuredHash)) {
    return Response.json({ error: { code: "INVALID_SIGNATURE", message: "Webhook authentication failed." } }, { status: 401 });
  }

  const body = await request.json();
  const organisationId = request.headers.get("x-organisation-id");
  const eventType = request.headers.get("x-event-type");
  if (!organisationId || !eventType) {
    return Response.json({ error: { code: "INVALID_ENVELOPE", message: "Organisation and event type headers are required." } }, { status: 422 });
  }
  if (!secureEqual(organisationId, configuredOrganisationId)) {
    return Response.json({ error: { code: "ORGANISATION_MISMATCH", message: "Webhook source is not registered for this organisation." } }, { status: 403 });
  }

  const existing = await db.webhookInbox.findUnique({ where: { organisationId_provider_externalEventId: { organisationId, provider, externalEventId } } });
  if (existing) return Response.json({ data: { id: existing.id, duplicate: true, status: existing.status } }, { status: 200 });

  const event = await db.webhookInbox.create({ data: { organisationId, provider, externalEventId, eventType, payload: body, headers: { source }, status: "PENDING" } });
  return Response.json({ data: { id: event.id, duplicate: false, status: event.status } }, { status: 202 });
}
