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
