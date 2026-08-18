"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Clause = { key: string; title: string; body: string };

export function LeaseSigningForm({ token, clauses }: { token: string; clauses: Clause[] }) {
  const router = useRouter();
  const [initialed, setInitialed] = useState<Record<string, boolean>>({});
  const [signerName, setSignerName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const allInitialed = clauses.every((clause) => initialed[clause.key]);
  const canSubmit = allInitialed && signerName.trim().length >= 2 && !busy;

  async function submit() {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/public/v1/lease-signing/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signerName, initials: clauses.map((clause) => clause.key) }),
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(payload.error?.message ?? "The signature could not be completed.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="lease-signed-notice">
        <h2>Thank you</h2>
        <p>Your lease agreement has been signed and a record has been saved to your account.</p>
      </div>
    );
  }

  return (
    <div className="move-in-form">
      {clauses.map((clause) => (
        <div className="lease-clause" key={clause.key}>
          <h4>{clause.title}</h4>
          <p>{clause.body}</p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={Boolean(initialed[clause.key])}
              onChange={(event) => setInitialed((current) => ({ ...current, [clause.key]: event.target.checked }))}
            />
            <span>I have read and initial this clause.</span>
          </label>
        </div>
      ))}
      <label>
        Type your full legal name as your signature
        <input
          value={signerName}
          onChange={(event) => setSignerName(event.target.value)}
          minLength={2}
          maxLength={120}
          placeholder="Full name"
        />
      </label>
      <small>Your signature is captured with a timestamp, IP address and device information as the audit trail for this lease.</small>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button type="button" className="button button-primary" disabled={!canSubmit} onClick={submit}>
          {busy ? "Signing…" : "Sign lease agreement"}
        </button>
      </div>
    </div>
  );
}
