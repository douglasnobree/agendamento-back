import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AppointmentRepository } from '../../../domain/repositoriesInterface/appointment.repository-interface';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { AvailableSlotRepository } from '../../../domain/repositoriesInterface/available-slot.repository-interface';
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
    private readonly appointmentRepository: AppointmentRepository,
    private readonly serviceRepository: any,
    private readonly availableSlotRepository: any,
  ) {
    // Garantir que todas as dependências foram injetadas corretamente
    if (!this.appointmentRepository) {
      throw new Error('AppointmentRepository não foi injetado');
    }
    if (!this.serviceRepository) {
      throw new Error('ServiceRepository não foi injetado');
    }
    if (!this.availableSlotRepository) {
      throw new Error('AvailableSlotRepository não foi injetado');
    }

    console.log(
      'CreateAppointmentUseCase - appointmentRepository:',
      this.appointmentRepository,
    );
    console.log(
      'CreateAppointmentUseCase - serviceRepository:',
      this.serviceRepository,
    );
    console.log(
      'CreateAppointmentUseCase - availableSlotRepository:',
      this.availableSlotRepository,
    );
  }

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

    // Buscar serviço para obter duração
    const service = await this.serviceRepository.findById(
      schema,
      data.serviceId,
    );
    if (!service) {
      throw new BadRequestException(
        `Serviço com ID ${data.serviceId} não encontrado`,
      );
    }

    // Verificar se o horário está disponível
    const scheduledAt = new Date(data.scheduledAt);
    const isAvailable = await this.availableSlotRepository.isSlotAvailable(
      schema,
      data.staffId,
      scheduledAt,
      service.duration,
    );

    if (!isAvailable) {
      throw new ConflictException('Horário não disponível para agendamento');
    }

    const appointment = Appointment.create(
      data.clientId,
      data.serviceId,
      data.staffId,
      scheduledAt,
      data.status,
    );
    await this.appointmentRepository.save(schema, appointment);
    return appointment;
  }
}
