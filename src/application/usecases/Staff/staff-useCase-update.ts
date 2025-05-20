import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';

export type UpdateStaffInput = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
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
    const updated = Staff.fromPersistence({
      ...existing.toPersistence(),
      ...input,
    });
    await this.staffRepository.update(schema, updated);
    return updated;
  }
}
