import { LeadRow } from "@/lib/crm-data";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { buildClientFromLead, Client } from "@/features/clients/clientModel";
import { ClientRepository } from "@/features/clients/clientRepository";
import { LocalStorageClientRepository } from "@/features/clients/localStorageClientRepository";
import { SupabaseClientRepository } from "@/features/clients/supabaseClientRepository";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
const agencyStore = new LocalStorageAgencyStore();
const supabaseClientRepository = new SupabaseClientRepository();

const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]) as Promise<T>;
};

export const buildClientsFromLeads = (leads: LeadRow[]): Client[] =>
  leads.filter((lead) => lead.stage === "Postventa").map(buildClientFromLead);

export type ClientDraft = Omit<Client, "id" | "createdAt" | "agencyId"> & {
  agencyId?: string;
};

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

export const listClients = async (repository: ClientRepository): Promise<Client[]> => repository.list();

export const loadClients = async (repository: LocalStorageClientRepository): Promise<Client[]> => {
  if (!isSupabaseConfigured) {
    return repository.list();
  }

  try {
    const agencyId = getCurrentAgency(agencyStore).id;
    const clients = await withTimeout(supabaseClientRepository.listByAgency(agencyId), 8000);
    if (clients.length === 0) {
      return repository.list();
    }

    repository.saveAll(clients);
    return clients;
  } catch (error) {
    console.error("Error loading clients:", error);
    return repository.list();
  }
};

export const createClient = async (repository: ClientRepository, draft: ClientDraft): Promise<Client[]> => {
  const normalizedDraft = normalizeClientDraft(draft);
  const nextClient: Client = {
    id: `client-${Date.now()}`,
    agencyId: draft.agencyId || getCurrentAgency(agencyStore).id,
    createdAt: new Date().toISOString(),
    ...normalizedDraft,
  };

  return repository.create(nextClient);
};

export const createClientAsync = async (
  repository: LocalStorageClientRepository,
  draft: ClientDraft,
): Promise<Client[]> => {
  const normalizedDraft = normalizeClientDraft(draft);
  const nextClient: Client = {
    id: `client-${Date.now()}`,
    agencyId: draft.agencyId || getCurrentAgency(agencyStore).id,
    createdAt: new Date().toISOString(),
    ...normalizedDraft,
  };

  const persistLocally = (client: Client) => repository.create(client);

  if (!isSupabaseConfigured) {
    return persistLocally(nextClient);
  }

  try {
    const savedClient = await supabaseClientRepository.save(nextClient);
    return persistLocally(savedClient);
  } catch {
    return persistLocally(nextClient);
  }
};

export const ensureClientFromLead = async (repository: ClientRepository, lead: LeadRow): Promise<Client[]> => {
  const existingClient = await repository.getBySourceLeadId(lead.id);

  if (existingClient) {
    return repository.list();
  }

  return repository.create(buildClientFromLead(lead));
};

export const ensureClientFromLeadAsync = async (
  repository: LocalStorageClientRepository,
  lead: LeadRow,
): Promise<Client[]> => {
  const existingClient = repository.getBySourceLeadId(lead.id);

  if (existingClient) {
    return repository.list();
  }

  const nextClient = buildClientFromLead(lead);
  const persistLocally = (client: Client) => repository.create(client);

  if (!isSupabaseConfigured) {
    return persistLocally(nextClient);
  }

  try {
    const savedClient = await supabaseClientRepository.save(nextClient);
    return persistLocally(savedClient);
  } catch {
    return persistLocally(nextClient);
  }
};

const monthMap: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};

const parseRenewalDate = (value: string): Date | null => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const isoDate = new Date(normalizedValue);
  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const match = normalizedValue.toLowerCase().match(/^(\d{1,2})\s+([a-z]{3})\s+(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const monthIndex = monthMap[month];

  if (monthIndex === undefined) {
    return null;
  }

  return new Date(Number(year), monthIndex, Number(day));
};

const differenceInDays = (renewalDate: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextRenewal = new Date(renewalDate);
  nextRenewal.setHours(0, 0, 0, 0);

  return Math.ceil((nextRenewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const buildUpcomingRenewals = (clients: Client[]) =>
  clients
    .map((client) => {
      const renewalDate = parseRenewalDate(client.renewalDate);
      const daysRemaining = renewalDate ? differenceInDays(renewalDate) : Number.POSITIVE_INFINITY;

      return {
        client,
        daysRemaining,
      };
    })
    .filter((item) => Number.isFinite(item.daysRemaining))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5)
    .map(({ client, daysRemaining }) => ({
      id: client.id,
      clientName: client.fullName,
      product: client.product,
      advisor: client.advisor,
      renewalDate: client.renewalDate,
      daysRemaining,
      priority:
        daysRemaining <= 7 ? "Alta" : daysRemaining <= 30 ? "Media" : "Baja",
    }));

export const buildClientHealth = (clients: Client[]) => {
  const activeClients = clients.filter((client) => client.status === "Al dia").length;
  const followUpClients = buildUpcomingRenewals(clients).filter((item) => item.daysRemaining <= 30).length;

  return {
    activePercentage: clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0,
    criticalRenewals: followUpClients,
  };
};
