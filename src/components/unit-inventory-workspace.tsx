"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, Warehouse, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";

type UnitType = {
  id: string;
  facilityId: string;
  name: string;
  widthMetres: string | null;
  lengthMetres: string | null;
  areaSqMetres: string | null;
  features: string[];
};
type Unit = {
  id: string;
  facilityId: string;
  unitTypeId: string;
  number: string;
  floor: string | null;
  zone: string | null;
  status: string;
  monthlyRate: string;
  taxRate: string;
  unitType: UnitType;
};
type Facility = {
  id: string;
  name: string;
  code: string;
  unitTypes: UnitType[];
  units: Unit[];
};
type DialogState =
  { kind: "unit"; unit?: Unit } | { kind: "type"; unitType?: UnitType };

const editableStatuses = ["AVAILABLE", "SERVICE", "UNAVAILABLE"];
const statusLabel = (status: string) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase());
const money = (value: string) =>
  Number(value).toLocaleString("en-ZA", { style: "currency", currency: "ZAR" });

export function UnitInventoryWorkspace({
  initialFacilities,
}: {
  initialFacilities: Facility[];
}) {
  const [facilities, setFacilities] = useState(initialFacilities);
  const [facilityId, setFacilityId] = useState(initialFacilities[0]?.id ?? "");
  const [typeId, setTypeId] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [display, setDisplay] = useState<"size" | "area">("size");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const selectedFacility = facilities.find(
    (facility) => facility.id === facilityId,
  );
  const allUnits = facilities.flatMap((facility) =>
    facility.units.map((unit) => ({ ...unit, facility })),
  );
  const visible = allUnits.filter(
    (unit) =>
      (!facilityId || unit.facilityId === facilityId) &&
      (!typeId || unit.unitTypeId === typeId) &&
      (!status || unit.status === status) &&
      (!query ||
        `${unit.number} ${unit.unitType.name} ${unit.floor ?? ""} ${unit.zone ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const summaries = [
    ["Total units", allUnits.length],
    [
      "Available",
      allUnits.filter((unit) => unit.status === "AVAILABLE").length,
    ],
    ["Reserved", allUnits.filter((unit) => unit.status === "RESERVED").length],
    ["Occupied", allUnits.filter((unit) => unit.status === "OCCUPIED").length],
  ];
  const grouped = useMemo(
    () =>
      selectedFacility?.unitTypes.map((type) => ({
        type,
        available: selectedFacility.units.filter(
          (unit) => unit.unitTypeId === type.id && unit.status === "AVAILABLE",
        ).length,
      })) ?? [],
    [selectedFacility],
  );

  async function refresh() {
    const [facilityResponse, typeResponse, unitResponse] = await Promise.all([
      fetch("/api/v1/leasing/facilities", { cache: "no-store" }),
      fetch("/api/v1/leasing/unit-types", { cache: "no-store" }),
      fetch("/api/v1/leasing/units", { cache: "no-store" }),
    ]);
    const [facilityPayload, typePayload, unitPayload] = await Promise.all([
      facilityResponse.json(),
      typeResponse.json(),
      unitResponse.json(),
    ]);
    if (!facilityResponse.ok || !typeResponse.ok || !unitResponse.ok)
      throw new Error("Inventory could not be refreshed.");
    setFacilities(
      facilityPayload.data.map((facility: Facility) => ({
        ...facility,
        unitTypes: typePayload.data.filter(
          (type: UnitType) => type.facilityId === facility.id,
        ),
        units: unitPayload.data.filter(
          (unit: Unit) => unit.facilityId === facility.id,
        ),
      })),
    );
  }

  async function submit(form: FormData) {
    if (!dialog) return;
    const isType = dialog.kind === "type";
    const editing = isType ? dialog.unitType : dialog.unit;
    const targetFacility = String(form.get("facilityId") ?? facilityId);
    const width = Number(form.get("widthMetres") || 0);
    const length = Number(form.get("lengthMetres") || 0);
    const payload = isType
      ? {
          facilityId: targetFacility,
          name: form.get("name"),
          widthMetres: width || undefined,
          lengthMetres: length || undefined,
          areaSqMetres:
            form.get("areaSqMetres") ||
            (width && length ? width * length : undefined),
          features: String(form.get("features") ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }
      : {
          facilityId: targetFacility,
          unitTypeId: form.get("unitTypeId"),
          number: form.get("number"),
          floor: form.get("floor") || undefined,
          zone: form.get("zone") || undefined,
          monthlyRate: form.get("monthlyRate"),
          taxRate: Number(form.get("taxRate") || 15) / 100,
          status: editing ? form.get("status") : "AVAILABLE",
        };
    setBusy(true);
    setError("");
    setNotice("");
    const resource = isType ? "unit-types" : "units";
    const response = await fetch(`/api/v1/leasing/${resource}`, {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        editing ? { id: editing.id, data: payload } : payload,
      ),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(
        response.status === 409
          ? "This change conflicts with an existing unit, reservation or occupancy."
          : (result.error?.message ??
              "The inventory record could not be saved."),
      );
      return;
    }
    await refresh();
    setDialog(null);
    setNotice(
      isType
        ? editing
          ? "Unit type updated."
          : "Unit type added."
        : editing
          ? "Unit updated."
          : "Unit added.",
    );
  }

  async function deleteUnitType(unitType: UnitType) {
    if (!window.confirm(`Delete the ${unitType.name} unit type?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    const response = await fetch(
      `/api/v1/leasing/unit-types?id=${encodeURIComponent(unitType.id)}`,
      { method: "DELETE" },
    );
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(
        response.status === 409
          ? "This unit type cannot be deleted while units are assigned to it."
          : (result.error?.message ?? "The unit type could not be deleted."),
      );
      return;
    }
    if (typeId === unitType.id) setTypeId("");
    await refresh();
    setDialog(null);
    setNotice("Unit type deleted.");
  }

  return (
    <div className="page-stack unit-inventory-workspace">
      <PageHeader
        eyebrow="Inventory"
        title="Units & availability"
        description="Store-scoped unit register, physical attributes, availability and operational rates."
        action={
          <div className="form-actions">
            <button
              className="button button-secondary"
              onClick={() => {
                setDialog({ kind: "type" });
                setError("");
              }}
            >
              <Plus size={15} />
              Unit type
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setDialog({ kind: "unit" });
                setError("");
              }}
              disabled={
                !facilities.some((facility) => facility.unitTypes.length)
              }
            >
              <Plus size={15} />
              Add unit
            </button>
          </div>
        }
      />
      {notice ? <p className="form-success">{notice}</p> : null}
      <section className="summary-strip">
        {summaries.map(([label, count]) => (
          <div className="summary-cell" key={label}>
            <span>{label}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </section>
      <section className="panel inventory-toolbar">
        <label>
          Store
          <select
            value={facilityId}
            onChange={(event) => {
              setFacilityId(event.target.value);
              setTypeId("");
            }}
          >
            <option value="">All permitted stores</option>
            {facilities.map((facility) => (
              <option value={facility.id} key={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Unit type
          <select
            value={typeId}
            onChange={(event) => setTypeId(event.target.value)}
          >
            <option value="">All types</option>
            {(
              selectedFacility?.unitTypes ??
              facilities.flatMap((facility) => facility.unitTypes)
            ).map((type) => (
              <option value={type.id} key={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {[
              "AVAILABLE",
              "HELD",
              "RESERVED",
              "OCCUPIED",
              "SERVICE",
              "UNAVAILABLE",
            ].map((item) => (
              <option value={item} key={item}>
                {statusLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="inventory-search">
          <span>Find unit</span>
          <span className="toolbar-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Number, type, floor or zone"
            />
          </span>
        </label>
        <fieldset>
          <legend>Display</legend>
          <label>
            <input
              type="radio"
              checked={display === "size"}
              onChange={() => setDisplay("size")}
            />
            Size
          </label>
          <label>
            <input
              type="radio"
              checked={display === "area"}
              onChange={() => setDisplay("area")}
            />
            Area
          </label>
        </fieldset>
      </section>
      <section className="inventory-layout">
        <div className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>{display === "size" ? "Size" : "Area"}</th>
                  <th>Floor / zone</th>
                  <th>Status</th>
                  <th>Monthly rate</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.length ? (
                  visible.map((unit) => (
                    <tr key={unit.id}>
                      <td>{unit.facility.name}</td>
                      <td className="primary-cell">{unit.number}</td>
                      <td>{unit.unitType.name}</td>
                      <td>
                        {display === "size"
                          ? [
                              unit.unitType.widthMetres,
                              unit.unitType.lengthMetres,
                            ]
                              .filter(Boolean)
                              .join(" × ") || "—"
                          : unit.unitType.areaSqMetres
                            ? `${unit.unitType.areaSqMetres} m²`
                            : "—"}
                      </td>
                      <td>
                        {[unit.floor, unit.zone].filter(Boolean).join(" / ") ||
                          "—"}
                      </td>
                      <td>
                        <StatusPill
                          tone={
                            unit.status === "AVAILABLE"
                              ? "positive"
                              : unit.status === "SERVICE" ||
                                  unit.status === "UNAVAILABLE"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {statusLabel(unit.status)}
                        </StatusPill>
                      </td>
                      <td>{money(unit.monthlyRate)}</td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={`Edit unit ${unit.number}`}
                          onClick={() => {
                            setDialog({ kind: "unit", unit });
                            setError("");
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="empty-cell" colSpan={8}>
                      No units match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="panel inventory-breakdown">
          <h2>
            <Warehouse size={18} />
            Availability
          </h2>
          {grouped.length ? (
            grouped.map(({ type, available }) => (
              <div className="inventory-type-row" key={type.id}>
                <button type="button" onClick={() => setTypeId(type.id)}>
                  <span>
                    <strong>{type.name}</strong>
                    <small>
                      {type.areaSqMetres
                        ? `${type.areaSqMetres} m²`
                        : [type.widthMetres, type.lengthMetres]
                            .filter(Boolean)
                            .join(" × ")}
                    </small>
                  </span>
                  <b>{available}</b>
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Edit ${type.name} unit type`}
                  title={`Edit ${type.name}`}
                  onClick={() => {
                    setDialog({ kind: "type", unitType: type });
                    setError("");
                  }}
                >
                  <Pencil size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="empty-cell">Add a unit type to begin.</p>
          )}
        </aside>
      </section>
      {dialog ? (
        <InventoryDialog
          state={dialog}
          facilities={facilities}
          defaultFacilityId={facilityId || facilities[0]?.id || ""}
          busy={busy}
          error={error}
          close={() => setDialog(null)}
          submit={submit}
          deleteUnitType={deleteUnitType}
        />
      ) : null}
    </div>
  );
}

function InventoryDialog({
  state,
  facilities,
  defaultFacilityId,
  busy,
  error,
  close,
  submit,
  deleteUnitType,
}: {
  state: DialogState;
  facilities: Facility[];
  defaultFacilityId: string;
  busy: boolean;
  error: string;
  close: () => void;
  submit: (form: FormData) => void;
  deleteUnitType: (unitType: UnitType) => void;
}) {
  const isType = state.kind === "type";
  const editingUnit = state.kind === "unit" ? state.unit : undefined;
  const editingType = state.kind === "type" ? state.unitType : undefined;
  const [facilityId, setFacilityId] = useState(
    editingUnit?.facilityId ?? editingType?.facilityId ?? defaultFacilityId,
  );
  const types =
    facilities.find((facility) => facility.id === facilityId)?.unitTypes ?? [];
  return (
    <div className="modal-backdrop">
      <div
        className="modal-card inventory-modal"
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close" onClick={close}>
          <X size={18} />
        </button>
        <p className="eyebrow">Unit inventory</p>
        <h2>
          {isType
            ? editingType
              ? `Edit ${editingType.name}`
              : "Add unit type"
            : editingUnit
              ? `Edit unit ${editingUnit.number}`
              : "Add unit"}
        </h2>
        <form action={submit} className="inventory-form">
          <label>
            Store
            <select
              name="facilityId"
              value={facilityId}
              onChange={(event) => setFacilityId(event.target.value)}
              disabled={Boolean(editingUnit || editingType)}
            >
              {facilities.map((facility) => (
                <option value={facility.id} key={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </label>
          {isType ? (
            <>
              <Field
                name="name"
                label="Type name"
                value={editingType?.name}
                required
              />
              <Field
                name="widthMetres"
                label="Width (metres)"
                type="number"
                step=".01"
                value={editingType?.widthMetres}
              />
              <Field
                name="lengthMetres"
                label="Length (metres)"
                type="number"
                step=".01"
                value={editingType?.lengthMetres}
              />
              <Field
                name="areaSqMetres"
                label="Area (m²)"
                type="number"
                step=".01"
                value={editingType?.areaSqMetres}
              />
              <Field
                name="features"
                label="Features (comma separated)"
                className="inventory-form-wide"
                placeholder="Inside, climate controlled, power"
                value={editingType?.features.join(", ")}
              />
            </>
          ) : (
            <>
              <label>
                Unit type
                <select
                  name="unitTypeId"
                  defaultValue={editingUnit?.unitTypeId}
                  required
                >
                  {types.map((type) => (
                    <option value={type.id} key={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                name="number"
                label="Unit number"
                value={editingUnit?.number}
                required
              />
              <Field name="floor" label="Floor" value={editingUnit?.floor} />
              <Field
                name="zone"
                label="Zone / section"
                value={editingUnit?.zone}
              />
              <Field
                name="monthlyRate"
                label="Monthly rate (R)"
                value={editingUnit?.monthlyRate}
                type="number"
                step=".01"
                required
              />
              <Field
                name="taxRate"
                label="VAT rate (%)"
                value={
                  editingUnit ? String(Number(editingUnit.taxRate) * 100) : "15"
                }
                type="number"
                step=".01"
              />
              {editingUnit ? (
                <label>
                  Status
                  <select
                    name="status"
                    defaultValue={
                      editableStatuses.includes(editingUnit.status)
                        ? editingUnit.status
                        : editingUnit.status
                    }
                    disabled={!editableStatuses.includes(editingUnit.status)}
                  >
                    {editableStatuses.includes(editingUnit.status) ? (
                      editableStatuses.map((item) => (
                        <option value={item} key={item}>
                          {statusLabel(item)}
                        </option>
                      ))
                    ) : (
                      <option value={editingUnit.status}>
                        {statusLabel(editingUnit.status)} — managed by tenancy
                      </option>
                    )}
                  </select>
                </label>
              ) : null}
            </>
          )}
          {error ? (
            <p className="form-error inventory-form-wide">{error}</p>
          ) : null}
          <div className="form-actions inventory-form-wide">
            {editingType ? (
              <button
                type="button"
                className="button button-danger"
                onClick={() => deleteUnitType(editingType)}
                disabled={busy}
              >
                <Trash2 size={15} /> Delete type
              </button>
            ) : null}
            <button
              type="button"
              className="button button-secondary"
              onClick={close}
            >
              Cancel
            </button>
            <button className="button button-primary" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  className,
  ...props
}: Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue"
> & { label: string; value?: string | null }) {
  return (
    <label className={className}>
      {label}
      <input defaultValue={value ?? ""} {...props} />
    </label>
  );
}
