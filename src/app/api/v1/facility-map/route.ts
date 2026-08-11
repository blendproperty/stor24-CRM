import { z } from "zod";
import { apiError, jsonBody } from "@/lib/api";
import { requirePermission } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/request-security";
import { requireFacility, requireScope } from "@/lib/scope";

const elementSchema = z.object({
  id: z.string().min(1).max(100), type: z.enum(["UNIT", "ZONE", "WALL", "DOOR", "LABEL"]),
  x: z.number().int().min(0).max(5000), y: z.number().int().min(0).max(5000), width: z.number().int().min(10).max(3000), height: z.number().int().min(10).max(3000),
  rotation: z.number().int().min(0).max(359).default(0), label: z.string().trim().max(120).optional(), unitId: z.string().optional(),
  unit: z.object({ unitTypeId: z.string().min(1), number: z.string().trim().min(1).max(40), floor: z.string().trim().max(40).optional(), zone: z.string().trim().max(40).optional(), monthlyRate: z.coerce.number().min(0), taxRate: z.coerce.number().min(0).max(1).default(.15) }).optional(),
});
const mapSchema = z.object({ facilityId: z.string().min(1), name: z.string().trim().min(1).max(80), width: z.number().int().min(400).max(5000), height: z.number().int().min(300).max(5000), elements: z.array(elementSchema).max(1500) });

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("facility_map.view"); const scope = await requireScope();
    const facilityId = new URL(request.url).searchParams.get("facilityId");
    if (facilityId) await requireFacility(scope, facilityId);
    const facilities = await db.facility.findMany({ where: { organisationId: auth.organisationId, active: true, ...(auth.allowedFacilityIds ? { id: { in: auth.allowedFacilityIds } } : {}), ...(facilityId ? { id: facilityId } : {}) }, include: { unitTypes: { orderBy: { name: "asc" } }, units: { include: { unitType: true }, orderBy: { number: "asc" } }, maps: { include: { elements: { include: { unit: { include: { unitType: true } } }, orderBy: { sortOrder: "asc" } } }, orderBy: { name: "asc" } } }, orderBy: { name: "asc" } });
    return Response.json({ data: facilities });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return Response.json({ error: { message: "Request rejected." } }, { status: 403 });
    const scope = await requireScope(); const parsed = mapSchema.safeParse(await jsonBody(request));
    if (!parsed.success) return Response.json({ error: { code: "VALIDATION_ERROR", fields: parsed.error.flatten().fieldErrors } }, { status: 422 });
    const input = parsed.data; await requirePermission("inventory.manage", input.facilityId); await requireFacility(scope, input.facilityId);
    const result = await db.$transaction(async (tx) => {
      const map = await tx.facilityMap.upsert({ where: { facilityId_name: { facilityId: input.facilityId, name: input.name } }, update: { width: input.width, height: input.height }, create: { facilityId: input.facilityId, name: input.name, width: input.width, height: input.height } });
      await tx.mapElement.deleteMany({ where: { mapId: map.id } });
      for (const [sortOrder, element] of input.elements.entries()) {
        let unitId = element.unitId;
        if (element.type === "UNIT") {
          if (unitId) {
            const unit = await tx.unit.findFirst({ where: { id: unitId, facilityId: input.facilityId } }); if (!unit) throw new Error("CONFLICT");
          } else {
            if (!element.unit) throw new Error("CONFLICT");
            const type = await tx.unitType.findFirst({ where: { id: element.unit.unitTypeId, facilityId: input.facilityId } }); if (!type) throw new Error("CONFLICT");
            const unit = await tx.unit.create({ data: { facilityId: input.facilityId, ...element.unit, status: "AVAILABLE" } }); unitId = unit.id;
          }
        }
        await tx.mapElement.create({ data: { mapId: map.id, unitId, type: element.type, x: element.x, y: element.y, width: element.width, height: element.height, rotation: element.rotation, label: element.label, config: element.unit ? { draftUnit: element.unit } : undefined, sortOrder } });
      }
      await tx.auditEvent.create({ data: { organisationId: scope.organisationId, facilityId: input.facilityId, actorId: scope.userId, action: "facility_map.saved", entityType: "FacilityMap", entityId: map.id, after: { name: map.name, elementCount: input.elements.length } } });
      return map;
    });
    return Response.json({ data: result });
  } catch (error) { return apiError(error); }
}
