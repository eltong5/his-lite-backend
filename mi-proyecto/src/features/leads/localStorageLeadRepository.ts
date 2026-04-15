import { leadRows, LeadRow } from "@/lib/crm-data";
import { LeadRepository } from "@/features/leads/leadRepository";

const STORAGE_KEY = "crm-leads";

export class LocalStorageLeadRepository implements LeadRepository {
  private readLeads(): LeadRow[] {
    if (typeof window === "undefined") {
      return leadRows;
    }

    const storedLeads = window.localStorage.getItem(STORAGE_KEY);
    if (!storedLeads) {
      return leadRows;
    }

    try {
      const parsedLeads = JSON.parse(storedLeads) as LeadRow[];
      return parsedLeads.length > 0 ? parsedLeads : leadRows;
    } catch {
      return leadRows;
    }
  }

  private writeLeads(leads: LeadRow[]): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  list(): LeadRow[] {
    return this.readLeads();
  }

  getById(leadId: string): LeadRow | undefined {
    return this.readLeads().find((lead) => lead.id === leadId);
  }

  getByExternalLeadId(externalLeadId: string): LeadRow | undefined {
    return this.readLeads().find((lead) => lead.externalLeadId === externalLeadId);
  }

  create(lead: LeadRow): LeadRow[] {
    const nextLeads = [lead, ...this.readLeads()];
    this.writeLeads(nextLeads);
    return nextLeads;
  }

  update(leadId: string, nextLead: LeadRow): LeadRow[] {
    const nextLeads = this.readLeads().map((lead) => (lead.id === leadId ? nextLead : lead));
    this.writeLeads(nextLeads);
    return nextLeads;
  }
}
