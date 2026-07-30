import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { ensureStor24Workspace } from "@/lib/invitation-service";
import { setSession } from "@/lib/session";
import { ownerSetupSchema } from "@/lib/validators";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const parsed = ownerSetupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Check all fields and use a strong 12-character password." }, { status: 422 });
  }
  if (!process.env.BOOTSTRAP_TOKEN_HASH || tokenHash(parsed.data.token) !== process.env.BOOTSTRAP_TOKEN_HASH) {
    return Response.json({ error: "This setup link is invalid." }, { status: 404 });
  }
  if (await db.user.count({ where: { passwordHash: { not: null } } })) {
    return Response.json({ error: "Owner setup has already been completed." }, { status: 409 });
  }

  const organisation = await ensureStor24Workspace();
  const role = await db.role.findUniqueOrThrow({
    where: { organisationId_name: { organisationId: organisation.id, name: "Organisation owner" } },
  });
  const passwordHash = await hash(parsed.data.password, 12);
  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        organisationId: organisation.id,
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        roleAssignments: { create: { roleId: role.id } },
      },
    });
    await tx.auditEvent.create({
      data: {
        organisationId: organisation.id,
        actorId: created.id,
        action: "user.owner.bootstrapped",
        entityType: "User",
        entityId: created.id,
      },
    });
    return created;
  });

  await setSession({ userId: user.id, name: user.name, email: user.email, role: role.name });
  return Response.json({ data: { ready: true } }, { status: 201 });
}
