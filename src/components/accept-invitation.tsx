"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, ShieldCheck, XCircle } from "lucide-react";

export function AcceptInvitation({ token, name, email, roleName, facilityName }: { token: string; name: string; email: string; roleName: string; facilityName: string }) {
  const [state, setState] = useState<"idle" | "busy" | "accepted" | "error">("idle");
  const [message, setMessage] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);

  async function accept() {
    const password = passwordRef.current?.value ?? "";
    if (password !== (confirmationRef.current?.value ?? "")) {
      setState("error");
      setMessage("Passwords do not match.");
      return;
    }
    setState("busy");
    const response = await fetch("/api/v1/invitations/accept", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setState("error");
      setMessage(payload.error?.message ?? "The invitation could not be accepted.");
      return;
    }
    setState("accepted");
  }

  if (state === "accepted") {
    return <section className="accept-card panel"><CheckCircle2 className="accept-positive" size={44} /><p className="eyebrow">Account activated</p><h1>Welcome to Stor24, {name}</h1><p>Your {roleName} access has been created for {facilityName}.</p><Link className="button button-primary" href="/">Open Stor24 CRM</Link></section>;
  }

  return (
    <section className="accept-card panel">
      {state === "error" ? <XCircle className="accept-error" size={44} /> : <ShieldCheck size={44} />}
      <p className="eyebrow">Stor24 invitation</p>
      <h1>Join the Stor24 workspace</h1>
      <dl><div><dt>Name</dt><dd>{name}</dd></div><div><dt>Email</dt><dd>{email}</dd></div><div><dt>Role</dt><dd>{roleName}</dd></div><div><dt>Scope</dt><dd>{facilityName}</dd></div></dl>
      {message ? <p className="form-error">{message}</p> : <p>Choose a secure password to activate your account and assigned facility permissions.</p>}
      <label className="accept-password-label">Create password<input ref={passwordRef} type="password" autoComplete="new-password" minLength={12} required /></label>
      <label className="accept-password-label">Confirm password<input ref={confirmationRef} type="password" autoComplete="new-password" minLength={12} required /></label>
      <p className="password-guidance">Use 12+ characters with upper and lowercase letters, a number and a symbol.</p>
      <button className="button button-primary" disabled={state === "busy"} onClick={accept}>{state === "busy" ? <LoaderCircle className="spin" size={16} /> : <CheckCircle2 size={16} />}{state === "busy" ? "Activating…" : "Accept invitation"}</button>
    </section>
  );
}
