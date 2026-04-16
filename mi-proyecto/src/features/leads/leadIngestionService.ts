import { LeadRepository } from "@/features/leads/leadRepository";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { LeadRow } from "@/lib/crm-data";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { SupabaseLeadRepository } from "@/features/leads/supabaseLeadRepository";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
const agencyStore = new LocalStorageAgencyStore();
const supabaseLeadRepository = new SupabaseLeadRepository();

export type ExternalLeadPayload = {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  country?: string;
  age?: number;
  product?: string;
  source?: LeadRow["source"];
  campaignName?: string;
  externalLeadId?: string;
  notes?: string;
};

export const ingestLead = async (
  repository: LeadRepository,
  payload: ExternalLeadPayload,
): Promise<{ leads: LeadRow[]; duplicate: boolean; createdLead?: LeadRow }> => {
  const name = payload.name?.trim();
  const phone = payload.phone?.trim();
  const product = payload.product?.trim();
  const externalLeadId = payload.externalLeadId?.trim();

  if (!name || !phone || !product) {
    throw new Error("El payload externo debe incluir nombre, telefono y producto.");
  }

  if (externalLeadId) {
    const existingLead = await repository.getByExternalLeadId(externalLeadId);

    if (existingLead) {
      return {
        leads: await repository.list(),
        duplicate: true,
        createdLead: existingLead,
      };
    }
  }

  const nextLead: LeadRow = {
    id: `lead-${Date.now()}`,
    agencyId: getCurrentAgency(agencyStore).id,
    createdAt: new Date().toISOString(),
    name,
    phone,
    product,
    source: payload.source ?? "Formulario",
    stage: "Nuevo lead",
    advisor: "Sin asignar",
    nextStep: "Contactar y calificar",
    email: payload.email?.trim() || undefined,
    city: payload.city?.trim() || undefined,
    country: payload.country?.trim() || undefined,
    age: payload.age,
    campaignName: payload.campaignName?.trim() || undefined,
    externalLeadId: externalLeadId || undefined,
    notes: payload.notes?.trim() || undefined,
  };

  const leads = await repository.create(nextLead);

  return {
    leads,
    duplicate: false,
    createdLead: nextLead,
  };
};

export const ingestLeadAsync = async (
  repository: LocalStorageLeadRepository,
  payload: ExternalLeadPayload,
): Promise<{ leads: LeadRow[]; duplicate: boolean; createdLead?: LeadRow }> => {
  const name = payload.name?.trim();
  const phone = payload.phone?.trim();
  const product = payload.product?.trim();
  const externalLeadId = payload.externalLeadId?.trim();
  const agencyId = getCurrentAgency(agencyStore).id;

  if (!name || !phone || !product) {
    throw new Error("El payload externo debe incluir nombre, telefono y producto.");
  }

  const checkDuplicateLocally = () => {
    if (!externalLeadId) {
      return undefined;
    }

    return repository.getByExternalLeadId(externalLeadId);
  };

  if (externalLeadId) {
    const localLead = checkDuplicateLocally();
    if (localLead) {
      return { leads: repository.list(), duplicate: true, createdLead: localLead };
    }

    if (isSupabaseConfigured) {
      try {
        const remoteLead = await supabaseLeadRepository.findByExternalLeadId(agencyId, externalLeadId);
        if (remoteLead) {
          repository.create(remoteLead);
          return { leads: repository.list(), duplicate: true, createdLead: remoteLead };
        }
      } catch {
        // fallback to local create below
      }
    }
  }

  const nextLead: LeadRow = {
    id: `lead-${Date.now()}`,
    agencyId,
    createdAt: new Date().toISOString(),
    name,
    phone,
    product,
    source: payload.source ?? "Formulario",
    stage: "Nuevo lead",
    advisor: "Sin asignar",
    nextStep: "Contactar y calificar",
    email: payload.email?.trim() || undefined,
    city: payload.city?.trim() || undefined,
    country: payload.country?.trim() || undefined,
    age: payload.age,
    campaignName: payload.campaignName?.trim() || undefined,
    externalLeadId: externalLeadId || undefined,
    notes: payload.notes?.trim() || undefined,
  };

  let leadToPersist = nextLead;
  if (isSupabaseConfigured) {
    try {
      leadToPersist = await supabaseLeadRepository.save(nextLead);
    } catch {
      leadToPersist = nextLead;
    }
  }

  const leads = repository.create(leadToPersist);

  return {
    leads,
    duplicate: false,
    createdLead: leadToPersist,
  };
};
