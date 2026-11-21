import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { BRAND } from "@/lib/brand";
import BarcodeDecor from "@/components/landing/BarcodeDecor";

function CubeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 2l9 5v10l-9 5-9-5V7z" />
      <path d="M3 7l9 5 9-5M12 12v10" />
    </svg>
  );
}

export default async function Landing() {
  const session = await getSession();
  const href = session ? "/dashboard" : "/login";
  const year = new Date().getFullYear();
  const photo = BRAND.heroImage;

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ minHeight: "100dvh" }}>
      {/* Fondo */}
      <div aria-hidden className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 85% 35%, rgba(12,90,110,0.55), transparent 60%), linear-gradient(180deg, #080c1a 0%, #0a1020 100%)",
          }}
        />
        {photo ? (
          <>
            <Image
              src={photo}
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", opacity: 0.35 }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(8,12,26,0.95) 0%, rgba(8,12,26,0.7) 45%, rgba(8,12,26,0.3) 100%)",
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 80% 70% at 70% 45%, black 20%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 70% at 70% 45%, black 20%, transparent 75%)",
            }}
          />
        )}
      </div>

      {!photo && <BarcodeDecor />}

      {/* Barra superior */}
      <header
        className="relative border-b border-white/5"
        style={{ background: "rgba(7,11,24,0.6)", backdropFilter: "blur(8px)" }}
      >
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
            {BRAND.name}
            <span className="text-brand">{BRAND.suffix}</span>
          </Link>
          <Link
            href={href}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:brightness-110"
          >
            {session ? "Ir al panel" : "Entrar"}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex flex-1 items-center">
        <div className="mx-auto w-full max-w-6xl px-5 py-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <CubeIcon />
            {BRAND.badge}
          </span>

          <h1
            className="font-display mt-5 font-black tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 6.2vw, 4.5rem)", lineHeight: 1.05 }}
          >
            Cada producto, cada caja
            <br />
            <span className="text-brand">con trazabilidad total.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Recibe tarimas, escanea cada caja, selecciona por FIFO / FEFO el peso exacto y la cantidad del producto que pide el cliente, y despacha con evidencia. Todo en un solo flujo, de la recepción a la entrega.
          </p>

          <Link
            href={href}
            className="mt-9 inline-flex rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-white hover:brightness-110"
          >
            {session ? "Ir al panel de operación" : "Entrar a TRAZZO"}
          </Link>
        </div>
      </main>

      {/* Pie dentro de la misma pantalla */}
      <footer className="relative px-5 py-4 text-center text-xs text-muted">
        <p>
          © {year} {BRAND.name}
          {BRAND.suffix}. Todos los derechos reservados.
        </p>
        {BRAND.poweredBy && (
          <p className="mt-1">
            Powered by <span className="text-white/70">{BRAND.poweredBy}</span>
          </p>
        )}
      </footer>
    </div>
  );
}