import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { OwnerRepository } from '../../../domain/repositoriesInterface/owner.repository-interface';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';
import { UseCase } from '../useCase';
import * as bcrypt from 'bcrypt';

export interface ValidateTenantOwnerDto {
  tenantSchema: string;
  email: string;
  password: string;
}

export interface ValidateTenantOwnerResult {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantSchema: string;
}

@Injectable()
export class ValidateTenantOwnerUseCase
  implements UseCase<ValidateTenantOwnerDto, ValidateTenantOwnerResult>
{
  constructor(
    @Inject('OwnerRepository')
    private readonly ownerRepository: OwnerRepository,
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(
    input: ValidateTenantOwnerDto,
  ): Promise<ValidateTenantOwnerResult> {
    const { tenantSchema, email, password } = input;

    try {
      const owner = await this.ownerRepository.findByEmail(tenantSchema, email);

      if (!owner) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(password, owner.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const tenant = await this.tenantRepository.findBySchema(tenantSchema);

      if (!tenant) {
        throw new UnauthorizedException('Tenant não encontrado');
      }

      return {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        role: 'owner',
        tenantId: tenant.id,
        tenantSchema: tenant.schema,
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }
}
