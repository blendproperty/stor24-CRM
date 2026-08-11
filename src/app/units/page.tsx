import { UnitInventoryWorkspace } from "@/components/unit-inventory-workspace";
import { listLeasing } from "@/lib/leasing-service";
import { requireScope } from "@/lib/scope";

export const metadata = { title: "Units & rates" };

export default async function UnitsPage() {
  const { facilities } = await listLeasing(await requireScope());
  return <UnitInventoryWorkspace initialFacilities={facilities.map((facility) => ({ id: facility.id, name: facility.name, code: facility.code, unitTypes: facility.unitTypes.map((type) => ({ ...type, widthMetres: type.widthMetres?.toString() ?? null, lengthMetres: type.lengthMetres?.toString() ?? null, areaSqMetres: type.areaSqMetres?.toString() ?? null })), units: facility.units.map((unit) => ({ ...unit, monthlyRate: unit.monthlyRate.toString(), taxRate: unit.taxRate.toString(), unitType: { ...unit.unitType, widthMetres: unit.unitType.widthMetres?.toString() ?? null, lengthMetres: unit.unitType.lengthMetres?.toString() ?? null, areaSqMetres: unit.unitType.areaSqMetres?.toString() ?? null } })) }))}/>;
}
