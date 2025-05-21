import { Injectable, Inject } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { UseCase } from '../useCase';
import { SchemaDto } from '../../dtos/common.dto';

@Injectable()
export class ListAppointmentsUseCase
  implements UseCase<SchemaDto, Appointment[]>
{
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: SchemaDto): Promise<Appointment[]> {
    return this.appointmentRepository.findAll(input.schema);
  }
}
