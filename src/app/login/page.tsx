import { Suspense } from "react";
import { PortalAuthForm } from "@/components/portal-auth-form";
import { PortalAuthLayout } from "@/components/portal-auth-layout";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <PortalAuthLayout
      eyebrow="Welcome back"
      title="Sign in to Stor24"
      description="Enter your authorised work account to continue to the operations portal."
    >
      <Suspense fallback={<div className="portal-auth-loading">Loading secure sign-in…</div>}>
        <PortalAuthForm mode="login" />
      </Suspense>
    </PortalAuthLayout>
  );
}
