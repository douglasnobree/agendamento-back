import { Inject, Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';

@Injectable()
export class GetAppointmentByClientIdUseCase {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(schema: string, clientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findAppointmentsByClientId(
      schema,
      clientId,
    );
  }
}
