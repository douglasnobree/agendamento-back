import { Client } from '../entities/client.entity';

export interface ClientRepository {
  findById(schema: string, id: string): Promise<Client | null>;
  findAll(schema: string): Promise<Client[]>;
  save(schema: string, client: Client): Promise<void>;
  remove(schema: string, id: string): Promise<void>;
  update(schema: string, client: Client): Promise<void>;
}
