// src/app/api/auth/login/routes.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createSession } from "@/lib/auth/session";

const schema = z.object({
  code: z.string().trim().min(1).max(30),
  pin: z.string().min(4).max(12),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin().rpc("verify_operator_pin", {
    p_code: parsed.data.code,
    p_pin: parsed.data.pin,
  });

  if (error) {
    console.error("verify_operator_pin", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }

  const row = data?.[0];

  if (!row || row.status === "INVALID") {
    return NextResponse.json({ error: "Código o PIN incorrecto" }, { status: 401 });
  }
  if (row.status === "LOCKED") {
    return NextResponse.json(
      { error: "Operador bloqueado temporalmente. Intenta de nuevo en 5 minutos." },
      { status: 423 }
    );
  }

  await createSession({
    operatorId: row.operator_id,
    code: row.operator_code,
    name: row.operator_name,
    role: row.operator_role,
  });

  return NextResponse.json({ ok: true });
}