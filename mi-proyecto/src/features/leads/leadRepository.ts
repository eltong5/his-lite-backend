import { LeadRow } from "@/lib/crm-data";

export interface LeadRepository {
  list(): LeadRow[];
  saveAll(leads: LeadRow[]): void;
}
