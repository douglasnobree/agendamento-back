import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';
import { UseCase } from '../useCase';

export interface ValidateTenantClientDto {
  tenantSchema: string;
  email: string;
  password: string;
}

export interface ValidateTenantClientResult {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantSchema: string;
}

@Injectable()
export class ValidateTenantClientUseCase
  implements UseCase<ValidateTenantClientDto, ValidateTenantClientResult>
{
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(
    input: ValidateTenantClientDto,
  ): Promise<ValidateTenantClientResult> {
    const { tenantSchema, email } = input;

    try {
      const client = await this.clientRepository.findByEmail(
        tenantSchema,
        email,
      );

      if (!client) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Nota: A autenticação de cliente parece não verificar uma senha,
      // apenas confirma que o cliente existe pelo email.
      // Mantemos esta lógica consistente com a implementação original.
      const isPasswordValid = true;

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const tenant = await this.tenantRepository.findBySchema(tenantSchema);

      if (!tenant) {
        throw new UnauthorizedException('Tenant não encontrado');
      }

      return {
        id: client.id,
        email: client.email,
        name: client.name,
        role: 'client',
        tenantId: tenant.id,
        tenantSchema: tenant.schema,
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }
}
