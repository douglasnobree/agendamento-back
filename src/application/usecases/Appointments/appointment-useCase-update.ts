import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';

export type UpdateAppointmentInput = {
  id: string;
  clientId?: string;
  serviceId?: string;
  staffId?: string;
  scheduledAt?: Date;
  status?: string;
};

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(
    schema: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment> {
    const existing = await this.appointmentRepository.findById(
      schema,
      input.id,
    );
    if (!existing) throw new NotFoundException('Agendamento não encontrado');
    const updated = Appointment.fromPersistence({
      ...existing.toPersistence(),
      ...input,
      scheduledAt: input.scheduledAt
        ? new Date(input.scheduledAt)
        : existing.scheduledAt,
    });
    await this.appointmentRepository.update(schema, updated);
    return updated;
  }
}
