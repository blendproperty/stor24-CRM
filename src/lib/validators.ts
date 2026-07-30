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

export const acceptInvitationSchema = z.object({
  token: z.string().min(32).max(200),
});
