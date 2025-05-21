import { Injectable, Inject } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';

@Injectable()
export class GetAppointmentByIdUseCase {
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(schema: string, id: string): Promise<Appointment | null> {
    return this.appointmentRepository.findById(schema, id);
  }
}
