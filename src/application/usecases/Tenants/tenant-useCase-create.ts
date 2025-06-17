import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';
import { Tenant } from '../../../domain/entities/tenant.entity';

export type CreateTenantInput = {
  name: string;
  ownerEmail: string;
  planId: string;
};

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(input: CreateTenantInput): Promise<Tenant> {
    try {
      return await this.tenantRepository.createTenantWithSchema(input);
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao criar tenant: ' + error.message,
      );
    }
  }
}
