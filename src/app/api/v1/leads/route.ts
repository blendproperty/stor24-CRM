import { leads } from "@/lib/demo-data";
import { createLeadSchema } from "@/lib/validators";
import { requirePermission } from "@/lib/auth-guards";
import { sameOrigin } from "@/lib/request-security";

export async function GET() {
  await requirePermission("leads.view");
  return Response.json({ data: leads, meta: { count: leads.length } });
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

  return Response.json(
    {
      data: {
        id: crypto.randomUUID(),
        ...parsed.data,
        stage: "NEW",
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}
