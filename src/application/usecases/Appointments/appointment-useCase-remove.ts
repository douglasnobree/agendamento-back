import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { UseCase } from '../useCase';
import { SchemaIdDto } from '../../dtos/common.dto';

@Injectable()
export class RemoveAppointmentUseCase implements UseCase<SchemaIdDto, void> {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: SchemaIdDto): Promise<void> {
    const { schema, id } = input;
    const existing = await this.appointmentRepository.findById(schema, id);
    if (!existing) throw new NotFoundException('Agendamento não encontrado');
    await this.appointmentRepository.remove(schema, id);
  }
}
