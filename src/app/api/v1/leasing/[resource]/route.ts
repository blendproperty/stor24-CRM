import { apiError, jsonBody } from "@/lib/api";
import { db } from "@/lib/db";
import { createCustomer, createFacility, createLead, createReservation, createUnit, createUnitType, listLeasing } from "@/lib/leasing-service";
import { facilityWhere, requireFacility, requireScope } from "@/lib/scope";
import { customerSchema, facilitySchema, leadSchema, reservationSchema, unitSchema, unitTypeSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/auth-guards";
import { sameOrigin } from "@/lib/request-security";

const schemas = { facilities: facilitySchema, "unit-types": unitTypeSchema, units: unitSchema, customers: customerSchema, leads: leadSchema, reservations: reservationSchema } as const;
type Resource = keyof typeof schemas;
const isResource = (value: string): value is Resource => value in schemas;

export async function GET(_: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await context.params; if (!isResource(resource)) throw new Error("NOT_FOUND");
    if (resource === "customers") await requirePermission("operations.view");
    const data = await listLeasing(await requireScope());
    const values = resource === "unit-types" ? data.facilities.flatMap((f) => f.unitTypes) : resource === "units" ? data.facilities.flatMap((f) => f.units) : data[resource];
    return Response.json({ data: values, meta: { count: values.length } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    if (!sameOrigin(request)) return Response.json({ error: { message: "Request rejected." } }, { status: 403 });
    const { resource } = await context.params; if (!isResource(resource)) throw new Error("NOT_FOUND");
    if (resource === "customers") await requirePermission("operations.manage");
    const parsed = schemas[resource].safeParse(await jsonBody(request)); if (!parsed.success) return Response.json({ error: { code: "VALIDATION_ERROR", fields: parsed.error.flatten().fieldErrors } }, { status: 422 });
    const scope = await requireScope();
    const creators = { facilities: createFacility, "unit-types": createUnitType, units: createUnit, customers: createCustomer, leads: createLead, reservations: createReservation } as const;
    const data = await (creators[resource] as (s: typeof scope, d: never) => Promise<unknown>)(scope, parsed.data as never);
    return Response.json({ data }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    if (!sameOrigin(request)) return Response.json({ error: { message: "Request rejected." } }, { status: 403 });
    const { resource } = await context.params; if (!isResource(resource)) throw new Error("NOT_FOUND");
    if (resource === "customers") await requirePermission("operations.manage");
    const body = await jsonBody(request) as { id?: string; data?: unknown }; if (!body.id) throw new Error("NOT_FOUND");
    const parsed = schemas[resource].partial().safeParse(body.data); if (!parsed.success) return Response.json({ error: { code: "VALIDATION_ERROR", fields: parsed.error.flatten().fieldErrors } }, { status: 422 });
    const scope = await requireScope(); const data = parsed.data as never;
    let entity: unknown;
    if (resource === "facilities") { if (!scope.unrestrictedFacilities) throw new Error("FORBIDDEN"); const current = await db.facility.findFirst({ where: { id: body.id, ...facilityWhere(scope) } }); if (!current) throw new Error("NOT_FOUND"); entity = await db.facility.update({ where: { id: current.id }, data }); }
    else if (resource === "customers") { const current = await db.customer.findFirst({ where: { id: body.id, organisationId: scope.organisationId } }); if (!current) throw new Error("NOT_FOUND"); entity = await db.customer.update({ where: { id: current.id }, data }); }
    else { const model = resource === "unit-types" ? db.unitType : resource === "units" ? db.unit : resource === "leads" ? db.lead : db.reservation; const current = await (model as typeof db.unit).findFirst({ where: { id: body.id }, include: { facility: true } } as never) as { id: string; facilityId: string } | null; if (!current) throw new Error("NOT_FOUND"); await requireFacility(scope, current.facilityId); entity = await (model as typeof db.unit).update({ where: { id: current.id }, data }); }
    await db.auditEvent.create({ data: { organisationId: scope.organisationId, actorId: scope.userId, action: `${resource}.updated`, entityType: resource, entityId: body.id } });
    return Response.json({ data: entity });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    if (!sameOrigin(request)) return Response.json({ error: { message: "Request rejected." } }, { status: 403 });
    const { resource } = await context.params; if (!isResource(resource)) throw new Error("NOT_FOUND");
    if (resource === "customers") await requirePermission("operations.manage");
    const id = new URL(request.url).searchParams.get("id"); if (!id) throw new Error("NOT_FOUND"); const scope = await requireScope();
    if (resource === "customers") { const entity = await db.customer.findFirst({ where: { id, organisationId: scope.organisationId }, include: { tenancies: true, reservations: true } }); if (!entity) throw new Error("NOT_FOUND"); if (entity.tenancies.length || entity.reservations.length) throw new Error("CONFLICT"); await db.customer.delete({ where: { id } }); }
    else if (resource === "facilities") { if (!scope.unrestrictedFacilities) throw new Error("FORBIDDEN"); const entity = await db.facility.findFirst({ where: { id, ...facilityWhere(scope) } }); if (!entity) throw new Error("NOT_FOUND"); await db.facility.update({ where: { id }, data: { active: false } }); }
    else { const model = resource === "unit-types" ? db.unitType : resource === "units" ? db.unit : resource === "leads" ? db.lead : db.reservation; const entity = await (model as typeof db.unit).findFirst({ where: { id } }) as { facilityId: string } | null; if (!entity) throw new Error("NOT_FOUND"); await requireFacility(scope, entity.facilityId); if (resource === "units") await db.unit.update({ where: { id }, data: { status: "UNAVAILABLE" } }); else if (resource === "reservations") { await db.reservation.update({ where: { id }, data: { status: "CANCELLED" } }); } else await (model as typeof db.unit).delete({ where: { id } }); }
    await db.auditEvent.create({ data: { organisationId: scope.organisationId, actorId: scope.userId, action: `${resource}.deleted`, entityType: resource, entityId: id } }); return new Response(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
