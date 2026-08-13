import { z } from "zod";
import { apiError, jsonBody } from "@/lib/api";
import { requirePermission } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { sameOrigin } from "@/lib/request-security";
import { requireFacility, requireScope } from "@/lib/scope";
import {
  prepareUnitRenumberPlan,
  reverseUnitRenumberPlan,
  UnitRenumberingError,
} from "@/lib/unit-renumbering";

const requestSchema = z.object({
  facilityId: z.string().trim().min(1).max(64),
  action: z.enum(["preview", "apply"]).default("preview"),
  changes: z
    .array(
      z.object({
        unitId: z.string().trim().min(1).max(64),
        newNumber: z.string().trim().min(1).max(40),
      }),
    )
    .min(1)
    .max(1000),
});

function conflict(error: UnitRenumberingError) {
  return Response.json(
    { error: { code: error.code, message: error.message } },
    { status: 409 },
  );
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) {
      return Response.json(
        { error: { message: "Request rejected." } },
        { status: 403 },
      );
    }
    const parsed = requestSchema.safeParse(await jsonBody(request));
    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the proposed unit numbers and try again.",
            fields: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 422 },
      );
    }
    const input = parsed.data;
    const scope = await requireScope();
    await requirePermission("inventory.manage", input.facilityId);
    await requireFacility(scope, input.facilityId);
    const units = await db.unit.findMany({
      where: { facilityId: input.facilityId },
      select: { id: true, number: true },
    });

    let plan;
    try {
      plan = prepareUnitRenumberPlan(units, input.changes);
    } catch (error) {
      if (error instanceof UnitRenumberingError) return conflict(error);
      throw error;
    }
    if (!plan.length) {
      return Response.json(
        {
          error: {
            code: "NO_CHANGES",
            message: "Enter at least one different unit number.",
          },
        },
        { status: 422 },
      );
    }
    const mappedCount = await db.mapElement.count({
      where: { unitId: { in: plan.map((change) => change.unitId) } },
    });
    if (input.action === "preview") {
      return Response.json({
        data: { changes: plan, mappedCount, unitCount: plan.length },
      });
    }

    const applied = await db.$transaction(async (tx) => {
      const currentUnits = await tx.unit.findMany({
        where: { facilityId: input.facilityId },
        select: { id: true, number: true },
      });
      const currentPlan = prepareUnitRenumberPlan(currentUnits, input.changes);
      const nonce = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      for (const [index, change] of currentPlan.entries()) {
        await tx.unit.update({
          where: { id: change.unitId },
          data: { number: `__tmp_${nonce}_${index}`.slice(0, 40) },
        });
      }
      let syncedMapLabels = 0;
      for (const change of currentPlan) {
        await tx.unit.update({
          where: { id: change.unitId },
          data: { number: change.newNumber },
        });
        const synced = await tx.mapElement.updateMany({
          where: { unitId: change.unitId },
          data: { label: change.newNumber },
        });
        syncedMapLabels += synced.count;
      }
      const event = await tx.auditEvent.create({
        data: {
          organisationId: scope.organisationId,
          facilityId: input.facilityId,
          actorId: scope.userId,
          action: "units.renumbered",
          entityType: "Facility",
          entityId: input.facilityId,
          before: { changes: currentPlan },
          after: {
            changes: currentPlan.map(({ unitId, oldNumber, newNumber }) => ({
              unitId,
              oldNumber,
              newNumber,
            })),
            syncedMapLabels,
          },
        },
      });
      return {
        changes: currentPlan,
        syncedMapLabels,
        auditEventId: event.id,
      };
    });

    return Response.json({
      data: { ...applied, undoChanges: reverseUnitRenumberPlan(applied.changes) },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return Response.json(
        {
          error: {
            code: "UNIT_NUMBER_EXISTS",
            message:
              "Another unit now uses one of these numbers. Refresh the preview and try again.",
          },
        },
        { status: 409 },
      );
    }
    return apiError(error);
  }
}
