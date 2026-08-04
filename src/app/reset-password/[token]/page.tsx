import Link from "next/link";
import { PortalAuthLayout } from "@/components/portal-auth-layout";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";
export default async function ResetPasswordPage({ params }: PageProps<"/reset-password/[token]">) { const { token } = await params; return <PortalAuthLayout eyebrow="Account recovery" title="Choose a new password" description="This single-use link expires 30 minutes after it was requested."><PasswordRecoveryForm token={token} /><p className="portal-auth-footer"><Link href="/login">Return to sign in</Link></p></PortalAuthLayout>; }
