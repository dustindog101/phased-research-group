/**
 * Auth helpers — server-side session + role checks
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    role: (session.user as { role?: string }).role ?? "USER",
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSession();
  return user?.role === "ADMIN";
}
