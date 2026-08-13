export type UnitNumberRecord = { id: string; number: string };
export type UnitNumberRequest = { unitId: string; newNumber: string };
export type UnitNumberChange = UnitNumberRequest & { oldNumber: string };

export class UnitRenumberingError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

const key = (value: string) => value.trim().toLocaleLowerCase("en-ZA");

export function prepareUnitRenumberPlan(
  units: UnitNumberRecord[],
  requests: UnitNumberRequest[],
): UnitNumberChange[] {
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const requestedIds = new Set<string>();
  const changes: UnitNumberChange[] = [];

  for (const request of requests) {
    if (requestedIds.has(request.unitId)) {
      throw new UnitRenumberingError(
        "DUPLICATE_UNIT_REQUEST",
        "A unit can only appear once in a renumbering batch.",
      );
    }
    requestedIds.add(request.unitId);
    const unit = unitsById.get(request.unitId);
    if (!unit) {
      throw new UnitRenumberingError(
        "UNIT_NOT_FOUND",
        "One of the selected units no longer exists at this store.",
      );
    }
    const newNumber = request.newNumber.trim();
    if (!newNumber || newNumber.length > 40) {
      throw new UnitRenumberingError(
        "INVALID_UNIT_NUMBER",
        "Unit numbers must contain between 1 and 40 characters.",
      );
    }
    if (newNumber !== unit.number) {
      changes.push({ unitId: unit.id, oldNumber: unit.number, newNumber });
    }
  }

  if (!changes.length) return [];
  const changedIds = new Set(changes.map((change) => change.unitId));
  const unchangedNumbers = new Map(
    units
      .filter((unit) => !changedIds.has(unit.id))
      .map((unit) => [key(unit.number), unit.number]),
  );
  const requestedNumbers = new Map<string, string>();

  for (const change of changes) {
    const normalized = key(change.newNumber);
    const duplicate = requestedNumbers.get(normalized);
    if (duplicate) {
      throw new UnitRenumberingError(
        "DUPLICATE_NEW_NUMBER",
        `Unit number ${change.newNumber} is assigned more than once in this batch.`,
      );
    }
    const collision = unchangedNumbers.get(normalized);
    if (collision) {
      throw new UnitRenumberingError(
        "UNIT_NUMBER_EXISTS",
        `Unit number ${collision} already belongs to another unit at this store.`,
      );
    }
    requestedNumbers.set(normalized, change.newNumber);
  }

  return changes;
}

export function reverseUnitRenumberPlan(changes: UnitNumberChange[]) {
  return changes.map((change) => ({
    unitId: change.unitId,
    newNumber: change.oldNumber,
  }));
}
