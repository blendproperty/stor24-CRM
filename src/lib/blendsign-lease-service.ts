import { createBlendSignLeaseEnvelope } from "@/lib/blendsign-client";
import { db } from "@/lib/db";
import { attachBlendSignEnvelope, type MoveInResult } from "@/lib/leasing-service";
import type { RequestScope } from "@/lib/scope";

export async function dispatchBlendSignLease(scope: RequestScope, result: MoveInResult, input: { paymentMethod: "DEBIT_ORDER" | "CARD" | "EFT" | "OTHER"; startDate: Date; monthlyRate?: number }) {
  const representative = await db.user.findUnique({ where: { id: scope.userId }, select: { name: true, email: true } });
  if (!representative) throw new Error("UNAUTHENTICATED");
  const envelope = await createBlendSignLeaseEnvelope({
    documentId: result.document.id,
    tenancyId: result.tenancy.id,
    paymentMethod: input.paymentMethod,
    customer: result.customer,
    facility: result.facility,
    unit: result.unit,
    startDate: input.startDate,
    monthlyRate: Number(input.monthlyRate ?? result.unit.monthlyRate),
    representative,
  });
  await attachBlendSignEnvelope(scope, result.document.id, envelope);
  return envelope;
}
