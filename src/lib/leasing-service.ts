import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { facilityWhere, requireFacility, type RequestScope } from "@/lib/scope";
import { revokeBiometricAccess } from "@/lib/biometric-access-service";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">;

function audit(tx: Tx, scope: RequestScope, action: string, entityType: string, entityId: string, facilityId?: string, before?: Prisma.InputJsonValue, after?: Prisma.InputJsonValue) {
  return tx.auditEvent.create({ data: { organisationId: scope.organisationId, facilityId, actorId: scope.userId, action, entityType, entityId, before, after } });
}

// NOTE: This is v1 boilerplate for the STOR 24 storage licence agreement, sufficient to
// support a "simple electronic signature" under South Africa's ECT Act (identity + intent
// to sign + an audit trail, captured below). It is not a substitute for review by an
// attorney before go-live — Brett/legal should confirm final terms, insurance and
// indemnity wording before this is relied on as the binding contract text.
export function renderLeaseAgreement(input: { facilityName: string; unitNumber: string; unitTypeName?: string; customerName: string; monthlyRate: number; startDate: Date }) {
  const formattedRate = `R ${input.monthlyRate.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const formattedDate = input.startDate.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
  return [
    "STOR 24 SELF-STORAGE LICENCE AGREEMENT",
    "",
    `Facility: ${input.facilityName}`,
    `Unit: ${input.unitNumber}${input.unitTypeName ? ` (${input.unitTypeName})` : ""}`,
    `Licensee: ${input.customerName}`,
    `Monthly rate: ${formattedRate} (excl. applicable tax, subject to STOR 24's standard terms)`,
    `Commencement date: ${formattedDate}`,
    "",
    "By signing below, the Licensee confirms they have read, understood and agree to be bound by STOR 24's standard storage licence terms and conditions, including access, insurance and payment obligations, as made available at the facility and on the STOR 24 website.",
  ].join("\n");
}

export function hashDocument(content: string) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export async function listLeasing(scope: RequestScope) {
  const facilities = await db.facility.findMany({
    where: facilityWhere(scope), orderBy: { name: "asc" },
    include: { unitTypes: { orderBy: { name: "asc" } }, units: { include: { unitType: true }, orderBy: { number: "asc" } } },
  });
  const facilityIds = facilities.map((facility) => facility.id);
  const [customers, leads, reservations, tenancies] = await Promise.all([
    db.customer.findMany({ where: { organisationId: scope.organisationId }, include: { leads: { orderBy: { updatedAt: "desc" }, take: 10 }, reservations: { include: { facility: true, unit: true }, orderBy: { updatedAt: "desc" }, take: 10 }, tenancies: { include: { facility: true, account: true, occupancies: { include: { unit: { include: { unitType: true } } }, orderBy: { startDate: "desc" } } }, orderBy: { updatedAt: "desc" } } }, orderBy: { updatedAt: "desc" } }),
    db.lead.findMany({ where: { facilityId: { in: facilityIds } }, include: { customer: true, desiredUnitType: true, facility: true }, orderBy: { updatedAt: "desc" } }),
    db.reservation.findMany({ where: { facilityId: { in: facilityIds } }, include: { customer: true, unit: true, facility: true }, orderBy: { updatedAt: "desc" } }),
    db.tenancy.findMany({ where: { facilityId: { in: facilityIds } }, include: { customer: true, account: true, facility: true, occupancies: { include: { unit: true }, orderBy: { startDate: "desc" } } }, orderBy: { updatedAt: "desc" } }),
  ]);
  return { facilities, customers, leads, reservations, tenancies };
}

export async function createFacility(scope: RequestScope, data: Omit<Prisma.FacilityUncheckedCreateInput, "organisationId">) {
  if (!scope.unrestrictedFacilities) throw new Error("FORBIDDEN");
  return db.$transaction(async (tx) => { const entity = await tx.facility.create({ data: { ...data, organisationId: scope.organisationId } }); await audit(tx, scope, "facility.created", "Facility", entity.id, entity.id, undefined, entity as unknown as Prisma.InputJsonValue); return entity; });
}

export async function createUnitType(scope: RequestScope, data: Prisma.UnitTypeUncheckedCreateInput) {
  await requireFacility(scope, data.facilityId); return db.$transaction(async (tx) => { const entity = await tx.unitType.create({ data }); await audit(tx, scope, "unit_type.created", "UnitType", entity.id, data.facilityId); return entity; });
}

export async function createUnit(scope: RequestScope, data: Prisma.UnitUncheckedCreateInput) {
  await requireFacility(scope, data.facilityId); const type = await db.unitType.findFirst({ where: { id: data.unitTypeId, facilityId: data.facilityId } }); if (!type) throw new Error("FACILITY_FORBIDDEN");
  return db.$transaction(async (tx) => { const entity = await tx.unit.create({ data }); await audit(tx, scope, "unit.created", "Unit", entity.id, data.facilityId); return entity; });
}

export async function createCustomer(scope: RequestScope, data: Omit<Prisma.CustomerUncheckedCreateInput, "organisationId">) {
  return db.$transaction(async (tx) => { const entity = await tx.customer.create({ data: { ...data, organisationId: scope.organisationId } }); await audit(tx, scope, "customer.created", "Customer", entity.id); return entity; });
}

export async function createLead(scope: RequestScope, data: Prisma.LeadUncheckedCreateInput) {
  await requireFacility(scope, data.facilityId); if (data.customerId && !(await db.customer.findFirst({ where: { id: data.customerId, organisationId: scope.organisationId } }))) throw new Error("FORBIDDEN");
  return db.$transaction(async (tx) => { const entity = await tx.lead.create({ data }); await audit(tx, scope, "lead.created", "Lead", entity.id, data.facilityId); return entity; });
}

export async function createReservation(scope: RequestScope, data: Prisma.ReservationUncheckedCreateInput) {
  await requireFacility(scope, data.facilityId);
  return db.$transaction(async (tx) => {
    const unit = await tx.unit.findFirst({ where: { id: data.unitId, facilityId: data.facilityId, status: "AVAILABLE" } });
    const customer = await tx.customer.findFirst({ where: { id: data.customerId, organisationId: scope.organisationId } });
    if (!unit || !customer) throw new Error("CONFLICT");
    const entity = await tx.reservation.create({ data }); await tx.unit.update({ where: { id: unit.id }, data: { status: "RESERVED" } });
    if (data.leadId) await tx.lead.update({ where: { id: data.leadId }, data: { stage: "RESERVED" } });
    await audit(tx, scope, "reservation.created", "Reservation", entity.id, data.facilityId); return entity;
  });
}

export async function cancelReservation(scope: RequestScope, reservationId: string) {
  const reservation = await db.reservation.findFirst({ where: { id: reservationId }, include: { unit: true } });
  if (!reservation) throw new Error("NOT_FOUND"); await requireFacility(scope, reservation.facilityId); if (reservation.status !== "ACTIVE") throw new Error("CONFLICT");
  return db.$transaction(async (tx) => {
    const entity = await tx.reservation.update({ where: { id: reservation.id }, data: { status: "CANCELLED" } });
    const otherActive = await tx.reservation.count({ where: { unitId: reservation.unitId, status: "ACTIVE", id: { not: reservation.id } } });
    const activeOccupancy = await tx.occupancy.count({ where: { unitId: reservation.unitId, status: "ACTIVE" } });
    if (!otherActive && !activeOccupancy && reservation.unit.status === "RESERVED") await tx.unit.update({ where: { id: reservation.unitId }, data: { status: "AVAILABLE" } });
    await audit(tx, scope, "reservation.cancelled", "Reservation", entity.id, reservation.facilityId); return entity;
  });
}

export async function moveIn(scope: RequestScope, input: { reservationId?: string; facilityId: string; customerId: string; unitId: string; startDate: Date; monthlyRate?: number; initialCharge: number; accessState: string; signerName: string; signerIp?: string | null; signerUserAgent?: string | null }) {
  await requireFacility(scope, input.facilityId);
  return db.$transaction(async (tx) => {
    const unit = await tx.unit.findFirst({ where: { id: input.unitId, facilityId: input.facilityId, status: { in: ["AVAILABLE", "RESERVED"] } }, include: { unitType: true } });
    const customer = await tx.customer.findFirst({ where: { id: input.customerId, organisationId: scope.organisationId } });
    const facility = await tx.facility.findFirst({ where: { id: input.facilityId } });
    if (!unit || !customer || !facility) throw new Error("CONFLICT");
    const account = await tx.account.create({ data: { customerId: customer.id, accountNumber: `ST24-${Date.now().toString(36).toUpperCase()}` } });
    const monthlyRate = input.monthlyRate ?? unit.monthlyRate;
    const tenancy = await tx.tenancy.create({ data: { facilityId: input.facilityId, customerId: customer.id, accountId: account.id, status: "ACTIVE", startDate: input.startDate, occupancies: { create: { unitId: unit.id, status: "ACTIVE", startDate: input.startDate, monthlyRate, accessState: input.accessState } } } });
    await tx.unit.update({ where: { id: unit.id }, data: { status: "OCCUPIED" } });
    const customerName = customer.companyName || [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer";
    const leaseContent = renderLeaseAgreement({ facilityName: facility.name, unitNumber: unit.number, unitTypeName: unit.unitType.name, customerName, monthlyRate: Number(monthlyRate), startDate: input.startDate });
    await tx.document.create({ data: { tenancyId: tenancy.id, type: "LEASE_AGREEMENT", storageKey: "inline", content: leaseContent, sha256: hashDocument(leaseContent), signerName: input.signerName, signerIp: input.signerIp ?? null, signerUserAgent: input.signerUserAgent ?? null, signedAt: new Date() } });
    if (input.initialCharge > 0) { await tx.ledgerEntry.create({ data: { accountId: account.id, type: "CHARGE", amount: input.initialCharge, description: "Move-in charge", effectiveAt: input.startDate, createdById: scope.userId } }); await tx.account.update({ where: { id: account.id }, data: { balance: { increment: input.initialCharge } } }); }
    if (input.reservationId) await tx.reservation.update({ where: { id: input.reservationId }, data: { status: "CONVERTED", convertedTenancyId: tenancy.id } });
    await audit(tx, scope, "tenancy.moved_in", "Tenancy", tenancy.id, input.facilityId); return tenancy;
  });
}

export async function transfer(scope: RequestScope, input: { tenancyId: string; toUnitId: string; effectiveAt: Date; monthlyRate?: number }) {
  return db.$transaction(async (tx) => {
    const tenancy = await tx.tenancy.findFirst({ where: { id: input.tenancyId, status: "ACTIVE", facility: facilityWhere(scope) }, include: { occupancies: { where: { status: "ACTIVE" } } } });
    if (!tenancy || tenancy.occupancies.length !== 1) throw new Error("CONFLICT");
    const next = await tx.unit.findFirst({ where: { id: input.toUnitId, facilityId: tenancy.facilityId, status: "AVAILABLE" } }); if (!next) throw new Error("CONFLICT");
    const current = tenancy.occupancies[0];
    await tx.tenancy.update({ where: { id: tenancy.id }, data: { status: "ACTIVE" } });
    await tx.occupancy.update({ where: { id: current.id }, data: { status: "MOVED_OUT", endDate: input.effectiveAt, accessState: "REVOKED" } });
    await tx.unit.update({ where: { id: current.unitId }, data: { status: "AVAILABLE" } });
    const occupancy = await tx.occupancy.create({ data: { tenancyId: tenancy.id, unitId: next.id, status: "ACTIVE", startDate: input.effectiveAt, monthlyRate: input.monthlyRate ?? next.monthlyRate, accessState: "PENDING" } });
    await tx.unit.update({ where: { id: next.id }, data: { status: "OCCUPIED" } }); await audit(tx, scope, "tenancy.transferred", "Tenancy", tenancy.id, tenancy.facilityId); return occupancy;
  });
}

export async function giveNotice(scope: RequestScope, input: { tenancyId: string; noticeDate: Date; plannedMoveOut: Date }) {
  const tenancy = await db.tenancy.findFirst({ where: { id: input.tenancyId, facility: facilityWhere(scope), status: "ACTIVE" } }); if (!tenancy) throw new Error("NOT_FOUND");
  return db.$transaction(async (tx) => { const entity = await tx.tenancy.update({ where: { id: tenancy.id }, data: { status: "NOTICE_GIVEN", noticeDate: input.noticeDate, endDate: input.plannedMoveOut, occupancies: { updateMany: { where: { status: "ACTIVE" }, data: { status: "NOTICE_GIVEN" } } } } }); await audit(tx, scope, "tenancy.notice_given", "Tenancy", entity.id, tenancy.facilityId); return entity; });
}

export async function moveOut(scope: RequestScope, input: { tenancyId: string; movedOutAt: Date; finalCharge: number; notes?: string }) {
  const entity = await db.$transaction(async (tx) => {
    const tenancy = await tx.tenancy.findFirst({ where: { id: input.tenancyId, facility: facilityWhere(scope), status: { in: ["ACTIVE", "NOTICE_GIVEN"] } }, include: { occupancies: { where: { status: { in: ["ACTIVE", "NOTICE_GIVEN"] } } } } }); if (!tenancy) throw new Error("NOT_FOUND");
    await tx.occupancy.updateMany({ where: { tenancyId: tenancy.id, status: { in: ["ACTIVE", "NOTICE_GIVEN"] } }, data: { status: "MOVED_OUT", endDate: input.movedOutAt, accessState: "REVOKED" } });
    await tx.unit.updateMany({ where: { id: { in: tenancy.occupancies.map((o) => o.unitId) } }, data: { status: "AVAILABLE" } });
    const entity = await tx.tenancy.update({ where: { id: tenancy.id }, data: { status: "CLOSED", endDate: input.movedOutAt } });
    if (input.finalCharge > 0) { await tx.ledgerEntry.create({ data: { accountId: tenancy.accountId, type: "CHARGE", amount: input.finalCharge, description: input.notes || "Final move-out charge", effectiveAt: input.movedOutAt, createdById: scope.userId } }); await tx.account.update({ where: { id: tenancy.accountId }, data: { balance: { increment: input.finalCharge } } }); }
    await audit(tx, scope, "tenancy.moved_out", "Tenancy", entity.id, tenancy.facilityId); return entity;
  });
  const activeBiometrics = await db.biometricEnrollment.findMany({ where: { occupancy: { tenancyId: entity.id }, status: "ACTIVE" }, select: { id: true } });
  for (const enrollment of activeBiometrics) await revokeBiometricAccess(scope, enrollment.id);
  return entity;
}
