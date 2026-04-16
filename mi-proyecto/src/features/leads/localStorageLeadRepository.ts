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

  async list(): Promise<LeadRow[]> {
    return this.readLeads();
  }

  async getById(leadId: string): Promise<LeadRow | undefined> {
    return this.readLeads().find((lead) => lead.id === leadId);
  }

  async getByExternalLeadId(externalLeadId: string): Promise<LeadRow | undefined> {
    return this.readLeads().find((lead) => lead.externalLeadId === externalLeadId);
  }

  async create(lead: LeadRow): Promise<LeadRow[]> {
    const nextLeads = [lead, ...this.readLeads()];
    this.writeLeads(nextLeads);
    return nextLeads;
  }

  async saveAll(leads: LeadRow[]): Promise<LeadRow[]> {
    this.writeLeads(leads);
    return leads;
  }

  async update(leadId: string, nextLead: LeadRow): Promise<LeadRow[]> {
    const nextLeads = this.readLeads().map((lead) => (lead.id === leadId ? nextLead : lead));
    this.writeLeads(nextLeads);
    return nextLeads;
  }
}
