import { Tenant } from '../entities/tenant.entity';

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findBySchema(schema: string): Promise<Tenant | null>;
  list(): Promise<Tenant[]>;
  save(tenant: Tenant): Promise<void>;
  remove(id: string): Promise<void>;
  update(tenant: Tenant): Promise<void>;
  createTenantWithSchema(input: {
    name: string;
    ownerEmail: string;
    planId: string;
  }): Promise<Tenant>;
}
