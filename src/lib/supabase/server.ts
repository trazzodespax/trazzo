// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

// Solo para usar en el servidor (rutas API, server actions, server components).
// Nunca importes este archivo desde un componente con "use client".
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}