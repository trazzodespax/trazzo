import { cache } from "react";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";

export interface Org {
  id: string;
  slug: string;
  name: string;
  status: string;
  timezone: string;
}

// "demo.localhost:3000" -> "demo"  |  "demo.trazzo.app" (con ROOT_DOMAIN=trazzo.app) -> "demo"
export function slugFromHost(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.split(":")[0].toLowerCase();
  const root = process.env.ROOT_DOMAIN?.toLowerCase();

  if (host.endsWith(".localhost")) {
    return host.slice(0, -".localhost".length) || null;
  }
  if (root && host.endsWith("." + root)) {
    return host.slice(0, -(root.length + 1)) || null;
  }
  return null;
}

// La organización de la petición actual (se consulta una sola vez por petición)
export const getCurrentOrg = cache(async (): Promise<Org | null> => {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const slug = slugFromHost(host) ?? process.env.DEFAULT_ORG_SLUG ?? null;
  if (!slug) return null;

  const { data, error } = await supabaseAdmin()
    .from("organizations")
    .select("id, slug, name, status, timezone")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data || data.status === "SUSPENDED") return null;
  return data as Org;
});