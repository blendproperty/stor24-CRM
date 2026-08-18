import { apiError, jsonBody } from "@/lib/api";
import { giveNotice, moveIn, moveOut, transfer } from "@/lib/leasing-service";
import { requireScope } from "@/lib/scope";
import { requirePermission } from "@/lib/auth-guards";
import { moveInSchema, moveOutSchema, noticeSchema, transferSchema } from "@/lib/validators";

const commands = { "move-in": [moveInSchema, moveIn], transfer: [transferSchema, transfer], notice: [noticeSchema, giveNotice], "move-out": [moveOutSchema, moveOut] } as const;
const permissions = { "move-in": "move_in.create", transfer: "operations.manage", notice: "collections.manage", "move-out": "operations.manage" } as const;

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params; const command = commands[action as keyof typeof commands]; if (!command) throw new Error("NOT_FOUND");
    const parsed = command[0].safeParse(await jsonBody(request)); if (!parsed.success) return Response.json({ error: { code: "VALIDATION_ERROR", message: "Check the submitted account details.", fields: parsed.error.flatten().fieldErrors } }, { status: 422 });
    await requirePermission(permissions[action as keyof typeof permissions]);
    const scope = await requireScope();
    // Move-in captures a lease e-signature audit trail; the signer IP/user-agent are taken
    // from the request itself (not client-supplied body fields) so they can't be spoofed.
    const input = action === "move-in"
      ? { ...(parsed.data as object), signerIp: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null, signerUserAgent: request.headers.get("user-agent") || null }
      : parsed.data;
    const data = await (command[1] as (s: typeof scope, i: never) => Promise<unknown>)(scope, input as never);
    return Response.json({ data });
  } catch (error) { return apiError(error); }
}
