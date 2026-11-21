// src/lib/nav.ts
export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  title: string;
  badge?: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  { title: "TRAZZO", items: [{ label: "Dashboard", href: "/dashboard" }] },
  { title: "REGISTER", items: [{ label: "Recepción de Tarimas", href: "/register" }] },
  {
    title: "CONTROL",
    items: [
      { label: "Inventario en Vivo", href: "/control/inventory" },
      { label: "Solicitudes y Reservas", href: "/control/requests" },
      { label: "Selección FIFO / FEFO", href: "/control/selection" },
    ],
  },
  {
    title: "DESPAX",
    badge: "Despacho",
    items: [
      { label: "Agenda de Custodias", href: "/despax/agenda" },
      { label: "Ruteo y Flotilla", href: "/despax/routing" },
      { label: "Despacho Final", href: "/despax/dispatch" },
    ],
  },
  { title: "SYSTEM", items: [{ label: "Auditoría y Trazabilidad", href: "/system/audit" }] },
];