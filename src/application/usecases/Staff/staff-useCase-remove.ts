import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { UseCase } from '../useCase';
import { SchemaIdDto } from '../../dtos/common.dto';

@Injectable()
export class RemoveStaffUseCase implements UseCase<SchemaIdDto, void> {
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(input: SchemaIdDto): Promise<void> {
    const { schema, id } = input;
    const existing = await this.staffRepository.findById(schema, id);
    if (!existing)
      throw new NotFoundException('Membro da equipe não encontrado');
    await this.staffRepository.remove(schema, id);
  }
}
