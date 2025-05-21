import { Injectable, Inject } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { UseCase } from '../useCase';
import { SchemaIdDto } from '../../dtos/common.dto';

@Injectable()
export class GetAppointmentByIdUseCase
  implements UseCase<SchemaIdDto, Appointment | null>
{
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: SchemaIdDto): Promise<Appointment | null> {
    const { schema, id } = input;
    return this.appointmentRepository.findById(schema, id);
  }
}
