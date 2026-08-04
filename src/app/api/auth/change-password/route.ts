import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";
import { clearSession } from "@/lib/session";
import { requireSession } from "@/lib/auth-guards";
import { changePasswordSchema } from "@/lib/validators";
import { sameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  const auth = await requireSession();
  if (!sameOrigin(request)) return Response.json({ error: "Request rejected." }, { status: 403 });
  const parsed = changePasswordSchema.safeParse(await request.json());
  if (!parsed.success || !auth.user.passwordHash || !(await compare(parsed.data.currentPassword, auth.user.passwordHash))) return Response.json({ error: "The current password is incorrect or the new password is not strong enough." }, { status: 422 });
  const passwordHash = await hash(parsed.data.password, 12);
  await db.$transaction([
    db.user.update({ where: { id: auth.user.id }, data: { passwordHash, passwordChangedAt: new Date(), sessionVersion: { increment: 1 } } }),
    db.passwordResetToken.updateMany({ where: { userId: auth.user.id, usedAt: null }, data: { usedAt: new Date() } }),
    db.auditEvent.create({ data: { organisationId: auth.user.organisationId, actorId: auth.user.id, action: "user.password.changed", entityType: "User", entityId: auth.user.id } }),
  ]);
  await clearSession();
  return Response.json({ data: { changed: true } });
}
