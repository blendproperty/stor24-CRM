import { apiError, jsonBody } from "@/lib/api";
import { giveNotice, moveIn, moveOut, transfer } from "@/lib/leasing-service";
import { requireScope } from "@/lib/scope";
import { moveInSchema, moveOutSchema, noticeSchema, transferSchema } from "@/lib/validators";

const commands = { "move-in": [moveInSchema, moveIn], transfer: [transferSchema, transfer], notice: [noticeSchema, giveNotice], "move-out": [moveOutSchema, moveOut] } as const;

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await context.params; const command = commands[action as keyof typeof commands]; if (!command) throw new Error("NOT_FOUND");
    const parsed = command[0].safeParse(await jsonBody(request)); if (!parsed.success) return Response.json({ error: { code: "VALIDATION_ERROR", fields: parsed.error.flatten().fieldErrors } }, { status: 422 });
    const scope = await requireScope(); const data = await (command[1] as (s: typeof scope, i: never) => Promise<unknown>)(scope, parsed.data as never); return Response.json({ data });
  } catch (error) { return apiError(error); }
}
