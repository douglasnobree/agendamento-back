import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';

export type CreateStaffInput = {
  name: string;
  email: string;
  role: string;
  password: string;
};

@Injectable()
export class CreateStaffUseCase {
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(schema: string, input: CreateStaffInput): Promise<Staff> {
    if (!input.name || !input.email || !input.role) {
      throw new BadRequestException('Nome, email e cargo são obrigatórios');
    }
    if (input.password.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }
    if (!input.email.includes('@')) {
      throw new BadRequestException('Email inválido');
    }
    const hashedPassword = await this.staffRepository.hashPassword(input.password);
    if (!hashedPassword) {
      throw new BadRequestException('Erro ao criar a senha');
    }

    const staff = Staff.create(input.name, input.role, input.email, hashedPassword);
    await this.staffRepository.save(schema, staff);
    return staff;
  }
}
