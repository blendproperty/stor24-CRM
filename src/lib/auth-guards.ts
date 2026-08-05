import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { ZodError } from "zod";

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  const user = await db.user.findUnique({ where: { id: session.userId }, include: { roleAssignments: { include: { role: true, facility: true } } } });
  if (!user?.active || user.sessionVersion !== session.sessionVersion) throw new Error("UNAUTHENTICATED");
  return { ...session, user, permissions: user.roleAssignments.flatMap((assignment) => assignment.role.permissions) };
}

export async function requireOwner() {
  const session = await requireSession();
  if (session.role !== "Organisation owner") throw new Error("FORBIDDEN");
  return session;
}

export async function requirePermission(permission: string, facilityId?: string) {
  const auth = await requireSession();
  const user = auth.user;

  const matchingAssignments = user.roleAssignments.filter((assignment) => {
    if (facilityId && assignment.facilityId && assignment.facilityId !== facilityId) return false;
    return hasPermission(assignment.role.permissions, permission);
  });
  const allowed = auth.role === "Organisation owner" || matchingAssignments.length > 0;
  if (!allowed) throw new Error("FORBIDDEN");
  const organisationWide = auth.role === "Organisation owner" || matchingAssignments.some((assignment) => assignment.facilityId === null);
  return { ...auth, organisationId: user.organisationId, allowedFacilityIds: organisationWide ? null : matchingAssignments.map((assignment) => assignment.facilityId!).filter(Boolean) };
}

export function authErrorResponse(error: unknown) {
  if (error instanceof ZodError) return Response.json({ error: { code: "VALIDATION_ERROR", message: "The submitted data is invalid.", fields: error.flatten().fieldErrors } }, { status: 422 });
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHENTICATED") return Response.json({ error: { code: message, message: "Sign in is required." } }, { status: 401 });
  if (message === "FORBIDDEN") return Response.json({ error: { code: message, message: "You do not have permission for this action." } }, { status: 403 });
  return Response.json({ error: { code: "INTERNAL_ERROR", message: "The request could not be completed." } }, { status: 500 });
}
