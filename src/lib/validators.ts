import { z } from "zod";

export const createLeadSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email(),
  phone: z.string().trim().min(7).max(30),
  facilityId: z.string().trim().min(1),
  desiredUnitTypeId: z.string().trim().optional(),
  source: z.string().trim().min(1).max(80),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const createInvitationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  roleName: z.enum([
    "Organisation owner",
    "Facility manager",
    "Sales / leasing",
    "Collections",
    "Finance",
    "Auditor / read only",
  ]),
  facilityCode: z.string().trim().max(40).optional(),
});

const strongPasswordSchema = z
    .string()
    .min(12, "Use at least 12 characters.")
    .max(128)
    .regex(/[a-z]/, "Add a lowercase letter.")
    .regex(/[A-Z]/, "Add an uppercase letter.")
    .regex(/[0-9]/, "Add a number.")
    .regex(/[^a-zA-Z0-9]/, "Add a special character.");

export const acceptInvitationSchema = z.object({
  token: z.string().min(32).max(200),
  password: strongPasswordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

export const ownerSetupSchema = loginSchema.extend({
  token: z.string().min(32).max(200),
  name: z.string().trim().min(2).max(120),
  password: strongPasswordSchema,
});

export const createTaskSchema = z.object({
  facilityId: z.string().cuid().optional(),
  customerId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(4000).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  dueAt: z.iso.datetime().optional(),
});

export const updateTaskSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "COMPLETED", "CANCELLED"]),
});

export const unitNoteSchema = z.object({
  facilityId: z.string().cuid(), unitId: z.string().cuid(),
  note: z.string().trim().min(2).max(4000), pinned: z.boolean().default(false),
});

export const maintenanceSchema = z.object({
  facilityId: z.string().cuid(), unitId: z.string().cuid().optional(),
  title: z.string().trim().min(2).max(160), description: z.string().trim().max(4000).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  dueAt: z.iso.datetime().optional(),
});

export const productSchema = z.object({
  facilityId: z.string().cuid(), sku: z.string().trim().min(1).max(60),
  name: z.string().trim().min(2).max(160), category: z.string().trim().min(1).max(80),
  barcode: z.string().trim().max(100).optional(), costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(), quantityOnHand: z.number().int().nonnegative().default(0),
  reorderPoint: z.number().int().nonnegative().default(0),
});

export const stockMovementSchema = z.object({
  productId: z.string().cuid(), type: z.enum(["RECEIPT", "SALE", "RETURN", "ADJUSTMENT", "DAMAGE", "TRANSFER"]),
  quantity: z.number().int().refine((value) => value !== 0, "Quantity cannot be zero."),
  unitCost: z.number().nonnegative().optional(), reason: z.string().trim().max(500).optional(),
  reference: z.string().trim().max(100).optional(),
});

export const dailyCloseSchema = z.object({
  facilityId: z.string().cuid(), businessDate: z.iso.date(),
  expectedCash: z.number().nonnegative(), countedCash: z.number().nonnegative(),
  notes: z.string().trim().max(2000).optional(),
  checks: z.array(z.object({ key: z.string().min(1).max(80), label: z.string().min(1).max(160), complete: z.boolean() })).min(1),
});

export const configurationSchema = z.object({
  facilityId: z.string().cuid().nullable().optional(),
  domain: z.enum(["FACILITY", "PROGRAM_DEFAULTS", "TENANT_DEFAULTS", "BANKING_ACCOUNTING", "MARKETING", "PRICE_OPTIMIZER", "FACILITY_MAP", "PHONE", "MARKETPLACE"]),
  name: z.string().trim().min(1).max(120), status: z.enum(["DRAFT", "READY", "DISABLED"]).default("DRAFT"),
  config: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export const integrationSchema = z.object({
  facilityId: z.string().cuid().nullable().optional(), category: z.string().trim().min(1).max(80),
  provider: z.string().trim().min(1).max(100), status: z.enum(["DISCONNECTED", "CONFIGURED", "DISABLED"]).default("DISCONNECTED"),
  config: z.object({ endpoint: z.url().optional(), accountReference: z.string().max(120).optional(), notes: z.string().max(500).optional() }).strict(),
});

export const chargeDefinitionSchema = z.object({
  code: z.string().trim().min(1).max(40).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120), amount: z.number().nonnegative().optional(),
  calculation: z.enum(["FIXED", "PERCENTAGE", "RULE_BASED"]).default("FIXED"), taxable: z.boolean().default(true),
  active: z.boolean().default(true), config: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export const discountPlanSchema = z.object({
  code: z.string().trim().min(1).max(40).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120), discountType: z.enum(["FIXED", "PERCENTAGE"]),
  value: z.number().nonnegative(), active: z.boolean().default(true), startsAt: z.iso.datetime().optional(), endsAt: z.iso.datetime().optional(),
  rules: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});
