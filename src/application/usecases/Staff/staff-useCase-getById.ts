import { Injectable, Inject } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';

@Injectable()
export class GetStaffByIdUseCase {
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
  ) {}

  async execute(schema: string, id: string): Promise<Staff | null> {
    return this.staffRepository.findById(schema, id);
  }
}
