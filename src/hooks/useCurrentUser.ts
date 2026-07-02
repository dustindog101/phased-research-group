"use client";

/**
 * Browser-side auth helper
 */

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status } = useSession();
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "ADMIN",
  };
}
