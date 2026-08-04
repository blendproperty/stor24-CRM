export type EmailMessage = { to: string; subject: string; text: string; html: string };
export interface EmailProvider { send(message: EmailMessage): Promise<void> }
export function escapeEmailHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]!); }

class ResendEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM, ...message }) });
    if (!response.ok) throw new Error(`Email provider rejected request (${response.status}).`);
  }
}
class DisabledEmailProvider implements EmailProvider { async send() { throw new Error("Email delivery is not configured."); } }
export function emailProvider(): EmailProvider { return process.env.EMAIL_PROVIDER === "resend" ? new ResendEmailProvider() : new DisabledEmailProvider(); }
