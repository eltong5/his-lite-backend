import { AgencyRecord } from "@/features/agencies/agencyModel";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { SupabaseAgencyRepository } from "@/features/agencies/supabaseAgencyRepository";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export const listAgencies = (store: LocalStorageAgencyStore): AgencyRecord[] => store.list();
export const getCurrentAgency = (store: LocalStorageAgencyStore): AgencyRecord => store.getCurrent();

const supabaseAgencyRepository = new SupabaseAgencyRepository();

const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]) as Promise<T>;
};

export const loadAgencies = async (store: LocalStorageAgencyStore): Promise<AgencyRecord[]> => {
  if (!isSupabaseConfigured) {
    return store.list();
  }

  try {
    const agencies = await withTimeout(supabaseAgencyRepository.list(), 8000);
    if (agencies.length === 0) {
      return store.list();
    }

    const currentAgency = store.getCurrent();
    const syncedCurrentAgency = agencies.find((agency) => agency.id === currentAgency.id) ?? agencies[0];

    store.saveAll(agencies);
    store.saveCurrent(syncedCurrentAgency);

    return agencies;
  } catch (error) {
    console.error("Error loading agencies:", error);
    return store.list();
  }
};

export const saveAgency = async (store: LocalStorageAgencyStore, agency: AgencyRecord): Promise<AgencyRecord> => {
  const persistLocally = (nextAgency: AgencyRecord) => {
    const agencies = store.list();
    const nextAgencies = agencies.some((item) => item.id === nextAgency.id)
      ? agencies.map((item) => (item.id === nextAgency.id ? nextAgency : item))
      : [...agencies, nextAgency];

    store.saveAll(nextAgencies);
    store.saveCurrent(nextAgency);

    return nextAgency;
  };

  if (!isSupabaseConfigured) {
    return persistLocally(agency);
  }

  try {
    const savedAgency = await supabaseAgencyRepository.save(agency);
    return persistLocally(savedAgency);
  } catch {
    return persistLocally(agency);
  }
};
