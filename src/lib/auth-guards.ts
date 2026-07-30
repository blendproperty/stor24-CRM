import { getSession } from "@/lib/session";

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export async function requireOwner() {
  const session = await requireSession();
  if (session.role !== "Organisation owner") throw new Error("FORBIDDEN");
  return session;
}
