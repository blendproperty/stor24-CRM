import { db } from "@/lib/db";
import { emailProvider, escapeEmailHtml } from "@/lib/email";
import { TwilioSmsProvider, TwilioWhatsAppProvider } from "@/lib/integrations/twilio-provider";
import type { ProviderResult } from "@/lib/integrations/providers";
import { privacyHash } from "@/lib/request-security";

type Channel = "EMAIL" | "SMS" | "WHATSAPP";

type ReservationConfirmationInput = {
  organisationId: string;
  facilityId: string;
  customerId: string;
  idempotencyKey: string;
  consent: { email: boolean; sms: boolean; phone: boolean };
  to: { email: string; phone: string };
  variables: {
    firstName: string;
    facilityName: string;
    unitNumber: string;
    monthlyRateZar: string;
    holdExpiresAt: string;
    reference: string;
  };
};

const DEFAULT_TEMPLATES: Record<Channel, { subject?: string; body: string }> = {
  EMAIL: {
    subject: "Your Stor24 unit is held — {{reference}}",
    body: "Hi {{firstName}},\n\nUnit {{unitNumber}} at {{facilityName}} is held for you until {{holdExpiresAt}} at R{{monthlyRateZar}}/month.\n\nYour reference is {{reference}}. Our team will be in touch to confirm your move-in.\n\nStor24",
  },
  SMS: { body: "Stor24: Unit {{unitNumber}} at {{facilityName}} is held until {{holdExpiresAt}}. Ref {{reference}}. We'll be in touch to confirm." },
  WHATSAPP: { body: "Stor24: Unit {{unitNumber}} at {{facilityName}} is held until {{holdExpiresAt}}. Ref {{reference}}. We'll be in touch to confirm." },
};

function render(text: string, variables: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => variables[key] ?? match);
}

async function resolveTemplate(organisationId: string, channel: Channel) {
  const template = await db.communicationTemplate.findFirst({
    where: { organisationId, key: "reservation-confirmation", channel, active: true },
    orderBy: { version: "desc" },
  });
  return {
    templateId: template?.id ?? null,
    subject: template?.subject ?? DEFAULT_TEMPLATES[channel].subject,
    body: template?.body ?? DEFAULT_TEMPLATES[channel].body,
  };
}

async function logDelivery(input: {
  organisationId: string;
  facilityId: string;
  customerId: string;
  templateId: string | null;
  channel: Channel;
  recipient: string;
  idempotencyKey: string;
  provider: string;
  result: { ok: true; providerReference: string } | { ok: false; code: string; message: string };
}) {
  await db.communicationLog.upsert({
    where: { idempotencyKey: input.idempotencyKey },
    create: {
      organisationId: input.organisationId,
      facilityId: input.facilityId,
      customerId: input.customerId,
      templateId: input.templateId,
      channel: input.channel,
      recipientHash: privacyHash(input.recipient),
      provider: input.provider,
      providerRef: input.result.ok ? input.result.providerReference : undefined,
      status: input.result.ok ? "SUCCEEDED" : "FAILED",
      idempotencyKey: input.idempotencyKey,
      failureCode: input.result.ok ? undefined : input.result.code,
      failureMessage: input.result.ok ? undefined : input.result.message,
      sentAt: input.result.ok ? new Date() : undefined,
      failedAt: input.result.ok ? undefined : new Date(),
    },
    update: {},
  });
}

/**
 * Sends the reservation-confirmation notification across whichever channels
 * the customer consented to, using an active CommunicationTemplate for the
 * organisation if one exists, otherwise a built-in default so the pilot
 * works before anyone has set up templates through the (currently
 * placeholder) Communications screen.
 *
 * Never throws — a notification failure must not fail or roll back the
 * reservation itself. Every attempt, success or failure, is logged to
 * CommunicationLog with the recipient stored only as a privacy-safe hash.
 *
 * Note: WhatsApp currently reuses the "phone" consent checkbox (there is no
 * separate WhatsApp opt-in in the booking form or the consent schema).
 * Revisit if the business wants WhatsApp consent tracked distinctly.
 */
export async function notifyReservationConfirmed(input: ReservationConfirmationInput) {
  const results: Array<{ channel: Channel; ok: boolean }> = [];

  if (input.consent.email && input.to.email) {
    const { templateId, subject, body } = await resolveTemplate(input.organisationId, "EMAIL");
    const idempotencyKey = `${input.idempotencyKey}:EMAIL`;
    const renderedBody = render(body, input.variables);
    try {
      await emailProvider().send({
        to: input.to.email,
        subject: render(subject ?? "Your Stor24 reservation", input.variables),
        text: renderedBody,
        html: `<p>${escapeEmailHtml(renderedBody).replaceAll("\n", "<br/>")}</p>`,
      });
      await logDelivery({ organisationId: input.organisationId, facilityId: input.facilityId, customerId: input.customerId, templateId, channel: "EMAIL", recipient: input.to.email, idempotencyKey, provider: process.env.EMAIL_PROVIDER ?? "disabled", result: { ok: true, providerReference: "" } });
      results.push({ channel: "EMAIL", ok: true });
    } catch (error) {
      await logDelivery({ organisationId: input.organisationId, facilityId: input.facilityId, customerId: input.customerId, templateId, channel: "EMAIL", recipient: input.to.email, idempotencyKey, provider: process.env.EMAIL_PROVIDER ?? "disabled", result: { ok: false, code: "SEND_FAILED", message: error instanceof Error ? error.message : "Email send failed." } });
      results.push({ channel: "EMAIL", ok: false });
    }
  }

  if (input.consent.sms && input.to.phone) {
    const { templateId, body } = await resolveTemplate(input.organisationId, "SMS");
    const idempotencyKey = `${input.idempotencyKey}:SMS`;
    const result: ProviderResult<{ status: "QUEUED" }> = await new TwilioSmsProvider().send(
      { recipient: input.to.phone, body: render(body, input.variables) },
      { organisationId: input.organisationId, facilityId: input.facilityId, idempotencyKey },
    );
    await logDelivery({ organisationId: input.organisationId, facilityId: input.facilityId, customerId: input.customerId, templateId, channel: "SMS", recipient: input.to.phone, idempotencyKey, provider: "twilio", result: result.ok ? { ok: true, providerReference: result.providerReference } : { ok: false, code: result.code, message: result.message } });
    results.push({ channel: "SMS", ok: result.ok });
  }

  if (input.consent.sms && input.to.phone) {
    const { templateId, body } = await resolveTemplate(input.organisationId, "WHATSAPP");
    const idempotencyKey = `${input.idempotencyKey}:WHATSAPP`;
    const result: ProviderResult<{ status: "QUEUED" }> = await new TwilioWhatsAppProvider().send(
      { recipient: input.to.phone, body: render(body, input.variables) },
      { organisationId: input.organisationId, facilityId: input.facilityId, idempotencyKey },
    );
    await logDelivery({ organisationId: input.organisationId, facilityId: input.facilityId, customerId: input.customerId, templateId, channel: "WHATSAPP", recipient: input.to.phone, idempotencyKey, provider: "twilio", result: result.ok ? { ok: true, providerReference: result.providerReference } : { ok: false, code: result.code, message: result.message } });
    results.push({ channel: "WHATSAPP", ok: result.ok });
  }

  return results;
}
