import { notFound } from "next/navigation";
import { AcceptInvitation } from "@/components/accept-invitation";
import { db } from "@/lib/db";
import { hashInvitationToken } from "@/lib/invitation-service";

export const metadata = { title: "Accept invitation" };
export const dynamic = "force-dynamic";

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await db.userInvitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
  });
  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) notFound();

  const facility = invitation.facilityCode
    ? await db.facility.findUnique({
        where: { organisationId_code: { organisationId: invitation.organisationId, code: invitation.facilityCode } },
      })
    : null;

  return (
    <div className="accept-page">
      <AcceptInvitation
        token={token}
        name={invitation.name}
        email={invitation.email}
        roleName={invitation.roleName}
        facilityName={facility?.name ?? "All facilities"}
      />
    </div>
  );
}
