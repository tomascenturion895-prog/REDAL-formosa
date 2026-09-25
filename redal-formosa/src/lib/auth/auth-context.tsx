"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/supabase/types";
import { useAsync } from "@/lib/hooks/use-async";
import { profileRepository } from "./profile-repository";

export type { UserRole };

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  /** true mientras se resuelve la sesión y, si hay una, su rol. */
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // getUser() valida la sesión contra el servidor; onAuthStateChange mantiene el estado al iniciar/cerrar sesión.
    supabase.auth
      .getUser()
      .then(({ data }) => setUser(data.user))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    return () => subscription.unsubscribe();
  }, []);

  const { data: role, loading: roleLoading } = useAsync(() => profileRepository.roleOf(user!.id), [user?.id], {
    enabled: Boolean(user),
    scope: user?.id,
  });

  return (
    <AuthContext.Provider value={{ user, role: user ? (role ?? null) : null, loading: loading || roleLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
