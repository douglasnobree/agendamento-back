import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';

export type UpdateStaffInput = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  password?: string;
};

@Injectable()
export class UpdateStaffUseCase {
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(schema: string, input: UpdateStaffInput): Promise<Staff> {
    const existing = await this.staffRepository.findById(schema, input.id);
    if (!existing)
      throw new NotFoundException('Membro da equipe não encontrado');

    const hashedPassword = input.password
      ? await this.staffRepository.hashPassword(input.password)
      : existing.password;

    const updated = Staff.fromPersistence({
      ...existing.toPersistence(),
      ...input,
      password: hashedPassword,
    });
    
    await this.staffRepository.update(schema, updated);
    return updated;
  }
}
