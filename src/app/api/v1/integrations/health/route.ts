import { requirePermission } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

const connections = [
  { category: "Payments", provider: "Not selected", status: "CONFIG_REQUIRED", lastCheckedAt: null, backlog: 0, message: "Choose and credential an approved payment provider." },
  { category: "Access control", provider: "Not selected", status: "CONFIG_REQUIRED", lastCheckedAt: null, backlog: 0, message: "Map a supported access-control provider and facility." },
  { category: "Email", provider: "Not selected", status: "CONFIG_REQUIRED", lastCheckedAt: null, backlog: 0, message: "Sender domain and provider credentials are required." },
  { category: "SMS", provider: "Not selected", status: "CONFIG_REQUIRED", lastCheckedAt: null, backlog: 0, message: "Sender identity and provider credentials are required." },
  { category: "Accounting", provider: "File export", status: "DEGRADED", lastCheckedAt: null, backlog: 2, message: "Mapping approval is outstanding; no vendor transmission occurs." },
  { category: "Website leads", provider: "Webhook inbox", status: "CONFIG_REQUIRED", lastCheckedAt: null, backlog: 0, message: "Register a source and signing secret before accepting events." },
];

export async function GET() {
  const session = await requirePermission("integrations.view");
  return Response.json({ data: connections, meta: { role: session.role, liveChecksPerformed: false } });
}
