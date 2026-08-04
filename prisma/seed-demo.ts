import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (process.env.ALLOW_SYNTHETIC_DEMO_SEED !== "true" || process.env.NODE_ENV === "production") throw new Error("Demo seed refused. Set ALLOW_SYNTHETIC_DEMO_SEED=true in a non-production environment.");
const url = process.env.DATABASE_URL; if (!url) throw new Error("DATABASE_URL is required.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const organisation = await db.organisation.upsert({ where: { slug: "synthetic-demo" }, update: {}, create: { name: "Stor24 Synthetic Demo", slug: "synthetic-demo" } });
  const facility = await db.facility.upsert({ where: { organisationId_code: { organisationId: organisation.id, code: "DEMO-JHB" } }, update: {}, create: { organisationId: organisation.id, name: "Stor24 Johannesburg Demo", code: "DEMO-JHB", address: { line1: "Synthetic address", city: "Johannesburg" } } });
  const role = await db.role.upsert({ where: { organisationId_name: { organisationId: organisation.id, name: "Organisation owner" } }, update: {}, create: { organisationId: organisation.id, name: "Organisation owner", permissions: ["*"] } });
  const user = await db.user.upsert({ where: { organisationId_email: { organisationId: organisation.id, email: "owner@synthetic.example.test" } }, update: {}, create: { organisationId: organisation.id, email: "owner@synthetic.example.test", name: "Synthetic Owner", passwordHash: await hash("Demo-only!Change24", 12) } });
  const existingAssignment = await db.roleAssignment.findFirst({ where: { userId: user.id, roleId: role.id, facilityId: facility.id } });
  if (!existingAssignment) await db.roleAssignment.create({ data: { userId: user.id, roleId: role.id, facilityId: facility.id } });
  const small = await db.unitType.upsert({ where: { facilityId_name: { facilityId: facility.id, name: "Small 3 m²" } }, update: {}, create: { facilityId: facility.id, name: "Small 3 m²", widthMetres: 1.5, lengthMetres: 2, areaSqMetres: 3, features: ["Ground floor"] } });
  for (const [number, rate] of [["A-001", 799], ["A-002", 799]] as const) await db.unit.upsert({ where: { facilityId_number: { facilityId: facility.id, number } }, update: {}, create: { facilityId: facility.id, unitTypeId: small.id, number, monthlyRate: rate, taxRate: 0.15 } });
  const existingCustomer = await db.customer.findFirst({ where: { organisationId: organisation.id, email: "tenant@synthetic.example.test" } });
  const customer = existingCustomer ?? await db.customer.create({ data: { organisationId: organisation.id, firstName: "Synthetic", lastName: "Tenant", email: "tenant@synthetic.example.test", phone: "+27 10 000 0024" } });
  if (!await db.lead.findFirst({ where: { facilityId: facility.id, customerId: customer.id } })) await db.lead.create({ data: { facilityId: facility.id, customerId: customer.id, desiredUnitTypeId: small.id, source: "Synthetic website demo", notes: "Synthetic development data only" } });
  console.log(`Seeded ${organisation.name}; no production data used.`);
}
main().finally(() => db.$disconnect());
