// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/lib/nav";
import LogoutButton from "@/components/LogoutButton";

export default function Sidebar({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Móvil: barra superior */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="font-black tracking-widest">
          TRAZZO
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="rounded-lg border border-line px-3 py-1.5 text-sm"
        >
          Menú
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-line p-4">
          <Link href="/dashboard" className="text-xl font-black tracking-widest">
            TRAZZO
          </Link>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto p-4">
          {NAV.map((section) => (
            <div key={section.title}>
              <div className="mb-1 flex items-center gap-2 px-2 text-xs font-bold tracking-widest text-brand">
                {section.title}
                {section.badge && (
                  <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold">
                    {section.badge}
                  </span>
                )}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm ${
                          active ? "bg-brand/15 text-white" : "text-muted hover:bg-surface-2"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-4 text-sm">
          <div className="mb-2 text-muted">
            {name} · {role}
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}