export type ProviderResult<T> =
  | { ok: true; providerReference: string; data: T }
  | { ok: false; retryable: boolean; code: string; message: string };

export type ProviderContext = { organisationId: string; facilityId?: string; idempotencyKey: string };

export interface PaymentProvider {
  readonly category: "PAYMENTS";
  health(): Promise<ProviderResult<{ latencyMs: number }>>;
  charge(input: { token: string; amountMinor: number; currency: string }, context: ProviderContext): Promise<ProviderResult<{ status: "SUCCEEDED" | "PENDING" }>>;
}

export interface AccessControlProvider {
  readonly category: "ACCESS_CONTROL";
  health(): Promise<ProviderResult<{ latencyMs: number }>>;
  issue(command: { occupancyId: string; action: "ACTIVATE" | "SUSPEND" | "RESTORE" | "REVOKE" }, context: ProviderContext): Promise<ProviderResult<{ accepted: boolean }>>;
}

export interface MessageProvider {
  readonly category: "EMAIL" | "SMS";
  health(): Promise<ProviderResult<{ latencyMs: number }>>;
  send(message: { recipient: string; subject?: string; body: string }, context: ProviderContext): Promise<ProviderResult<{ status: "QUEUED" }>>;
}

export interface AccountingProvider {
  readonly category: "ACCOUNTING";
  health(): Promise<ProviderResult<{ latencyMs: number }>>;
  exportBatch(batch: { closeId: string; entries: readonly Record<string, unknown>[] }, context: ProviderContext): Promise<ProviderResult<{ accepted: boolean }>>;
}

export interface WebsiteLeadProvider {
  readonly category: "WEBSITE_LEADS";
  health(): Promise<ProviderResult<{ latencyMs: number }>>;
  acknowledge(event: { externalId: string }, context: ProviderContext): Promise<ProviderResult<{ accepted: boolean }>>;
}

export class ConfigurationRequiredProvider {
  constructor(readonly category: PaymentProvider["category"] | AccessControlProvider["category"] | MessageProvider["category"] | AccountingProvider["category"] | WebsiteLeadProvider["category"], readonly providerName: string) {}
  async health(): Promise<ProviderResult<{ latencyMs: number }>> {
    return { ok: false, retryable: false, code: "CONFIG_REQUIRED", message: `${this.providerName} has not been configured or verified.` };
  }
}
