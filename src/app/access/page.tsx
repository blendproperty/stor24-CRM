import { BiometricAccessWorkspace } from "@/components/biometric-access-workspace";
import { PageHeader } from "@/components/page-header";
import { listBiometricAccess } from "@/lib/biometric-access-service";
import { db } from "@/lib/db";
import { requirePermissionScope } from "@/lib/scope";

export const metadata = { title: "Biometric access" };
export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const scope = await requirePermissionScope("access.view");
  const [occupancies, enrollments] = await Promise.all([
    db.occupancy.findMany({ where: { status: { in: ["ACTIVE", "NOTICE_GIVEN"] }, tenancy: { facility: { organisationId: scope.organisationId, ...(scope.unrestrictedFacilities ? {} : { id: { in: scope.facilityIds } }) } } }, include: { unit: true, tenancy: { include: { facility: true, customer: true } } }, orderBy: { updatedAt: "desc" } }),
    listBiometricAccess(scope),
  ]);
  return <div className="page-stack">
    <PageHeader eyebrow="Physical security" title="Facial access" description="Consent-led HikCentral enrolment for active Stor24 tenants, with immediate revocation and a complete audit trail." />
    <BiometricAccessWorkspace
      candidates={occupancies.map((occupancy) => ({ occupancyId: occupancy.id, facilityId: occupancy.tenancy.facilityId, customerId: occupancy.tenancy.customerId, label: `${occupancy.tenancy.customer.firstName ?? occupancy.tenancy.customer.companyName ?? "Customer"} ${occupancy.tenancy.customer.lastName ?? ""} · ${occupancy.tenancy.facility.name} · Unit ${occupancy.unit.number}`.trim() }))}
      enrollments={enrollments.map((item) => ({ id: item.id, customerName: `${item.customer.firstName ?? item.customer.companyName ?? "Customer"} ${item.customer.lastName ?? ""}`.trim(), facilityName: item.facility.name, unitNumber: item.occupancy.unit.number, status: item.status, consentAt: item.consentAt.toISOString(), provisionedAt: item.provisionedAt?.toISOString() ?? null }))}
    />
  </div>;
}
