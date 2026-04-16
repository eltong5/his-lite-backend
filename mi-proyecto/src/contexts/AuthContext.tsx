import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  clearAgencyCache,
  createTenantForNewUser,
  hydrateAgencyFromProfile,
} from "@/features/auth/agencyBootstrap";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    agencyName: string,
    city?: string,
    country?: string,
    phone?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await hydrateAgencyFromProfile(nextUser.id);
      }
      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (event === "SIGNED_OUT") {
        clearAgencyCache();
        return;
      }
      if (
        nextUser &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")
      ) {
        await hydrateAgencyFromProfile(nextUser.id);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    if (data.user) {
      setUser(data.user);
      await hydrateAgencyFromProfile(data.user.id);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    agencyName: string,
    city?: string,
    country?: string,
    phone?: string,
  ) => {
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/bienvenida` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          agency_name: agencyName,
          city: city ?? "",
          country: country ?? "",
          phone: phone ?? "",
        },
      },
    });
    if (error) {
      throw error;
    }
    if (!data.user) {
      throw new Error("No se pudo crear la cuenta.");
    }
    if (!data.session) {
      throw new Error(
        "Cuenta creada. Revisa tu correo para confirmar el email y luego inicia sesion. " +
          "(En desarrollo puedes desactivar Confirm email en Supabase > Authentication > Providers > Email.)",
      );
    }
    setUser(data.session.user);
    await createTenantForNewUser(data.session.user.id, { agencyName, city, country, phone });
  };

  const signOut = async () => {
    clearAgencyCache();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
