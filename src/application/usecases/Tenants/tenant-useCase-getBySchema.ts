import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { UseCase } from '../useCase';

@Injectable()
export class GetTenantBySchemaUseCase implements UseCase<string, Tenant> {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(schema: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySchema(schema);
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }
    return tenant;
  }
}
