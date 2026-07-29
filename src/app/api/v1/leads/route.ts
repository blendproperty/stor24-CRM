import { leads } from "@/lib/demo-data";
import { createLeadSchema } from "@/lib/validators";

export function GET() {
  return Response.json({ data: leads, meta: { count: leads.length } });
}

export async function POST(request: Request) {
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
