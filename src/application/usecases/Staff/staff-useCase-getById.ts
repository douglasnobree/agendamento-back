import { Injectable, Inject } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';
import { UseCase } from '../useCase';
import { SchemaIdDto } from '../../dtos/common.dto';

@Injectable()
export class GetStaffByIdUseCase implements UseCase<SchemaIdDto, Staff | null> {
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(input: SchemaIdDto): Promise<Staff | null> {
    const { schema, id } = input;
    return this.staffRepository.findById(schema, id);
  }
}
