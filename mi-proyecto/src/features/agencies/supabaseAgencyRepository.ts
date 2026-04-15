import { AgencyPlan, AgencyRecord } from "@/features/agencies/agencyModel";
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

const mapAgencyRow = (row: AgencyRow): AgencyRecord => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  city: row.city,
  country: row.country,
  plan: row.plan,
  teamSize: row.team_size,
});

const mapAgencyRecord = (agency: AgencyRecord) => ({
  id: agency.id,
  name: agency.name,
  slug: agency.slug,
  city: agency.city,
  country: agency.country,
  plan: agency.plan,
  team_size: agency.teamSize,
});

export class SupabaseAgencyRepository {
  async list(): Promise<AgencyRecord[]> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("agencies")
      .select("id, name, slug, city, country, plan, team_size")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => mapAgencyRow(row as AgencyRow));
  }

  async save(agency: AgencyRecord): Promise<AgencyRecord> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const payload = mapAgencyRecord(agency);
    const { data, error } = await supabase
      .from("agencies")
      .upsert(payload, { onConflict: "id" })
      .select("id, name, slug, city, country, plan, team_size")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapAgencyRow(data as AgencyRow);
  }
}
