import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';

@Injectable()
export class RemoveStaffUseCase {
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(schema: string, id: string): Promise<void> {
    const existing = await this.staffRepository.findById(schema, id);
    if (!existing)
      throw new NotFoundException('Membro da equipe não encontrado');
    await this.staffRepository.remove(schema, id);
  }
}
