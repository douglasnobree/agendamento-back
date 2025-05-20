import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';

@Injectable()
export class RemoveTenantUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(id: string): Promise<void> {
    await this.tenantRepository.remove(id);
  }
}
