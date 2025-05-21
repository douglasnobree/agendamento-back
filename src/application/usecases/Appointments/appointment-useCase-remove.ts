import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';

@Injectable()
export class RemoveAppointmentUseCase {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(schema: string, id: string): Promise<void> {
    const existing = await this.appointmentRepository.findById(schema, id);
    if (!existing) throw new NotFoundException('Agendamento não encontrado');
    await this.appointmentRepository.remove(schema, id);
  }
}
