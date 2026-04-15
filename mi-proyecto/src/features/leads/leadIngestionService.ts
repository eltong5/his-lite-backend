import { LeadRepository } from "@/features/leads/leadRepository";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { LeadRow } from "@/lib/crm-data";
const agencyStore = new LocalStorageAgencyStore();

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

export const ingestLead = (
  repository: LeadRepository,
  payload: ExternalLeadPayload,
): { leads: LeadRow[]; duplicate: boolean; createdLead?: LeadRow } => {
  const name = payload.name?.trim();
  const phone = payload.phone?.trim();
  const product = payload.product?.trim();
  const externalLeadId = payload.externalLeadId?.trim();

  if (!name || !phone || !product) {
    throw new Error("El payload externo debe incluir nombre, telefono y producto.");
  }

  if (externalLeadId) {
    const existingLead = repository.getByExternalLeadId(externalLeadId);

    if (existingLead) {
      return {
        leads: repository.list(),
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

  const leads = repository.create(nextLead);

  return {
    leads,
    duplicate: false,
    createdLead: nextLead,
  };
};
