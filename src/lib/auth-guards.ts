import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { permissionGranted } from "@/lib/permissions";

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

export async function requirePermission(permission: string) {
  const auth = await requireSession();
  const allowed = permissionGranted(auth.permissions, permission);
  if (!allowed) throw new Error("FORBIDDEN");
  return auth;
}
