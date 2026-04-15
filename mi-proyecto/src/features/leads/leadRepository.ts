import { LeadRow } from "@/lib/crm-data";

export interface LeadRepository {
  list(): LeadRow[];
  getById(leadId: string): LeadRow | undefined;
  getByExternalLeadId(externalLeadId: string): LeadRow | undefined;
  create(lead: LeadRow): LeadRow[];
  update(leadId: string, lead: LeadRow): LeadRow[];
}
