import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/session";
import { loginSchema } from "@/lib/validators";

const failures = new Map<string, { count: number; resetAt: number }>();

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin, process.env.APP_URL].filter(Boolean));
  return !origin || allowed.has(origin);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Request rejected." }, { status: 403 });
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = failures.get(key);
  if (limit && limit.count >= 5 && limit.resetAt > Date.now()) {
    return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  const user = await db.user.findFirst({
    where: { email: parsed.data.email, active: true },
    include: { roleAssignments: { include: { role: true } } },
  });
  const valid = Boolean(user?.passwordHash && (await compare(parsed.data.password, user.passwordHash)));
  if (!user || !valid) {
    failures.set(key, { count: (limit?.count ?? 0) + 1, resetAt: Date.now() + 15 * 60 * 1000 });
    return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  failures.delete(key);
  await setSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.roleAssignments[0]?.role.name ?? "Unassigned",
  });
  return Response.json({ data: { name: user.name } });
}
