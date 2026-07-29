import {
  CalendarClock,
  CircleDollarSign,
  KeyRound,
  PhoneCall,
  ShoppingCart,
} from "lucide-react";
import type { StatusTone } from "@/components/status-pill";

export const dashboardMetrics = {
  occupancy: "91.6%",
  occupiedUnits: "445",
  receivables: "R 42,680",
  activeLeads: "34",
};

export const reminders = [
  {
    label: "Call overdue tenants",
    description: "Accounts requiring a collections touchpoint",
    count: 19,
    href: "/collections",
    icon: PhoneCall,
    tone: "danger",
  },
  {
    label: "Move-outs due",
    description: "Confirm condition, balance and access status",
    count: 4,
    href: "/operations",
    icon: CalendarClock,
    tone: "warning",
  },
  {
    label: "Access exceptions",
    description: "Commands awaiting provider confirmation",
    count: 3,
    href: "/operations",
    icon: KeyRound,
    tone: "warning",
  },
  {
    label: "Refunds to approve",
    description: "Manager approval required before processing",
    count: 2,
    href: "/billing",
    icon: CircleDollarSign,
    tone: "positive",
  },
  {
    label: "Stock below reorder point",
    description: "Locks and packing supplies",
    count: 6,
    href: "/operations",
    icon: ShoppingCart,
    tone: "default",
  },
] as const;

export const recentActivity: {
  time: string;
  status: string;
  tone: StatusTone;
  title: string;
  detail: string;
}[] = [
  {
    time: "14:32",
    status: "Completed",
    tone: "positive",
    title: "Move-in completed · Unit B-214",
    detail: "Agreement signed, initial payment posted and gate access provisioned.",
  },
  {
    time: "13:48",
    status: "Follow-up",
    tone: "warning",
    title: "Online lead requested a 12 m² unit",
    detail: "Lead source: Google Ads. Follow-up assigned to facility sales.",
  },
  {
    time: "12:15",
    status: "Paid",
    tone: "positive",
    title: "Account ST24-1048 settled",
    detail: "R 2,450 card payment restored access automatically.",
  },
  {
    time: "10:41",
    status: "Exception",
    tone: "danger",
    title: "Bank debit returned",
    detail: "Insufficient funds. Retry and collections tasks were created.",
  },
];

export const tenants = [
  {
    account: "ST24-1048",
    name: "Naledi Mokoena",
    contact: "naledi@example.test",
    unit: "B-214",
    balance: "R 0.00",
    status: "Current",
    tone: "positive" as const,
  },
  {
    account: "ST24-1031",
    name: "Horizon Events (Pty) Ltd",
    contact: "accounts@horizon.example",
    unit: "A-108, A-109",
    balance: "R 4,920.00",
    status: "Overdue",
    tone: "danger" as const,
  },
  {
    account: "ST24-1019",
    name: "Jordan Naidoo",
    contact: "jordan@example.test",
    unit: "C-031",
    balance: "R 1,150.00",
    status: "Due soon",
    tone: "warning" as const,
  },
  {
    account: "ST24-0998",
    name: "Sipho Dlamini",
    contact: "sipho@example.test",
    unit: "B-052",
    balance: "R 0.00",
    status: "Current",
    tone: "positive" as const,
  },
];

export const leads = [
  {
    name: "Lerato Khumalo",
    source: "Website",
    requirement: "6–9 m² · household",
    stage: "Qualified",
    next: "Today, 15:30",
    tone: "positive" as const,
  },
  {
    name: "Mandla Office Supplies",
    source: "Referral",
    requirement: "18 m² · business stock",
    stage: "Quote sent",
    next: "Tomorrow, 09:00",
    tone: "warning" as const,
  },
  {
    name: "Kerry Jacobs",
    source: "Walk-in",
    requirement: "3 m² · archive boxes",
    stage: "New",
    next: "Today, 16:00",
    tone: "neutral" as const,
  },
  {
    name: "Thabo Molefe",
    source: "Google Ads",
    requirement: "12 m² · moving house",
    stage: "Viewing booked",
    next: "30 Jul, 10:00",
    tone: "positive" as const,
  },
];

export const units = [
  ["A-108", "9 m²", "Ground floor", "Occupied", "R 1,890"],
  ["A-112", "9 m²", "Ground floor", "Available", "R 1,890"],
  ["B-214", "6 m²", "First floor", "Occupied", "R 1,450"],
  ["B-219", "6 m²", "First floor", "Reserved", "R 1,450"],
  ["C-044", "18 m²", "Drive-up", "Service", "R 3,250"],
  ["C-051", "18 m²", "Drive-up", "Available", "R 3,250"],
];

export const collectionCases = [
  ["ST24-1031", "Horizon Events (Pty) Ltd", "R 4,920", "31 days", "Access suspended"],
  ["ST24-0977", "Tumelo Radebe", "R 3,280", "22 days", "Call required"],
  ["ST24-1062", "Boxline Traders", "R 2,960", "15 days", "Notice sent"],
  ["ST24-1019", "Jordan Naidoo", "R 1,150", "5 days", "Grace period"],
];
