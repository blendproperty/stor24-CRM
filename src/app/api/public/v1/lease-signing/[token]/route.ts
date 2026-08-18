import { completeLeaseSigning, getLeaseForSigning } from "@/lib/leasing-service";
import { leaseSignatureSchema } from "@/lib/validators";
import { privacyHash, rateLimit, requestIp } from "@/lib/request-security";

/**
 * Public, unauthenticated by design — the signingToken in the URL is the
 * credential (32 random bytes, single-use per Document, 7-day expiry).
 * Exposed under /api/public/v1/, already exempted from session auth in
 * src/proxy.ts. Returns only signer-safe fields (see getLeaseForSigning in
 * leasing-service.ts) — no internal IDs, no other tenants' data.
 */
export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const lease = await getLeaseForSigning(token);
  if (!lease) return Response.json({ error: { code: "NOT_FOUND", message: "This signing link is invalid or has expired." } }, { status: 404 });
  return Response.json({ data: lease }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: { code: "INVALID_JSON", message: "The signature details are invalid." } }, { status: 400 }); }

  const parsed = leaseSignatureSchema.safeParse(body);
  if (!parsed.success)
    return Response.json({ error: { code: "VALIDATION_ERROR", message: "Please initial every clause and type your full name.", fields: parsed.error.flatten().fieldErrors } }, { status: 422 });

  const clientIp = requestIp(request);
  const limited = await rateLimit(`lease-sign:${privacyHash(token)}`, 10, 60 * 60 * 1000);
  if (limited) return Response.json({ error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later or contact Stor24." } }, { status: 429 });

  try {
    await completeLeaseSigning(token, { signerName: parsed.data.signerName, initials: parsed.data.initials, signerIp: clientIp, signerUserAgent: request.headers.get("user-agent") || null });
    return Response.json({ data: { status: "SIGNED" } }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
    if (code === "NOT_FOUND") return Response.json({ error: { code: "NOT_FOUND", message: "This signing link is invalid." } }, { status: 404 });
    if (code === "EXPIRED") return Response.json({ error: { code: "EXPIRED", message: "This signing link has expired. Please contact Stor24 for a new one." } }, { status: 410 });
    if (code === "ALREADY_SIGNED") return Response.json({ error: { code: "ALREADY_SIGNED", message: "This lease has already been signed." } }, { status: 409 });
    if (code === "VALIDATION_ERROR") return Response.json({ error: { code: "VALIDATION_ERROR", message: "Please initial every clause before signing." } }, { status: 422 });
    return Response.json({ error: { code: "INTERNAL_ERROR", message: "The signature could not be completed." } }, { status: 500 });
  }
}
