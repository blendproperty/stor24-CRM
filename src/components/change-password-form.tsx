"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ChangePasswordForm() {
  const router = useRouter(); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(formData: FormData) {
    setBusy(true); setMessage("");
    if (formData.get("password") !== formData.get("confirmation")) { setBusy(false); setMessage("The new passwords do not match."); return; }
    const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ currentPassword: formData.get("currentPassword"), password: formData.get("password") }) });
    const payload = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(payload.error || "The password could not be changed."); return; }
    router.replace("/login?password=changed"); router.refresh();
  }
  return <form action={submit} className="invite-form"><label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required /></label><label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label><label>Confirm new password<input name="confirmation" type="password" autoComplete="new-password" minLength={12} required /></label><p className="panel-subtitle">Use 12+ characters with upper and lowercase letters, a number and a symbol. Changing it signs out every session.</p>{message ? <p className="form-error" role="alert">{message}</p> : null}<button className="button button-primary" disabled={busy} type="submit">{busy ? "Changing…" : "Change password"}</button></form>;
}
