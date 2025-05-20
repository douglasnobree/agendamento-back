import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';
import { Tenant } from '../../../domain/entities/tenant.entity';

@Injectable()
export class GetTenantByIdUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findById(id);
  }
}
