import { AdvisorRecord } from "@/features/advisors/advisorModel";
import { LocalStorageAdvisorStore } from "@/features/advisors/localStorageAdvisorStore";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { SupabaseAdvisorRepository } from "@/features/advisors/supabaseAdvisorRepository";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export type AdvisorDraft = Omit<AdvisorRecord, "id">;

export const listAdvisors = (store: LocalStorageAdvisorStore): AdvisorRecord[] => store.list();

export const listActiveAdvisorNames = (store: LocalStorageAdvisorStore): string[] => {
  const advisorNames = store
    .list()
    .filter((advisor) => advisor.active)
    .map((advisor) => advisor.fullName);

  return [...advisorNames, "Sin asignar"];
};

const agencyStore = new LocalStorageAgencyStore();
const supabaseAdvisorRepository = new SupabaseAdvisorRepository();

export const loadAdvisors = async (store: LocalStorageAdvisorStore): Promise<AdvisorRecord[]> => {
  if (!isSupabaseConfigured) {
    return store.list();
  }

  try {
    const currentAgencyId = getCurrentAgency(agencyStore).id;
    const advisors = await supabaseAdvisorRepository.listByAgency(currentAgencyId);
    if (advisors.length === 0) {
      return store.list();
    }

    store.saveAll(advisors);
    return advisors;
  } catch {
    return store.list();
  }
};

export const createAdvisorAsync = async (
  store: LocalStorageAdvisorStore,
  draft: AdvisorDraft,
): Promise<AdvisorRecord[]> => {
  const advisor: AdvisorRecord = {
    id: `advisor-${Date.now()}`,
    fullName: draft.fullName.trim(),
    email: draft.email.trim(),
    phone: draft.phone?.trim() || undefined,
    role: draft.role,
    agencyId: draft.agencyId || getCurrentAgency(agencyStore).id,
    active: draft.active,
  };

  const persistLocally = (adv: AdvisorRecord) => store.create(adv);

  if (!isSupabaseConfigured) {
    return persistLocally(advisor);
  }

  try {
    const savedAdvisor = await supabaseAdvisorRepository.save(advisor);
    return persistLocally(savedAdvisor);
  } catch {
    return persistLocally(advisor);
  }
};
