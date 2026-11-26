import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/org/resolve";

const COOKIE = "trazzo_session";
const MAX_AGE = 60 * 60 * 12; // 12 horas (un turno)

export type Role = "OPERATOR" | "SUPERVISOR" | "ADMIN";

export interface Session {
  operatorId: string;
  orgId: string;
  orgSlug: string;
  code: string;
  name: string;
  role: Role;
}

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("Falta SESSION_SECRET en .env.local");
  return new TextEncoder().encode(value);
}

export async function createSession(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      operatorId: String(payload.operatorId),
      orgId: String(payload.orgId),
      orgSlug: String(payload.orgSlug),
      code: String(payload.code),
      name: String(payload.name),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Úsala al inicio de cualquier página o acción protegida.
// Además de la sesión, comprueba que pertenezca a la organización del dominio actual.
export async function requireOperator(allowed?: Role[]): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");

  const org = await getCurrentOrg();
  if (!org || org.id !== session.orgId) redirect("/login");

  if (allowed && !allowed.includes(session.role)) redirect("/dashboard");
  return session;
}