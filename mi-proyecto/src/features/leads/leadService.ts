import { LeadRow } from "@/lib/crm-data";
import { LeadRepository } from "@/features/leads/leadRepository";

export type LeadDraft = Omit<LeadRow, "id" | "createdAt">;

const normalizeLeadDraft = (draft: LeadDraft): LeadDraft => ({
  ...draft,
  name: draft.name.trim(),
  product: draft.product.trim(),
  nextStep: draft.nextStep.trim(),
  email: draft.email?.trim() || undefined,
  phone: draft.phone?.trim() || undefined,
  notes: draft.notes?.trim() || undefined,
});

export const listLeads = (repository: LeadRepository): LeadRow[] => repository.list();

export const createLead = (repository: LeadRepository, draft: LeadDraft): LeadRow[] => {
  const nextLead: LeadRow = {
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...normalizeLeadDraft(draft),
  };

  const nextLeads = [nextLead, ...repository.list()];
  repository.saveAll(nextLeads);
  return nextLeads;
};

export const updateLead = (repository: LeadRepository, leadId: string, draft: LeadDraft): LeadRow[] => {
  const currentLeads = repository.list();
  const currentLead = currentLeads.find((lead) => lead.id === leadId);

  if (!currentLead) {
    return currentLeads;
  }

  const nextLead: LeadRow = {
    ...currentLead,
    ...normalizeLeadDraft(draft),
  };

  const nextLeads = currentLeads.map((lead) => (lead.id === leadId ? nextLead : lead));
  repository.saveAll(nextLeads);
  return nextLeads;
};
