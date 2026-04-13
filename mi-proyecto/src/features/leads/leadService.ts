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
export const getLeadById = (repository: LeadRepository, leadId: string): LeadRow | undefined => repository.getById(leadId);

export const createLead = (repository: LeadRepository, draft: LeadDraft): LeadRow[] => {
  const nextLead: LeadRow = {
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...normalizeLeadDraft(draft),
  };

  return repository.create(nextLead);
};

export const updateLead = (repository: LeadRepository, leadId: string, draft: LeadDraft): LeadRow[] => {
  const currentLeads = repository.list();
  const currentLead = repository.getById(leadId);

  if (!currentLead) {
    return currentLeads;
  }

  const nextLead: LeadRow = {
    ...currentLead,
    ...normalizeLeadDraft(draft),
  };

  return repository.update(leadId, nextLead);
};

export const moveLeadToStage = (repository: LeadRepository, leadId: string, stage: LeadRow["stage"]): LeadRow[] => {
  const currentLead = repository.getById(leadId);

  if (!currentLead) {
    return repository.list();
  }

  return repository.update(leadId, {
    ...currentLead,
    stage,
  });
};
