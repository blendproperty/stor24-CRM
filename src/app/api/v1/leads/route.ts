import { apiError } from "@/lib/api";
import { createCustomer, createLead, listLeasing } from "@/lib/leasing-service";
import { requireScope } from "@/lib/scope";
import { createLeadSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/auth-guards";
import { sameOrigin } from "@/lib/request-security";

export async function GET() {
  await requirePermission("leads.view");
  try { const leads = (await listLeasing(await requireScope())).leads; return Response.json({ data: leads, meta: { count: leads.length } }); } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  await requirePermission("leads.create");
  if (!sameOrigin(request)) return Response.json({ error: { code: "ORIGIN_REJECTED", message: "The request origin is not allowed." } }, { status: 403 });
  const parsed = createLeadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "The lead payload is invalid.",
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  try {
    const scope = await requireScope();
    const customer = await createCustomer(scope, { firstName: parsed.data.firstName, lastName: parsed.data.lastName, email: parsed.data.email, phone: parsed.data.phone });
    const data = await createLead(scope, { facilityId: parsed.data.facilityId, customerId: customer.id, desiredUnitTypeId: parsed.data.desiredUnitTypeId, source: parsed.data.source, notes: parsed.data.notes });
    return Response.json({ data }, { status: 201 });
  } catch (error) { return apiError(error); }
}
