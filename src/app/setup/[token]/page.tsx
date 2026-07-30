import { createHash } from "node:crypto";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PortalAuthForm } from "@/components/portal-auth-form";
import { PortalAuthLayout } from "@/components/portal-auth-layout";

export const metadata = { title: "Secure owner setup" };
export const dynamic = "force-dynamic";

export default async function SetupPage({ params }: PageProps<"/setup/[token]">) {
  const { token } = await params;
  const hash = createHash("sha256").update(token).digest("hex");
  if (!process.env.BOOTSTRAP_TOKEN_HASH || hash !== process.env.BOOTSTRAP_TOKEN_HASH) notFound();
  if (await db.user.count({ where: { passwordHash: { not: null } } })) notFound();

  return (
    <PortalAuthLayout
      eyebrow="One-time secure setup"
      title="Create the portal owner"
      description="Establish the first organisation owner account. This setup link becomes unusable after completion."
    >
      <PortalAuthForm mode="setup" token={token} />
    </PortalAuthLayout>
  );
}
