import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';
import { UseCase } from '../useCase';
import { UpdateStaffInputDto } from 'src/application/dtos/Staffs/update-staff.dto'; 

export interface UpdateStaffUseCaseInputDto {
  schema: string;
  data: UpdateStaffInputDto;
}

@Injectable()
export class UpdateStaffUseCase
  implements UseCase<UpdateStaffUseCaseInputDto, Staff>
{
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(input: UpdateStaffUseCaseInputDto): Promise<Staff> {
    const { schema, data } = input;
    const existing = await this.staffRepository.findById(schema, data.id);
    if (!existing)
      throw new NotFoundException('Membro da equipe não encontrado');

    const hashedPassword = data.password
      ? await this.staffRepository.hashPassword(data.password)
      : existing.password;

    const updated = Staff.fromPersistence({
      ...existing.toPersistence(),
      ...data,
      password: hashedPassword,
    });

    await this.staffRepository.update(schema, updated);
    return updated;
  }
}
