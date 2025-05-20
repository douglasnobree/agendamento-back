import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';
import { Tenant } from '../../../domain/entities/tenant.entity';

@Injectable()
export class ListTenantsUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(): Promise<Tenant[]> {
    return this.tenantRepository.list();
  }
}
