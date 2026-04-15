import { Client } from "./clientModel";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { ClientRepository } from "./clientRepository";

const STORAGE_KEY = "crm-clients";
const agencyStore = new LocalStorageAgencyStore();

const defaultClients: Client[] = [
  {
    id: "client-1",
    agencyId: "agency-demo-001",
    fullName: "Carlos Ruiz",
    product: "Seguro Auto Full",
    renewalDate: "15 Abr 2026",
    status: "Al dia",
    advisor: "David P",
    sourceLeadId: "lead-1",
    createdAt: "2026-04-10T10:00:00.000Z",
    phone: "+57 300 111 2233",
    email: "carlos@example.com",
  },
  {
    id: "client-2",
    agencyId: "agency-demo-001",
    fullName: "Ana Martinez",
    product: "Seguro Vida Plus",
    renewalDate: "20 May 2026",
    status: "Seguimiento",
    advisor: "Laura M",
    sourceLeadId: "lead-2",
    createdAt: "2026-04-11T15:30:00.000Z",
    phone: "+57 301 444 5566",
    notes: "Cliente con seguimiento de renovacion pendiente.",
  },
  {
    id: "client-3",
    agencyId: "agency-demo-002",
    fullName: "Grupo Montana",
    product: "Poliza Empresarial",
    renewalDate: "30 Abr 2026",
    status: "Pendiente",
    advisor: "Sin asignar",
    sourceLeadId: "lead-grupo-montana",
    createdAt: "2026-04-15T16:30:00.000Z",
    city: "Bucaramanga",
    country: "Colombia",
    notes: "Cliente demo de la segunda agencia.",
  },
];

export class LocalStorageClientRepository implements ClientRepository {
  private getCurrentAgencyId() {
    return getCurrentAgency(agencyStore).id;
  }

  private readClients(): Client[] {
    const currentAgencyId = this.getCurrentAgencyId();

    if (typeof window === "undefined") {
      return defaultClients.filter((client) => client.agencyId === currentAgencyId);
    }

    const storedClients = window.localStorage.getItem(STORAGE_KEY);
    if (!storedClients) {
      return defaultClients.filter((client) => client.agencyId === currentAgencyId);
    }

    try {
      const parsedClients = JSON.parse(storedClients) as Client[];
      const agencyClients = parsedClients.filter((client) => client.agencyId === currentAgencyId);
      return agencyClients.length > 0 ? agencyClients : defaultClients.filter((client) => client.agencyId === currentAgencyId);
    } catch {
      return defaultClients.filter((client) => client.agencyId === currentAgencyId);
    }
  }

  private writeClients(clients: Client[]): void {
    if (typeof window === "undefined") {
      return;
    }

    const storedClients = window.localStorage.getItem(STORAGE_KEY);
    const allClients = storedClients ? (JSON.parse(storedClients) as Client[]) : [];
    const currentAgencyId = this.getCurrentAgencyId();
    const otherAgencyClients = allClients.filter((client) => client.agencyId !== currentAgencyId);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherAgencyClients, ...clients]));
  }

  list(): Client[] {
    return this.readClients();
  }

  getById(clientId: string): Client | undefined {
    return this.readClients().find((client) => client.id === clientId);
  }

  getBySourceLeadId(sourceLeadId: string): Client | undefined {
    return this.readClients().find((client) => client.sourceLeadId === sourceLeadId);
  }

  create(client: Client): Client[] {
    const nextClients = [client, ...this.readClients()];
    this.writeClients(nextClients);
    return nextClients;
  }

  saveAll(clients: Client[]): Client[] {
    this.writeClients(clients);
    return clients;
  }

  update(clientId: string, nextClient: Client): Client[] {
    const nextClients = this.readClients().map((client) => (client.id === clientId ? nextClient : client));
    this.writeClients(nextClients);
    return nextClients;
  }

  delete(clientId: string): Client[] {
    const nextClients = this.readClients().filter((client) => client.id !== clientId);
    this.writeClients(nextClients);
    return nextClients;
  }
}
