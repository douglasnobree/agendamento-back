import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { UseCase } from '../useCase';
import { UpdateAppointmentInputDto } from 'src/application/dtos/Appointments/update-appointment.dto'; 


export interface UpdateAppointmentUseCaseInputDto {
  schema: string;
  data: UpdateAppointmentInputDto;
}

@Injectable()
export class UpdateAppointmentUseCase
  implements UseCase<UpdateAppointmentUseCaseInputDto, Appointment>
{
  constructor(
    @Inject('AppointmentRepository')
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: UpdateAppointmentUseCaseInputDto): Promise<Appointment> {
    const { schema, data } = input;
    const existing = await this.appointmentRepository.findById(schema, data.id);
    if (!existing) throw new NotFoundException('Agendamento não encontrado');
    const updated = Appointment.fromPersistence({
      ...existing.toPersistence(),
      ...data,
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt)
        : existing.scheduledAt,
    });
    await this.appointmentRepository.update(schema, updated);
    return updated;
  }
}
