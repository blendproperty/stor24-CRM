import { createBlendSignLeaseEnvelope } from "@/lib/blendsign-client";
import { db } from "@/lib/db";
import { attachBlendSignEnvelope, type MoveInResult } from "@/lib/leasing-service";
import type { RequestScope } from "@/lib/scope";

export async function dispatchBlendSignLease(scope: RequestScope, result: MoveInResult, input: { paymentMethod: "DEBIT_ORDER" | "CARD" | "EFT" | "OTHER"; startDate: Date; monthlyRate?: number }) {
  const representative = await db.user.findUnique({ where: { id: scope.userId }, select: { name: true, email: true } });
  if (!representative) throw new Error("UNAUTHENTICATED");
  const profile = await db.configurationProfile.findFirst({ where: { organisationId: scope.organisationId, facilityId: result.facility.id, domain: "PROGRAM_DEFAULTS", name: "Default", status: "READY" }, select: { config: true } });
  const config = profile?.config && typeof profile.config === "object" && !Array.isArray(profile.config) ? profile.config as Record<string, unknown> : {};
  const defaults = config.defaults && typeof config.defaults === "object" && !Array.isArray(config.defaults) ? config.defaults as Record<string, unknown> : {};
  const moveIn = defaults["Move In"] && typeof defaults["Move In"] === "object" && !Array.isArray(defaults["Move In"]) ? defaults["Move In"] as Record<string, unknown> : {};
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
    autoCountersign: moveIn.blendSignAutoCountersign === true,
  });
  await attachBlendSignEnvelope(scope, result.document.id, envelope);
  return envelope;
}
