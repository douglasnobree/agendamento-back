import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';

export type CreateAppointmentInput = {
  clientId: string;
  serviceId: string;
  staffId: string;
  scheduledAt: Date;
  status: string;
};

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(
    schema: string,
    input: CreateAppointmentInput,
  ): Promise<Appointment> {
    if (
      !input.clientId ||
      !input.serviceId ||
      !input.staffId ||
      !input.scheduledAt ||
      !input.status
    ) {
      throw new BadRequestException('Todos os campos são obrigatórios');
    }
    const appointment = Appointment.create(
      input.clientId,
      input.serviceId,
      input.staffId,
      new Date(input.scheduledAt),
      input.status,
    );
    await this.appointmentRepository.save(schema, appointment);
    return appointment;
  }
}
