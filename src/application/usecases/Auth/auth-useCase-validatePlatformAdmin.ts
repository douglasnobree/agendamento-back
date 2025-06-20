import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PlatformAdminRepository } from '../../../domain/repositoriesInterface/platform-admin.repository-interface';
import { UseCase } from '../useCase';
import * as bcrypt from 'bcrypt';


export interface ValidatePlatformAdminDto {
  email: string;
  password: string;
}

export interface ValidatePlatformAdminResult {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class ValidatePlatformAdminUseCase
  implements UseCase<ValidatePlatformAdminDto, ValidatePlatformAdminResult>
{
  constructor(
    @Inject('PlatformAdminRepository')
    private readonly platformAdminRepository: PlatformAdminRepository,
  ) {}

  async execute(
    input: ValidatePlatformAdminDto,
  ): Promise<ValidatePlatformAdminResult> {
    const { email, password } = input;
    console.log('Validando admin com email:', email);
    const admin = await this.platformAdminRepository.findByEmail(email);
    console.log('Admin encontrado:', admin);
    if (!admin) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = admin.password
      ? await this.platformAdminRepository.verifyPassword(
          password,
          admin.password,
        )
      : true; // Para compatibilidade com o código atual que não verifica a senha
    console.log('Senha válida:', isPasswordValid);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    console.log('Senha válida para admin:', email);
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
    };
  }
}
