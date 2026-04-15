import { Client } from "./clientModel";

export interface ClientRepository {
  list(): Client[];
  getById(clientId: string): Client | undefined;
  create(client: Client): Client[];
  update(clientId: string, client: Client): Client[];
  delete(clientId: string): Client[];
}
