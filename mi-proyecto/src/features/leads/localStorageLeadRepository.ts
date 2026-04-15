import { leadRows, LeadRow } from "@/lib/crm-data";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { LeadRepository } from "@/features/leads/leadRepository";

const STORAGE_KEY = "crm-leads";
const agencyStore = new LocalStorageAgencyStore();

export class LocalStorageLeadRepository implements LeadRepository {
  private getCurrentAgencyId() {
    return getCurrentAgency(agencyStore).id;
  }

  private readLeads(): LeadRow[] {
    const currentAgencyId = this.getCurrentAgencyId();

    if (typeof window === "undefined") {
      return leadRows.filter((lead) => lead.agencyId === currentAgencyId);
    }

    const storedLeads = window.localStorage.getItem(STORAGE_KEY);
    if (!storedLeads) {
      return leadRows.filter((lead) => lead.agencyId === currentAgencyId);
    }

    try {
      const parsedLeads = JSON.parse(storedLeads) as LeadRow[];
      const agencyLeads = parsedLeads.filter((lead) => lead.agencyId === currentAgencyId);
      return agencyLeads.length > 0 ? agencyLeads : leadRows.filter((lead) => lead.agencyId === currentAgencyId);
    } catch {
      return leadRows.filter((lead) => lead.agencyId === currentAgencyId);
    }
  }

  private writeLeads(leads: LeadRow[]): void {
    if (typeof window === "undefined") {
      return;
    }

    const storedLeads = window.localStorage.getItem(STORAGE_KEY);
    const allLeads = storedLeads ? (JSON.parse(storedLeads) as LeadRow[]) : [];
    const currentAgencyId = this.getCurrentAgencyId();
    const otherAgencyLeads = allLeads.filter((lead) => lead.agencyId !== currentAgencyId);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherAgencyLeads, ...leads]));
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

  saveAll(leads: LeadRow[]): LeadRow[] {
    this.writeLeads(leads);
    return leads;
  }

  update(leadId: string, nextLead: LeadRow): LeadRow[] {
    const nextLeads = this.readLeads().map((lead) => (lead.id === leadId ? nextLead : lead));
    this.writeLeads(nextLeads);
    return nextLeads;
  }
}
