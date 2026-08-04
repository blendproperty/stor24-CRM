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

export const forgotPasswordSchema = z.object({ email: z.string().trim().toLowerCase().email() });
export const resetPasswordSchema = z.object({ token: z.string().min(32).max(200), password: strongPasswordSchema });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(128), password: strongPasswordSchema });
export const updateUserSchema = z.object({
  active: z.boolean().optional(),
  roleName: createInvitationSchema.shape.roleName.optional(),
  facilityCode: z.string().trim().max(40).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0);
