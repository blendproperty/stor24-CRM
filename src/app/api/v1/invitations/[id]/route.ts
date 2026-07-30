import { db } from "@/lib/db";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function DELETE(request: Request, context: RouteContext<"/api/v1/invitations/[id]">) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: { code: "ORIGIN_REJECTED", message: "The request origin is not allowed." } }, { status: 403 });
  }
  const { id } = await context.params;
  const invitation = await db.userInvitation.findUnique({ where: { id } });
  if (!invitation || invitation.status !== "PENDING") {
    return Response.json({ error: { code: "NOT_PENDING", message: "Only pending invitations can be revoked." } }, { status: 409 });
  }
  await db.$transaction([
    db.userInvitation.update({ where: { id }, data: { status: "REVOKED", revokedAt: new Date() } }),
    db.auditEvent.create({
      data: {
        organisationId: invitation.organisationId,
        action: "user.invitation.revoked",
        entityType: "UserInvitation",
        entityId: id,
      },
    }),
  ]);
  return Response.json({ data: { id, status: "REVOKED" } });
}

