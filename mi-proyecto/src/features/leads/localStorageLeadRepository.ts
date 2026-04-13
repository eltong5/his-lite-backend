import { leadRows, LeadRow } from "@/lib/crm-data";
import { LeadRepository } from "@/features/leads/leadRepository";

const STORAGE_KEY = "crm-leads";

export class LocalStorageLeadRepository implements LeadRepository {
  list(): LeadRow[] {
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

  saveAll(leads: LeadRow[]): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }
}
