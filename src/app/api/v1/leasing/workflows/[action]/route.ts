import { apiError, jsonBody } from "@/lib/api";
import { giveNotice, moveIn, moveOut, transfer } from "@/lib/leasing-service";
import { sendLeaseSigningLink } from "@/lib/notifications";
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
    const data = await (command[1] as (s: typeof scope, i: never) => Promise<unknown>)(scope, parsed.data as never);
    // Move-in no longer signs the lease inline — it sends a signing link
    // (DocuSign-style) to the customer. See moveIn()/completeLeaseSigning()
    // in leasing-service.ts and the public /sign/[token] page.
    if (action === "move-in") {
      const result = data as Awaited<ReturnType<typeof moveIn>>;
      const signingUrl = `${process.env.APP_URL ?? ""}/sign/${result.document.signingToken}`;
      await sendLeaseSigningLink({
        organisationId: scope.organisationId,
        facilityId: result.tenancy.facilityId,
        customerId: result.customer.id,
        documentId: result.document.id,
        to: { email: result.customer.email },
        variables: {
          customerName: result.customer.companyName || [result.customer.firstName, result.customer.lastName].filter(Boolean).join(" ") || "there",
          facilityName: result.facility.name,
          unitNumber: result.unit.number,
          signingUrl,
          expiresAt: result.document.expiresAt ? result.document.expiresAt.toLocaleDateString("en-ZA") : "",
        },
      });
    }
    return Response.json({ data });
  } catch (error) { return apiError(error); }
}
