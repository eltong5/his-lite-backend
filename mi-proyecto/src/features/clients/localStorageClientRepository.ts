import { Client } from "./clientModel";
import { ClientRepository } from "./clientRepository";

const STORAGE_KEY = "crm-clients";

const defaultClients: Client[] = [
  {
    id: "client-1",
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
];

export class LocalStorageClientRepository implements ClientRepository {
  private readClients(): Client[] {
    if (typeof window === "undefined") {
      return defaultClients;
    }

    const storedClients = window.localStorage.getItem(STORAGE_KEY);
    if (!storedClients) {
      return defaultClients;
    }

    try {
      const parsedClients = JSON.parse(storedClients) as Client[];
      return parsedClients.length > 0 ? parsedClients : defaultClients;
    } catch {
      return defaultClients;
    }
  }

  private writeClients(clients: Client[]): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }

  list(): Client[] {
    return this.readClients();
  }

  getById(clientId: string): Client | undefined {
    return this.readClients().find((client) => client.id === clientId);
  }

  create(client: Client): Client[] {
    const nextClients = [client, ...this.readClients()];
    this.writeClients(nextClients);
    return nextClients;
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
