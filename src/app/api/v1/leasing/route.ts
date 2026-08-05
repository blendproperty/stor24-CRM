import { apiError } from "@/lib/api";
import { listLeasing } from "@/lib/leasing-service";
import { requireScope } from "@/lib/scope";

export async function GET() {
  try { return Response.json({ data: await listLeasing(await requireScope()) }); }
  catch (error) { return apiError(error); }
}
