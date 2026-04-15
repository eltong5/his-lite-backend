import { AdvisorRecord, AdvisorRole } from "@/features/advisors/advisorModel";
import { supabase } from "@/integrations/supabase/client";

type AdvisorRow = {
  id: string;
  agency_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: AdvisorRole;
  active: boolean;
};

const mapAdvisorRow = (row: AdvisorRow): AdvisorRecord => ({
  id: row.id,
  agencyId: row.agency_id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone ?? undefined,
  role: row.role,
  active: row.active,
});

const mapAdvisorRecord = (advisor: AdvisorRecord) => ({
  id: advisor.id,
  agency_id: advisor.agencyId,
  full_name: advisor.fullName,
  email: advisor.email,
  phone: advisor.phone ?? null,
  role: advisor.role,
  active: advisor.active,
});

export class SupabaseAdvisorRepository {
  async listByAgency(agencyId: string): Promise<AdvisorRecord[]> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("advisors")
      .select("id, agency_id, full_name, email, phone, role, active")
      .eq("agency_id", agencyId)
      .order("full_name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => mapAdvisorRow(row as AdvisorRow));
  }

  async save(advisor: AdvisorRecord): Promise<AdvisorRecord> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const payload = mapAdvisorRecord(advisor);
    const { data, error } = await supabase
      .from("advisors")
      .upsert(payload, { onConflict: "id" })
      .select("id, agency_id, full_name, email, phone, role, active")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapAdvisorRow(data as AdvisorRow);
  }
}
