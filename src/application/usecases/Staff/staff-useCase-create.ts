import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { StaffRepository } from '../../../domain/repositoriesInterface/staff.repository-interface';
import { Staff } from '../../../domain/entities/staff.entity';

export type CreateStaffInput = {
  name: string;
  email: string;
  role: string;
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
    const staff = Staff.create(input.name, input.role, input.email);
    await this.staffRepository.save(schema, staff);
    return staff;
  }
}
