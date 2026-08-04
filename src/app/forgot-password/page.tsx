import Link from "next/link";
import { PortalAuthLayout } from "@/components/portal-auth-layout";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";
export const metadata = { title: "Forgot password" };
export default function ForgotPasswordPage() { return <PortalAuthLayout eyebrow="Account recovery" title="Reset your password" description="Enter your work email. For privacy, the response is the same whether or not an account exists."><PasswordRecoveryForm /><p className="portal-auth-footer"><Link href="/login">Return to sign in</Link></p></PortalAuthLayout>; }
