// src/app/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar sesión");
        setPin("");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Sin conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 85% 20%, rgba(12,90,110,0.45), transparent 60%), #080c1a",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-line bg-surface p-6"
      >
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {BRAND.name}
            <span className="text-brand">{BRAND.suffix}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Acceso de operadores</p>
        </div>

        <label className="block text-sm">
          Código de operador
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoCapitalize="characters"
            autoComplete="username"
            className="mt-1 w-full rounded-lg bg-surface-2 p-3 text-lg outline-none ring-1 ring-line focus:ring-brand"
            placeholder="OP-001"
            required
          />
        </label>

        <label className="block text-sm">
          PIN
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            maxLength={12}
            className="mt-1 w-full rounded-lg bg-surface-2 p-3 text-center text-2xl tracking-[0.5em] outline-none ring-1 ring-line focus:ring-brand"
            required
          />
        </label>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand p-3 text-lg font-bold text-white hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}