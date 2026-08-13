import { z } from "zod";
import { apiError, jsonBody } from "@/lib/api";
import { requirePermission } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/request-security";
import { requireFacility, requireScope } from "@/lib/scope";

const duplicateSchema = z.object({
  facilityId: z.string().min(1),
  sourceName: z.string().trim().min(1).max(80),
  targetName: z.string().trim().min(1).max(80),
  excludeRoof: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) {
      return Response.json({ error: { message: "Request rejected." } }, { status: 403 });
    }
    const scope = await requireScope();
    const parsed = duplicateSchema.safeParse(await jsonBody(request));
    if (!parsed.success) {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", fields: parsed.error.flatten().fieldErrors } },
        { status: 422 },
      );
    }
    const input = parsed.data;
    if (input.sourceName.toLowerCase() === input.targetName.toLowerCase()) {
      return Response.json(
        { error: { code: "SAME_FLOOR", message: "Choose a different destination floor." } },
        { status: 409 },
      );
    }
    await requirePermission("inventory.manage", input.facilityId);
    await requireFacility(scope, input.facilityId);

    const result = await db.$transaction(async (tx) => {
      const source = await tx.facilityMap.findUnique({
        where: { facilityId_name: { facilityId: input.facilityId, name: input.sourceName } },
        include: {
          elements: {
            include: { unit: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      });
      if (!source) throw new Error("NOT_FOUND");

      const target = await tx.facilityMap.findUnique({
        where: { facilityId_name: { facilityId: input.facilityId, name: input.targetName } },
        include: { _count: { select: { elements: true } } },
      });
      if (target && target._count.elements > 0) throw new Error("TARGET_NOT_EMPTY");

      const targetMap = target
        ? await tx.facilityMap.update({
            where: { id: target.id },
            data: { width: source.width, height: source.height, backgroundUrl: null },
          })
        : await tx.facilityMap.create({
            data: {
              facilityId: input.facilityId,
              name: input.targetName,
              width: source.width,
              height: source.height,
            },
          });

      const existingUnits = await tx.unit.findMany({
        where: { facilityId: input.facilityId },
        select: { number: true },
      });
      let nextNumber = Math.max(
        0,
        ...existingUnits.map((unit) => Number(unit.number)).filter(Number.isFinite),
      ) + 1;

      const sourceElements = source.elements.filter(
        (element) => !(input.excludeRoof && element.type === "ROOF"),
      );
      const newUnits = sourceElements
        .filter((element) => element.type === "UNIT")
        .map((element) => {
          if (!element.unit) throw new Error("SOURCE_UNIT_MISSING");
          return {
            sourceElementId: element.id,
            number: String(nextNumber++),
            source: element.unit,
          };
        });

      const createdUnits = await tx.unit.createManyAndReturn({
        data: newUnits.map(({ number, source: unit }) => ({
          facilityId: input.facilityId,
          unitTypeId: unit.unitTypeId,
          number,
          floor: input.targetName,
          zone: unit.zone,
          status: "AVAILABLE",
          monthlyRate: unit.monthlyRate,
          taxRate: unit.taxRate,
        })),
        select: { id: true, number: true },
      });
      const unitIdByNumber = new Map(createdUnits.map((unit) => [unit.number, unit.id]));
      const numberByElementId = new Map(
        newUnits.map((unit) => [unit.sourceElementId, unit.number]),
      );

      if (sourceElements.length) {
        await tx.mapElement.createMany({
          data: sourceElements.map((element, sortOrder) => {
            const number = numberByElementId.get(element.id);
            return {
              mapId: targetMap.id,
              unitId: number ? unitIdByNumber.get(number) : undefined,
              type: element.type,
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              rotation: element.rotation,
              label: number ?? element.label,
              config: element.config ?? undefined,
              sortOrder,
            };
          }),
        });
      }

      await tx.auditEvent.create({
        data: {
          organisationId: scope.organisationId,
          facilityId: input.facilityId,
          actorId: scope.userId,
          action: "facility_map.duplicated",
          entityType: "FacilityMap",
          entityId: targetMap.id,
          after: {
            sourceName: input.sourceName,
            targetName: input.targetName,
            elementCount: sourceElements.length,
            unitCount: createdUnits.length,
            excludedRoof: input.excludeRoof,
          },
        },
      });

      return {
        mapId: targetMap.id,
        elementCount: sourceElements.length,
        unitCount: createdUnits.length,
        firstUnitNumber: createdUnits[0]?.number ?? null,
        lastUnitNumber: createdUnits.at(-1)?.number ?? null,
      };
    }, { timeout: 30_000 });

    return Response.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "TARGET_NOT_EMPTY") {
      return Response.json(
        { error: { code: error.message, message: "The destination floor is not empty. Nothing was changed." } },
        { status: 409 },
      );
    }
    return apiError(error);
  }
}
