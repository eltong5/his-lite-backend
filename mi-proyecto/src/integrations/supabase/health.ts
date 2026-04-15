import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export type SupabaseConnectionStatus = "ready" | "schema-missing" | "unreachable" | "not-configured";

export type SupabaseConnectionResult = {
  status: SupabaseConnectionStatus;
  message: string;
};

const MISSING_SCHEMA_CODES = new Set(["42P01", "PGRST205"]);

export const checkSupabaseConnection = async (): Promise<SupabaseConnectionResult> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      status: "not-configured",
      message: "Faltan las variables de entorno de Supabase en el frontend.",
    };
  }

  const { error } = await supabase.from("agencies").select("id", { head: true, count: "exact" });

  if (!error) {
    return {
      status: "ready",
      message: "Conexion exitosa con Supabase. La tabla agencies ya responde.",
    };
  }

  if (MISSING_SCHEMA_CODES.has(error.code ?? "")) {
    return {
      status: "schema-missing",
      message: "Supabase respondio bien, pero la tabla agencies aun no existe. El siguiente paso es crear el esquema SQL.",
    };
  }

  return {
    status: "unreachable",
    message: `No se pudo validar la conexion con Supabase: ${error.message}`,
  };
};
