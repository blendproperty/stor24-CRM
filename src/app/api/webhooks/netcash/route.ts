/**
 * Inbound Netcash notify/callback endpoint.
 *
 * NOT YET VERIFIED against Netcash's real callback contract -- see the
 * warning in src/lib/payments/netcash-client.ts. In particular, the
 * signature/authenticity check below is a placeholder and MUST be replaced
 * with whatever Netcash actually sends (a hash of shared secret + fields is
 * typical for their older products; confirm for each product used here).
 *
 * Every inbound call is first persisted to WebhookInbox verbatim (so nothing
 * is ever lost even if processing throws), then processed idempotently by
 * externalEventId.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enqueueMriExport } from "@/lib/finance/mri-export";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // TODO: verify authenticity per Netcash's actual callback signing scheme
  // before trusting `payload` to mutate Payment/LedgerEntry records.

  const providerRef: string | undefined = (payload as Record<string, unknown>).reference as string | undefined
    ?? (payload as Record<string, unknown>).Reference as string | undefined;
  const externalEventId: string = (payload as Record<string, unknown>).eventId as string
    ?? providerRef
    ?? `netcash-${Date.now()}`;
  const statusRaw = String((payload as Record<string, unknown>).status ?? (payload as Record<string, unknown>).Status ?? "").toUpperCase();

  const payment = providerRef
    ? await db.payment.findFirst({ where: { provider: "NETCASH", providerRef } })
    : null;

  const inbox = await db.webhookInbox.create({
    data: {
      organisationId: payment ? (await db.account.findUnique({ where: { id: payment.accountId } }).then((a) => a?.customerId ? undefined : undefined)) as unknown as string ?? "UNKNOWN" : "UNKNOWN",
      provider: "NETCASH",
      eventType: statusRaw || "UNKNOWN",
      externalEventId,
      payload: payload as object,
      headers: Object.fromEntries(request.headers.entries()),
      status: "PENDING",
    },
  }).catch(async (err) => {
    // Unique constraint on (organisationId, provider, externalEventId) -- duplicate delivery, that's fine.
    if (err instanceof Error && err.message.includes("Unique constraint")) return null;
    throw err;
  });

  if (!payment) {
    // Nothing to reconcile against yet -- leave the inbox row PENDING for manual triage.
    return NextResponse.json({ received: true, matched: false });
  }

  const succeeded = ["SUCCESS", "SUCCEEDED", "PAID", "COMPLETE", "COMPLETED"].includes(statusRaw);
  const failed = ["FAILED", "DECLINED", "CANCELLED", "REJECTED", "UNPAID"].includes(statusRaw);

  if (succeeded) {
    await db.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED", processedAt: new Date() } });
      await tx.ledgerEntry.create({
        data: {
          accountId: payment.accountId,
          type: "PAYMENT",
          amount: payment.amount,
          description: `Netcash payment received (${payment.method})`,
          effectiveAt: new Date(),
          externalRef: payment.providerRef ?? payment.id,
          metadata: { provider: "NETCASH", webhookPayload: payload },
        },
      });
    });
    await enqueueMriExport(payment.id).catch(() => undefined); // MRI export is best-effort, not payment-blocking
  } else if (failed) {
    await db.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureCode: statusRaw || "NETCASH_REPORTED_FAILURE" } });
  }

  if (inbox) {
    await db.webhookInbox.update({ where: { id: inbox.id }, data: { status: "SUCCEEDED", processedAt: new Date() } });
  }

  return NextResponse.json({ received: true, matched: true });
}
