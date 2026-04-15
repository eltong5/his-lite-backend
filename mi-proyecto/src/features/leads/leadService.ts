import { LeadRow } from "@/lib/crm-data";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { LeadRepository } from "@/features/leads/leadRepository";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { SupabaseLeadRepository } from "@/features/leads/supabaseLeadRepository";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export type LeadDraft = Omit<LeadRow, "id" | "createdAt" | "agencyId"> & {
  agencyId?: string;
};
const agencyStore = new LocalStorageAgencyStore();
const supabaseLeadRepository = new SupabaseLeadRepository();

const normalizeLeadDraft = (draft: LeadDraft): LeadDraft => ({
  ...draft,
  name: draft.name.trim(),
  product: draft.product.trim(),
  nextStep: draft.nextStep.trim(),
  email: draft.email?.trim() || undefined,
  phone: draft.phone?.trim() || undefined,
  city: draft.city?.trim() || undefined,
  country: draft.country?.trim() || undefined,
  age: typeof draft.age === "number" && Number.isFinite(draft.age) ? draft.age : undefined,
  campaignName: draft.campaignName?.trim() || undefined,
  externalLeadId: draft.externalLeadId?.trim() || undefined,
  notes: draft.notes?.trim() || undefined,
});

export const listLeads = (repository: LeadRepository): LeadRow[] => repository.list();
export const getLeadById = (repository: LeadRepository, leadId: string): LeadRow | undefined => repository.getById(leadId);

export const loadLeads = async (repository: LocalStorageLeadRepository): Promise<LeadRow[]> => {
  if (!isSupabaseConfigured) {
    return repository.list();
  }

  try {
    const agencyId = getCurrentAgency(agencyStore).id;
    const leads = await supabaseLeadRepository.listByAgency(agencyId);
    if (leads.length === 0) {
      return repository.list();
    }

    repository.saveAll(leads);
    return leads;
  } catch {
    return repository.list();
  }
};

export const createLead = (repository: LeadRepository, draft: LeadDraft): LeadRow[] => {
  const nextLead: LeadRow = {
    id: `lead-${Date.now()}`,
    agencyId: draft.agencyId || getCurrentAgency(agencyStore).id,
    createdAt: new Date().toISOString(),
    ...normalizeLeadDraft(draft),
  };

  return repository.create(nextLead);
};

export const createLeadAsync = async (repository: LocalStorageLeadRepository, draft: LeadDraft): Promise<LeadRow[]> => {
  const nextLead: LeadRow = {
    id: `lead-${Date.now()}`,
    agencyId: draft.agencyId || getCurrentAgency(agencyStore).id,
    createdAt: new Date().toISOString(),
    ...normalizeLeadDraft(draft),
  };

  const persistLocally = (lead: LeadRow) => repository.create(lead);

  if (!isSupabaseConfigured) {
    return persistLocally(nextLead);
  }

  try {
    const savedLead = await supabaseLeadRepository.save(nextLead);
    return persistLocally(savedLead);
  } catch {
    return persistLocally(nextLead);
  }
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

export const updateLeadAsync = async (
  repository: LocalStorageLeadRepository,
  leadId: string,
  draft: LeadDraft,
): Promise<LeadRow[]> => {
  const currentLeads = repository.list();
  const currentLead = repository.getById(leadId);

  if (!currentLead) {
    return currentLeads;
  }

  const nextLead: LeadRow = {
    ...currentLead,
    ...normalizeLeadDraft(draft),
  };

  const persistLocally = (lead: LeadRow) => repository.update(leadId, lead);

  if (!isSupabaseConfigured) {
    return persistLocally(nextLead);
  }

  try {
    const savedLead = await supabaseLeadRepository.save(nextLead);
    return persistLocally(savedLead);
  } catch {
    return persistLocally(nextLead);
  }
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

export const moveLeadToStageAsync = async (
  repository: LocalStorageLeadRepository,
  leadId: string,
  stage: LeadRow["stage"],
): Promise<LeadRow[]> => {
  const currentLead = repository.getById(leadId);

  if (!currentLead) {
    return repository.list();
  }

  const nextLead: LeadRow = {
    ...currentLead,
    stage,
  };

  const persistLocally = (lead: LeadRow) => repository.update(leadId, lead);

  if (!isSupabaseConfigured) {
    return persistLocally(nextLead);
  }

  try {
    const savedLead = await supabaseLeadRepository.save(nextLead);
    return persistLocally(savedLead);
  } catch {
    return persistLocally(nextLead);
  }
};
