import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { AvailableSlotRepository } from '../../../domain/repositoriesInterface/available-slot.repository-interface';
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
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
    @Inject('AvailableSlotRepository')
    private readonly availableSlotRepository: AvailableSlotRepository,
  ) {}

  async execute(input: UpdateAppointmentUseCaseInputDto): Promise<Appointment> {
    const { schema, data } = input;
    const existing = await this.appointmentRepository.findById(schema, data.id);
    if (!existing) throw new NotFoundException('Agendamento não encontrado');

    // Verificar disponibilidade apenas se a data/hora ou o funcionário foram alterados

    if (data.scheduledAt || data.staffId) {
      // Determinar os valores finais para staffId e scheduledAt
      const newStaffId = data.staffId || existing.staffId;
      const newScheduledAt = data.scheduledAt
        ? new Date(data.scheduledAt)
        : existing.scheduledAt;

      // Obter o serviço para saber a duração
      const serviceId = data.serviceId || existing.serviceId;
      const service = await this.serviceRepository.findById(schema, serviceId);
      if (!service) {
        throw new BadRequestException(
          `Serviço com ID ${serviceId} não encontrado`,
        );
      }

      // Verificar se o horário está disponível
      const isAvailable = await this.availableSlotRepository.isSlotAvailable(
        schema,
        newStaffId,
        newScheduledAt,
        service.duration,
        data.id, // Passar o ID do próprio agendamento para excluí-lo da verificação
      );
      console.log(
        `Verificando disponibilidade para staffId: ${newStaffId}, scheduledAt: ${newScheduledAt}, duration: ${service.duration}`,
      );
      if (!isAvailable) {
        throw new ConflictException('Horário não disponível para agendamento');
      }
    }

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
