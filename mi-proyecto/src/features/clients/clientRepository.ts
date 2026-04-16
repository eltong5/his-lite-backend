import { Client } from "./clientModel";

export interface ClientRepository {
  list(): Promise<Client[]>;
  getById(clientId: string): Promise<Client | undefined>;
  getBySourceLeadId(sourceLeadId: string): Promise<Client | undefined>;
  create(client: Client): Promise<Client[]>;
  update(clientId: string, client: Client): Promise<Client[]>;
  delete(clientId: string): Promise<Client[]>;
}
