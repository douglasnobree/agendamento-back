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
      !data.scheduledDate ||
      !data.scheduledTime ||
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

    // Criar objeto Date a partir da data e hora fornecidas
    const [year, month, day] = data.scheduledDate.split('-').map(Number);
    const [hours, minutes] = data.scheduledTime.split(':').map(Number);
    
    // Mês em JavaScript é 0-indexed (0-11)
    const scheduledAt = new Date(year, month - 1, day, hours, minutes, 0, 0);

    console.log(`Data formatada: ${scheduledAt.toISOString()}`);
    
    // Verificar se o horário está disponível
    const isAvailable = await this.availableSlotRepository.isSlotAvailable(
      schema,
      data.staffId,
      scheduledAt,
      service.duration,
    );
    console.log(
      `Verificando disponibilidade para staffId: ${data.staffId}, scheduledAt: ${scheduledAt}, duration: ${service.duration}`,
    );
    console.log(isAvailable);
    if (!isAvailable) {
      throw new ConflictException('Horário não disponível para agendamento');
    }
    console.log(
      `Horário disponível para agendamento: staffId: ${data.staffId}, scheduledAt: ${scheduledAt}, duration: ${service.duration}`,
    );

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
