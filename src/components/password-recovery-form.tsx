"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PasswordRecoveryForm({ token }: { token?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(formData: FormData) {
    setBusy(true); setMessage("");
    const response = await fetch(token ? "/api/auth/reset-password" : "/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(token ? { token, password: formData.get("password") } : { email: formData.get("email") }) });
    const payload = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(payload.error || "Unable to continue."); return; }
    if (token) { router.replace("/login?reset=success"); return; }
    setMessage(payload.data.message);
  }
  return <form className="portal-auth-form" action={submit}>
    {token ? <><label><span>New password</span><div className="portal-field"><input name="password" type="password" autoComplete="new-password" minLength={12} required /></div></label><p className="password-guidance">Use 12+ characters with upper and lowercase letters, a number and a symbol.</p></> : <label><span>Work email</span><div className="portal-field"><input name="email" type="email" autoComplete="email" required /></div></label>}
    {message ? <p role="status" className={token ? "portal-form-error" : "password-guidance"}>{message}</p> : null}
    <button className="portal-submit" disabled={busy} type="submit">{busy ? "Please wait…" : token ? "Reset password" : "Send reset instructions"}</button>
  </form>;
}
