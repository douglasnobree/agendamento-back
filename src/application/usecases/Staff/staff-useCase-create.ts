import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';
import { UseCase } from '../useCase';
import { CreateStaffInputDto } from '../../dtos/Staffs/staff.dto';

export interface CreateStaffUseCaseInputDto {
  schema: string;
  data: CreateStaffInputDto;
}

@Injectable()
export class CreateStaffUseCase
  implements UseCase<CreateStaffUseCaseInputDto, Staff>
{
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(input: CreateStaffUseCaseInputDto): Promise<Staff> {
    const { schema, data } = input;
    if (!data.name || !data.email || !data.role) {
      throw new BadRequestException('Nome, email e cargo são obrigatórios');
    }
    if (data.password.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }
    if (!data.email.includes('@')) {
      throw new BadRequestException('Email inválido');
    }
    const hashedPassword = await this.staffRepository.hashPassword(
      data.password,
    );
    if (!hashedPassword) {
      throw new BadRequestException('Erro ao criar a senha');
    }
    const staff = Staff.create(
      data.name,
      data.role,
      data.email,
      hashedPassword,
    );
    await this.staffRepository.save(schema, staff);
    return staff;
  }
}
