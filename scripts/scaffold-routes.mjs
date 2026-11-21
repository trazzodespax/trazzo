import { existsSync, mkdirSync, renameSync, rmdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const APP = join("src", "app");

function write(path, content) {
  if (existsSync(path)) {
    console.log("ya existe", path);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log("creado   ", path);
}

// 1) Mover el login al grupo (auth)
const oldLogin = join(APP, "login", "page.tsx");
const newLogin = join(APP, "(auth)", "login", "page.tsx");
if (existsSync(oldLogin) && !existsSync(newLogin)) {
  mkdirSync(dirname(newLogin), { recursive: true });
  renameSync(oldLogin, newLogin);
  console.log("movido   ", oldLogin, "->", newLogin);
  try {
    rmdirSync(join(APP, "login"));
  } catch {
    /* la carpeta no está vacía: se deja */
  }
}

// 2) Páginas del dashboard
const pages = [
  ["(dashboard)/dashboard", "TRAZZO", "Dashboard", "KPIs de existencias, recepciones abiertas y despachos del día."],
  ["(dashboard)/register", "REGISTER", "Recepción de Tarimas", "Crear la sesión de recepción de un embarque."],
  ["(dashboard)/control/inventory", "CONTROL", "Inventario en Vivo", "Cajas disponibles, pesos y ubicaciones con filtros."],
  ["(dashboard)/control/requests", "CONTROL", "Solicitudes y Reservas", "Kg requeridos por el Socio y sus reservas."],
  ["(dashboard)/control/selection", "CONTROL", "Selección FIFO / FEFO", "Selección de cajas completas hasta alcanzar el peso solicitado."],
  ["(dashboard)/despax/agenda", "DESPAX", "Agenda de Custodias", "Custodias activas y Pickup & Delivery por fecha y ventana horaria."],
  ["(dashboard)/despax/routing", "DESPAX", "Ruteo y Flotilla", "Optimización de rutas Kangoo / RAM 3.5t."],
  ["(dashboard)/despax/dispatch", "DESPAX", "Despacho Final", "Confirmación de salida y descuento del inventario físico."],
  ["(dashboard)/system/audit", "SYSTEM", "Auditoría y Trazabilidad", "Evidencia de cada captura, movimiento, reserva y despacho."],
];

for (const [dir, module, title, description] of pages) {
  write(
    join(APP, dir, "page.tsx"),
    `import PagePlaceholder from "@/components/PagePlaceholder";

export default function Page() {
  return (
    <PagePlaceholder
      module="${module}"
      title="${title}"
      description="${description}"
    />
  );
}
`
  );
}

// 3) Página dinámica de la sesión de recepción
write(
  join(APP, "(dashboard)", "register", "[sessionId]", "page.tsx"),
  `import PagePlaceholder from "@/components/PagePlaceholder";

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <PagePlaceholder
      module="REGISTER"
      title="Sesión de Recepción"
      description={"Sesión " + sessionId + ": tarimas y escaneo de cajas con cámara."}
    />
  );
}
`
);

// 4) Rutas API (por ahora devuelven 501)
const apis = ["select-boxes", "optimize-route", "upload-evidence"];
for (const name of apis) {
  write(
    join(APP, "api", name, "route.ts"),
    `import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "No implementado" }, { status: 501 });
}
`
  );
}