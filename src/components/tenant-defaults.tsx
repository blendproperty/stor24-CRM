"use client";

import { useState } from "react";
import { ShieldCheck, UsersRound } from "lucide-react";

type FieldSetting = { required: boolean; defaultValue: string };
type TenantConfig = Record<string, Record<string, FieldSetting>>;

const sections = {
  primary: [
    ["title", "Title"], ["firstName", "First name"], ["lastName", "Last name"], ["address", "Street address"],
    ["city", "City"], ["province", "Province"], ["postalCode", "Postal code"], ["country", "Country"],
    ["phone", "Phone"], ["email", "Email address"], ["idNumber", "SA ID or passport number"],
    ["taxNumber", "Tax number"], ["dateOfBirth", "Date of birth"], ["driverLicence", "Driver's licence"],
    ["licenceProvince", "Licence province"], ["mobilePhone", "Mobile phone"], ["mobileCountryCode", "Mobile country code"],
    ["smsConsent", "SMS consent"],
  ],
  alternate: [["title", "Title"], ["firstName", "First name"], ["lastName", "Last name"], ["address", "Street address"], ["city", "City"], ["province", "Province"], ["postalCode", "Postal code"], ["country", "Country"], ["phone", "Phone"]],
  work: [["title", "Title"], ["firstName", "First name"], ["lastName", "Last name"], ["company", "Company"], ["address", "Street address"], ["city", "City"], ["province", "Province"], ["postalCode", "Postal code"], ["country", "Country"], ["phone", "Phone"]],
} as const;

const defaults: TenantConfig = Object.fromEntries(Object.entries(sections).map(([section, fields]) => [section, Object.fromEntries(fields.map(([key]) => [key, { required: key === "firstName" || key === "lastName", defaultValue: key === "country" ? "South Africa" : key === "mobileCountryCode" ? "+27" : "" }]))]));

export function TenantDefaults({ initial, busy, onSave }: { initial?: Record<string, unknown>; busy: boolean; onSave: (config: Record<string, unknown>) => void }) {
  const [tab, setTab] = useState<keyof typeof sections>("primary");
  const [config, setConfig] = useState<TenantConfig>(() => {
    const saved = initial?.sections as TenantConfig | undefined;
    return saved ? { ...defaults, ...saved } : defaults;
  });

  function update(key: string, patch: Partial<FieldSetting>) {
    setConfig((current) => ({ ...current, [tab]: { ...current[tab], [key]: { ...current[tab][key], ...patch } } }));
  }

  return <div className="company-form tenant-defaults">
    <div className="panel-heading"><div><p className="eyebrow">General setup</p><h2>Tenant defaults</h2><p className="panel-subtitle">Choose the information required when a tenant is created at this store.</p></div><UsersRound className="positive-icon"/></div>
    <div className="program-tabs tenant-tabs" role="tablist">
      {(["primary", "alternate", "work"] as const).map((name) => <button type="button" role="tab" aria-selected={tab === name} className={tab === name ? "active" : ""} onClick={() => setTab(name)} key={name}>{name === "primary" ? "Primary address" : name === "alternate" ? "Alternate contact" : "Work details"}</button>)}
    </div>
    <div className="safe-config-note"><ShieldCheck size={16}/>South African labels are used. Sensitive identity numbers and passwords are never pre-filled.</div>
    <div className="tenant-default-header"><strong>Tenant field</strong><strong>Required</strong><strong>Default value</strong></div>
    <div className="tenant-default-list">
      {sections[tab].map(([key, label]) => {
        const sensitive = key === "idNumber" || key === "taxNumber" || key === "dateOfBirth" || key === "driverLicence" || key === "smsConsent";
        const setting = config[tab][key] ?? { required: false, defaultValue: "" };
        return <div className="tenant-default-row" key={key}><label htmlFor={`${tab}-${key}`}>{label}</label><input id={`${tab}-${key}`} aria-label={`${label} required`} type="checkbox" checked={setting.required} onChange={(event) => update(key, { required: event.target.checked })}/><input aria-label={`${label} default value`} value={setting.defaultValue} disabled={sensitive} placeholder={sensitive ? "Not stored as a default" : "Optional"} onChange={(event) => update(key, { defaultValue: event.target.value })}/></div>;
      })}
    </div>
    <div className="form-footer"><button type="button" className="button button-primary" disabled={busy} onClick={() => onSave({ market: "ZA", sections: config })}>{busy ? "Saving…" : "Save tenant defaults"}</button></div>
  </div>;
}
