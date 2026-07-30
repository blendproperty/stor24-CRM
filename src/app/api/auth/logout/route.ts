import { clearSession } from "@/lib/session";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin, process.env.APP_URL].filter(Boolean));
  if (origin && !allowed.has(origin)) return Response.json({ error: "Request rejected." }, { status: 403 });
  await clearSession();
  return Response.json({ data: { signedOut: true } });
}
