import { LeadRow } from "@/lib/crm-data";
import { buildClientFromLead, Client } from "@/features/clients/clientModel";
import { ClientRepository } from "@/features/clients/clientRepository";

export const buildClientsFromLeads = (leads: LeadRow[]): Client[] =>
  leads.filter((lead) => lead.stage === "Postventa").map(buildClientFromLead);

export type ClientDraft = Omit<Client, "id" | "createdAt">;

const normalizeClientDraft = (draft: ClientDraft): ClientDraft => ({
  ...draft,
  fullName: draft.fullName.trim(),
  product: draft.product.trim(),
  policyNumber: draft.policyNumber?.trim() || undefined,
  email: draft.email?.trim() || undefined,
  phone: draft.phone?.trim() || undefined,
  city: draft.city?.trim() || undefined,
  country: draft.country?.trim() || undefined,
  notes: draft.notes?.trim() || undefined,
});

export const listClients = (repository: ClientRepository): Client[] => repository.list();

export const createClient = (repository: ClientRepository, draft: ClientDraft): Client[] => {
  const normalizedDraft = normalizeClientDraft(draft);
  const nextClient: Client = {
    id: `client-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...normalizedDraft,
  };

  return repository.create(nextClient);
};

export const ensureClientFromLead = (repository: ClientRepository, lead: LeadRow): Client[] => {
  const existingClient = repository.getBySourceLeadId(lead.id);

  if (existingClient) {
    return repository.list();
  }

  return repository.create(buildClientFromLead(lead));
};

export const buildClientHealth = (clients: Client[]) => {
  const activeClients = clients.filter((client) => client.status === "Al dia").length;
  const followUpClients = clients.filter((client) => client.status === "Seguimiento").length;

  return {
    activePercentage: clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0,
    criticalRenewals: followUpClients,
  };
};
