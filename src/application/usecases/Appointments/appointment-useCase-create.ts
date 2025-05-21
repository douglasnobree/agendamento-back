import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { UseCase } from '../useCase';
import { CreateAppointmentInputDto } from '../../dtos/Appointments/create-appointment.dto';

export interface CreateAppointmentUseCaseInputDto {
  schema: string;
  data: CreateAppointmentInputDto;
}

@Injectable()
export class CreateAppointmentUseCase
  implements UseCase<CreateAppointmentUseCaseInputDto, Appointment>
{
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: CreateAppointmentUseCaseInputDto): Promise<Appointment> {
    const { schema, data } = input;
    if (
      !data.clientId ||
      !data.serviceId ||
      !data.staffId ||
      !data.scheduledAt ||
      !data.status
    ) {
      throw new BadRequestException('Todos os campos são obrigatórios');
    }
    const appointment = Appointment.create(
      data.clientId,
      data.serviceId,
      data.staffId,
      new Date(data.scheduledAt),
      data.status,
    );
    await this.appointmentRepository.save(schema, appointment);
    return appointment;
  }
}
