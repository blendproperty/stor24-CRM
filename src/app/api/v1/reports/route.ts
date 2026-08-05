import { requireSession } from "@/lib/auth-guards";
import { availableReports } from "@/lib/reporting";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireSession();
  return Response.json({ data: availableReports(session.permissions), meta: { role: session.role } });
}
