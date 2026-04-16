import { LeadRow } from "@/lib/crm-data";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";

type LeadRowDb = {
  id: string;
  agency_id: string;
  advisor_id: string | null;
  name: string;
  product: string;
  source: LeadRow["source"];
  stage: LeadRow["stage"];
  advisor_name: LeadRow["advisor"];
  next_step: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  age: number | null;
  campaign_name: string | null;
  external_lead_id: string | null;
  notes: string | null;
  created_at: string;
};

const mapDbRowToLead = (row: LeadRowDb): LeadRow => ({
  id: row.id,
  agencyId: row.agency_id,
  name: row.name,
  product: row.product,
  source: row.source,
  stage: row.stage,
  advisor: row.advisor_name,
  nextStep: row.next_step,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  city: row.city ?? undefined,
  country: row.country ?? undefined,
  age: row.age ?? undefined,
  campaignName: row.campaign_name ?? undefined,
  externalLeadId: row.external_lead_id ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
});

const mapLeadToDbRow = (lead: LeadRow) => ({
  id: lead.id,
  agency_id: lead.agencyId,
  advisor_id: null,
  name: lead.name,
  product: lead.product,
  source: lead.source,
  stage: lead.stage,
  advisor_name: lead.advisor,
  next_step: lead.nextStep,
  email: lead.email ?? null,
  phone: lead.phone ?? null,
  city: lead.city ?? null,
  country: lead.country ?? null,
  age: lead.age ?? null,
  campaign_name: lead.campaignName ?? null,
  external_lead_id: lead.externalLeadId ?? null,
  notes: lead.notes ?? null,
  created_at: lead.createdAt ?? new Date().toISOString(),
});

export class SupabaseLeadRepository {
  async listByAgency(agencyId: string): Promise<LeadRow[]> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, agency_id, advisor_id, name, product, source, stage, advisor_name, next_step, email, phone, city, country, age, campaign_name, external_lead_id, notes, created_at",
      )
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => mapDbRowToLead(row as LeadRowDb));
  }

  async save(lead: LeadRow): Promise<LeadRow> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("leads")
      .upsert(mapLeadToDbRow(lead), { onConflict: "id" })
      .select(
        "id, agency_id, advisor_id, name, product, source, stage, advisor_name, next_step, email, phone, city, country, age, campaign_name, external_lead_id, notes, created_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapDbRowToLead(data as LeadRowDb);
  }

  async findByExternalLeadId(agencyId: string, externalLeadId: string): Promise<LeadRow | undefined> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, agency_id, advisor_id, name, product, source, stage, advisor_name, next_step, email, phone, city, country, age, campaign_name, external_lead_id, notes, created_at",
      )
      .eq("agency_id", agencyId)
      .eq("external_lead_id", externalLeadId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapDbRowToLead(data as LeadRowDb) : undefined;
  }

  async list(): Promise<LeadRow[]> {
    const agencyStore = new LocalStorageAgencyStore();
    const agencyId = getCurrentAgency(agencyStore).id;
    return this.listByAgency(agencyId);
  }

  async getById(leadId: string): Promise<LeadRow | undefined> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, agency_id, advisor_id, name, product, source, stage, advisor_name, next_step, email, phone, city, country, age, campaign_name, external_lead_id, notes, created_at",
      )
      .eq("id", leadId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapDbRowToLead(data as LeadRowDb) : undefined;
  }

  async getByExternalLeadId(externalLeadId: string): Promise<LeadRow | undefined> {
    const agencyStore = new LocalStorageAgencyStore();
    const agencyId = getCurrentAgency(agencyStore).id;
    return this.findByExternalLeadId(agencyId, externalLeadId);
  }

  async create(lead: LeadRow): Promise<LeadRow[]> {
    const savedLead = await this.save(lead);
    const allLeads = await this.list();
    return allLeads.map(l => l.id === savedLead.id ? savedLead : l);
  }

  async update(leadId: string, lead: LeadRow): Promise<LeadRow[]> {
    const savedLead = await this.save(lead);
    const allLeads = await this.list();
    return allLeads.map(l => l.id === savedLead.id ? savedLead : l);
  }
}
