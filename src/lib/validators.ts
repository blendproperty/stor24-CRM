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

const id = z.string().trim().min(1).max(64);
const money = z.coerce.number().nonnegative().max(10_000_000);
const optionalText = z.string().trim().max(2000).optional();

export const facilitySchema = z.object({ name: z.string().trim().min(2).max(120), code: z.string().trim().min(2).max(40).toUpperCase(), timezone: z.string().trim().min(3).max(80).default("Africa/Johannesburg"), address: z.record(z.string(), z.string()).optional(), active: z.boolean().default(true) });
export const unitTypeSchema = z.object({ facilityId: id, name: z.string().trim().min(2).max(100), widthMetres: z.coerce.number().positive().optional(), lengthMetres: z.coerce.number().positive().optional(), areaSqMetres: z.coerce.number().positive().optional(), features: z.array(z.string().trim().min(1).max(80)).max(30).default([]) });
export const unitSchema = z.object({ facilityId: id, unitTypeId: id, number: z.string().trim().min(1).max(40), floor: z.string().trim().max(40).optional(), zone: z.string().trim().max(40).optional(), monthlyRate: money, taxRate: z.coerce.number().min(0).max(1).default(0.15), status: z.enum(["AVAILABLE", "HELD", "RESERVED", "OCCUPIED", "SERVICE", "UNAVAILABLE"]).default("AVAILABLE") });
export const customerSchema = z.object({ type: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"), firstName: z.string().trim().max(100).optional(), lastName: z.string().trim().max(100).optional(), companyName: z.string().trim().max(160).optional(), email: z.email().optional(), phone: z.string().trim().min(7).max(30).optional(), identityRef: z.string().trim().max(100).optional(), billingAddress: z.record(z.string(), z.string()).optional(), emergencyContact: z.record(z.string(), z.string()).optional() }).refine((v) => v.companyName || (v.firstName && v.lastName), "Provide a person or company name.");
export const leadSchema = z.object({ facilityId: id, customerId: id.optional(), desiredUnitTypeId: id.optional(), stage: z.enum(["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "VIEWING_BOOKED", "RESERVED", "WON", "LOST"]).default("NEW"), source: z.string().trim().min(1).max(80), notes: optionalText, expectedMoveIn: z.coerce.date().optional(), nextActionAt: z.coerce.date().optional(), assignedToId: id.optional() });
export const reservationSchema = z.object({ facilityId: id, customerId: id, leadId: id.optional(), unitId: id, quotedRate: money, holdExpiresAt: z.coerce.date().optional(), intendedMoveIn: z.coerce.date().optional() });
export const moveInSchema = z.object({ reservationId: id.optional(), facilityId: id, customerId: id, unitId: id, startDate: z.coerce.date(), monthlyRate: money.optional(), initialCharge: money.default(0), accessState: z.string().trim().min(1).max(40).default("PENDING") });
export const transferSchema = z.object({ tenancyId: id, toUnitId: id, effectiveAt: z.coerce.date(), monthlyRate: money.optional() });
export const noticeSchema = z.object({ tenancyId: id, noticeDate: z.coerce.date(), plannedMoveOut: z.coerce.date() }).refine((v) => v.plannedMoveOut >= v.noticeDate, "Move-out cannot precede notice.");
export const moveOutSchema = z.object({ tenancyId: id, movedOutAt: z.coerce.date(), finalCharge: money.default(0), notes: optionalText });

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
