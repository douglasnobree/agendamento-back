import { Injectable, Inject } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';
import { UseCase } from '../useCase';
import { SchemaDto } from '../../dtos/common.dto';

@Injectable()
export class ListStaffUseCase implements UseCase<SchemaDto, Staff[]> {
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(input: SchemaDto): Promise<Staff[]> {
    return this.staffRepository.findAll(input.schema);
  }
}
