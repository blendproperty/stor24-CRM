"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CalendarCheck,
  Calculator,
  CreditCard,
  LandPlot,
  LayoutDashboard,
  PhoneCall,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  Warehouse,
} from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/users", label: "Users & permissions", icon: Users },
  { href: "/leads", label: "Lead to lease", icon: CalendarCheck },
  { href: "/units", label: "Units & rates", icon: Warehouse },
  { href: "/billing", label: "Billing & payments", icon: CreditCard },
  { href: "/collections", label: "Collections", icon: ShieldAlert },
  { href: "/operations", label: "Operations", icon: Building2 },
  { href: "/adjustments", label: "Adjustments", icon: SlidersHorizontal },
  { href: "/company", label: "Company & setup", icon: Settings },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/graphs", label: "Graphs", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/prorate", label: "Prorate calculator", icon: Calculator },
  { href: "/map", label: "Facility map", icon: LandPlot },
  { href: "/phone", label: "Phone integration", icon: PhoneCall },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">24</span>
          <span>
            <strong>Stor24</strong>
            <small>Cloud CRM</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {navigation.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                className={clsx("nav-link", active && "nav-link-active")}
                href={item.href}
                key={item.href}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <p className="nav-label">System</p>
          <Link
            className={clsx(
              "nav-link",
              pathname.startsWith("/settings") && "nav-link-active",
            )}
            href="/settings"
          >
            <Settings size={18} />
            Settings
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="facility-card">
            <span />
            <div>
              <strong>Stor24 Randburg</strong>
              <small>Online · Africa/Johannesburg</small>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <label className="search">
            <Search size={18} />
            <input
              aria-label="Global search"
              placeholder="Search tenants, units, leads or invoices…"
            />
          </label>
          <div className="top-actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="profile">
              <span className="avatar">BD</span>
              <div>
                <strong>Brett Dovey</strong>
                <small>Organisation owner</small>
              </div>
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
