import { Injectable, Inject } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';

@Injectable()
export class ListAppointmentsUseCase {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(schema: string): Promise<Appointment[]> {
    return this.appointmentRepository.findAll(schema);
  }
}
