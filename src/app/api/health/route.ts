export const dynamic = "force-static";

export function GET() {
  return Response.json({
    service: "stor24-crm",
    status: "ok",
    version: "0.1.0",
  });
}
