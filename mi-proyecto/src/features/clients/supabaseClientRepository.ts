import { Client, ClientStatus } from "@/features/clients/clientModel";
import { supabase } from "@/integrations/supabase/client";

type ClientRow = {
  id: string;
  agency_id: string;
  lead_id: string | null;
  advisor_id: string | null;
  advisor_name: string;
  full_name: string;
  product: string;
  policy_number: string | null;
  renewal_date: string;
  status: ClientStatus;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
};

const mapClientRow = (row: ClientRow): Client => ({
  id: row.id,
  agencyId: row.agency_id,
  sourceLeadId: row.lead_id ?? "manual-client",
  advisor: row.advisor_name,
  fullName: row.full_name,
  product: row.product,
  policyNumber: row.policy_number ?? undefined,
  renewalDate: row.renewal_date,
  status: row.status,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  city: row.city ?? undefined,
  country: row.country ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
});

const mapClientRecord = (client: Client) => ({
  id: client.id,
  agency_id: client.agencyId,
  lead_id: client.sourceLeadId === "manual-client" ? null : client.sourceLeadId,
  advisor_id: null,
  advisor_name: client.advisor,
  full_name: client.fullName,
  product: client.product,
  policy_number: client.policyNumber ?? null,
  renewal_date: client.renewalDate,
  status: client.status,
  email: client.email ?? null,
  phone: client.phone ?? null,
  city: client.city ?? null,
  country: client.country ?? null,
  notes: client.notes ?? null,
  created_at: client.createdAt,
});

export class SupabaseClientRepository {
  async listByAgency(agencyId: string): Promise<Client[]> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("clients")
      .select(
        "id, agency_id, lead_id, advisor_id, advisor_name, full_name, product, policy_number, renewal_date, status, email, phone, city, country, notes, created_at",
      )
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => mapClientRow(row as ClientRow));
  }

  async save(client: Client): Promise<Client> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("clients")
      .upsert(mapClientRecord(client), { onConflict: "id" })
      .select(
        "id, agency_id, lead_id, advisor_id, advisor_name, full_name, product, policy_number, renewal_date, status, email, phone, city, country, notes, created_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapClientRow(data as ClientRow);
  }
}
