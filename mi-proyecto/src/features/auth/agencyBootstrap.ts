import type { User } from "@supabase/supabase-js";
import { AgencyPlan, AgencyRecord } from "@/features/agencies/agencyModel";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { supabase } from "@/integrations/supabase/client";

type AgencyRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  plan: AgencyPlan;
  team_size: number;
};

export function slugifyAgencyName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "agencia";
}

export function clearAgencyCache(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem("crm-current-agency");
  window.localStorage.removeItem("crm-agencies");
}

export async function hydrateAgencyFromProfile(userId: string): Promise<void> {
  if (!supabase) {
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile?.agency_id) {
    return;
  }

  const { data: row, error: agencyError } = await supabase
    .from("agencies")
    .select("id, name, slug, city, country, plan, team_size")
    .eq("id", profile.agency_id)
    .maybeSingle();

  if (agencyError || !row) {
    return;
  }

  const r = row as AgencyRow;
  const agency: AgencyRecord = {
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: r.city,
    country: r.country,
    plan: r.plan,
    teamSize: r.team_size,
  };

  const store = new LocalStorageAgencyStore();
  const existing = store.list().filter((a) => a.id !== agency.id);
  store.saveAll([agency, ...existing]);
  store.saveCurrent(agency);
}

export async function createTenantForNewUser(
  userId: string,
  opts: { agencyName: string; city?: string; country?: string; phone?: string },
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const agencyId = `agency-${crypto.randomUUID()}`;
  const baseSlug = slugifyAgencyName(opts.agencyName);
  let slug = baseSlug;

  const agency: AgencyRecord = {
    id: agencyId,
    name: opts.agencyName.trim(),
    slug,
    city: (opts.city ?? "Bogotá").trim() || "Bogotá",
    country: (opts.country ?? "Colombia").trim() || "Colombia",
    plan: "Starter",
    teamSize: 1,
  };

  let insertPayload = {
    id: agency.id,
    name: agency.name,
    slug: agency.slug,
    city: agency.city,
    country: agency.country,
    plan: agency.plan,
    team_size: agency.teamSize,
  };

  for (let attempt = 0; attempt < 8; attempt++) {
    const { error } = await supabase.from("agencies").insert(insertPayload);
    if (!error) {
      break;
    }
    if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
      agency.slug = slug;
      insertPayload = { ...insertPayload, slug };
      continue;
    }
    throw new Error(error.message);
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    agency_id: agencyId,
    role: "owner",
  });

  if (profileError) {
    throw new Error(
      `No se pudo vincular tu cuenta a la agencia: ${profileError.message}. ` +
        "Si acabas de desplegar, ejecuta en Supabase el bloque SQL de la tabla public.profiles del archivo schema.sql.",
    );
  }

  const store = new LocalStorageAgencyStore();
  store.saveAll([agency]);
  store.saveCurrent(agency);
}

/**
 * Si el usuario confirmo el correo despues del registro, no existia sesion al crear la agencia.
 * Crea tenant + profile usando los metadatos guardados en signUp.
 */
export async function ensureTenantIfMissing(user: User): Promise<void> {
  if (!supabase) {
    return;
  }

  const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (existing) {
    await hydrateAgencyFromProfile(user.id);
    return;
  }

  const meta = user.user_metadata ?? {};
  const agencyName =
    typeof meta.agency_name === "string"
      ? meta.agency_name.trim()
      : typeof meta["agency_name"] === "string"
        ? meta["agency_name"].trim()
        : "";

  if (!agencyName) {
    return;
  }

  await createTenantForNewUser(user.id, {
    agencyName,
    city: typeof meta.city === "string" ? meta.city : undefined,
    country: typeof meta.country === "string" ? meta.country : undefined,
    phone: typeof meta.phone === "string" ? meta.phone : undefined,
  });
}
