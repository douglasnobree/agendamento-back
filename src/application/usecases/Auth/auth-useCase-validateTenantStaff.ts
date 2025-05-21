import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';
import { UseCase } from '../useCase';

export interface ValidateTenantStaffDto {
  tenantSchema: string;
  email: string;
  password: string;
}

export interface ValidateTenantStaffResult {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantSchema: string;
}

@Injectable()
export class ValidateTenantStaffUseCase
  implements UseCase<ValidateTenantStaffDto, ValidateTenantStaffResult>
{
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(
    input: ValidateTenantStaffDto,
  ): Promise<ValidateTenantStaffResult> {
    const { tenantSchema, email, password } = input;

    try {
      const staff = await this.staffRepository.findByEmail(tenantSchema, email);

      if (!staff) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      if (!staff.password) {
        throw new UnauthorizedException(
          'Senha não configurada para este usuário',
        );
      }

      const isPasswordValid = await this.staffRepository.verifyPassword(
        password,
        staff.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const tenant = await this.tenantRepository.findBySchema(tenantSchema);

      if (!tenant) {
        throw new UnauthorizedException('Tenant não encontrado');
      }

      return {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: 'staff',
        tenantId: tenant.id,
        tenantSchema: tenant.schema,
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }
}
