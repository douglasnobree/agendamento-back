import { Service } from '../entities/service.entity';

export interface ServiceRepository {
  findById(schema: string, id: string): Promise<Service | null>;
  findAll(schema: string): Promise<Service[]>;
  save(schema: string, service: Service): Promise<void>;
  remove(schema: string, id: string): Promise<void>;
  update(schema: string, service: Service): Promise<void>;
}
