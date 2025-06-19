import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AvailableSlot } from '../../../../domain/entities/available-slot.entity';
import { AvailableSlotRepository } from '../../../../domain/repositoriesInterface/available-slot.repository-interface';

@Injectable()
export class AvailableSlotRepositoryPrisma implements AvailableSlotRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async setSchema(schema: string) {
    await this.prisma.$executeRawUnsafe(`SET search_path TO "${schema}"`);
  }

  async findById(schema: string, id: string): Promise<AvailableSlot | null> {
    await this.setSchema(schema);
    const data = await this.prisma.availableSlot.findUnique({ where: { id } });
    if (!data) return null;
    return AvailableSlot.fromPersistence(data);
  }

  async findByStaffId(
    schema: string,
    staffId: string,
  ): Promise<AvailableSlot[]> {
    await this.setSchema(schema);
    const data = await this.prisma.availableSlot.findMany({
      where: { staffId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return data.map(AvailableSlot.fromPersistence);
  }

  async findAvailableSlotsByDateRange(
    schema: string,
    staffId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailableSlot[]> {
    await this.setSchema(schema);

    // Ajustar para considerar slots recorrentes e específicos
    const startDayOfWeek = startDate.getDay();
    const endDayOfWeek = endDate.getDay();

    const recurringSlots = await this.prisma.availableSlot.findMany({
      where: {
        staffId,
        isRecurring: true,
        dayOfWeek: {
          // Considerar dias da semana dentro do intervalo
          gte: startDayOfWeek,
          lte: endDayOfWeek,
        },
      },
    });

    const specificSlots = await this.prisma.availableSlot.findMany({
      where: {
        staffId,
        isRecurring: false,
        specificDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return [...recurringSlots, ...specificSlots].map(
      AvailableSlot.fromPersistence,
    );
  }

  async save(schema: string, availableSlot: AvailableSlot): Promise<void> {
    await this.setSchema(schema);
    const props = availableSlot.toPersistence();
    await this.prisma.availableSlot.create({ data: props });
  }

  async saveMany(
    schema: string,
    availableSlots: AvailableSlot[],
  ): Promise<void> {
    await this.setSchema(schema);
    const data = availableSlots.map((slot) => slot.toPersistence());

    await this.prisma.$transaction(
      data.map((props) => this.prisma.availableSlot.create({ data: props })),
    );
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.setSchema(schema);
    await this.prisma.availableSlot.delete({ where: { id } });
  }

  async update(schema: string, availableSlot: AvailableSlot): Promise<void> {
    await this.setSchema(schema);
    const props = availableSlot.toPersistence();
    await this.prisma.availableSlot.update({
      where: { id: props.id },
      data: props,
    });
  }

  async isSlotAvailable(
    schema: string,
    staffId: string,
    dateTime: Date,
    durationMinutes: number,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    await this.setSchema(schema);

    const dayOfWeek = dateTime.getDay();
    const requestedEndTime = new Date(
      dateTime.getTime() + durationMinutes * 60000,
    );

    // Primeiro verificamos se o horário solicitado está dentro de um slot disponível
    // Tanto para slots recorrentes quanto para slots específicos
    const availableTimeSlot = await this.prisma.availableSlot.findFirst({
      where: {
        staffId,
        OR: [
          {
            // Verificar slots recorrentes pelo dia da semana
            isRecurring: true,
            dayOfWeek,
            startTime: {
              lte: dateTime,
            },
            endTime: {
              gte: requestedEndTime,
            },
          },
          {
            // Verificar slots específicos para a data exata
            isRecurring: false,
            specificDate: {
              // A data deve ser a mesma (mesmo dia)
              equals: new Date(
                dateTime.getFullYear(),
                dateTime.getMonth(),
                dateTime.getDate(),
              ),
            },
            startTime: {
              lte: dateTime,
            },
            endTime: {
              gte: requestedEndTime,
            },
          },
        ],
      },
    });

    // Se não houver slot disponível para o horário, retornar false
    if (!availableTimeSlot) {
      return false;
    }

    // Verificar se já existe algum agendamento neste horário
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        staffId,
        // Excluir o próprio agendamento em caso de atualização
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        // Verificar se há sobreposição de horários
        OR: [
          {
            // Início do novo agendamento está dentro de um agendamento existente
            scheduledAt: {
              lte: dateTime,
            },
            // Consideramos o fim do agendamento existente como scheduledAt + duração do serviço
            // Mas como não temos isso diretamente, precisamos verificar pelo menos se o início
            // do novo está antes do início do existente
            AND: {
              scheduledAt: {
                gte: new Date(dateTime.getTime() - 60 * 60000), // Assume 1h max de serviço
              },
            },
          },
          {
            // Final do novo agendamento está dentro de um agendamento existente
            scheduledAt: {
              gte: dateTime,
              lte: requestedEndTime,
            },
          },
        ],
        // Considerar apenas agendamentos confirmados ou pendentes
        status: {
          in: ['pending', 'confirmed'],
        },
      },
    });

    // Se não houver conflito, o horário está disponível
    return !conflictingAppointment;
  }

  async getAvailableTimeslots(
    schema: string,
    staffId: string,
    startDate: Date,
    endDate: Date,
    serviceDurationMinutes: number,
  ): Promise<Date[]> {
    await this.setSchema(schema);

    // Armazenar os horários disponíveis
    const availableTimeslots: Date[] = [];

    // Buscamos todos os slots disponíveis no período
    const availableSlots = await this.findAvailableSlotsByDateRange(
      schema,
      staffId,
      startDate,
      endDate,
    );

    // Buscamos todos os agendamentos existentes no período
    await this.setSchema(schema);
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        staffId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      // Incluir o serviço para saber a duração
      include: {
        service: true,
      },
    });

    // Para cada dia no intervalo
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Filtrar slots para este dia (recorrentes ou específicos)
      const slotsForDay = availableSlots.filter((slot) => {
        if (slot.isRecurring) {
          return slot.dayOfWeek === dayOfWeek;
        } else {
          // Comparar apenas data, ignorando hora
          return (
            slot.specificDate &&
            slot.specificDate.getFullYear() === currentDate.getFullYear() &&
            slot.specificDate.getMonth() === currentDate.getMonth() &&
            slot.specificDate.getDate() === currentDate.getDate()
          );
        }
      });

      // Para cada slot do dia
      for (const slot of slotsForDay) {
        // Criar uma data específica para o horário inicial e final
        const slotStart = new Date(currentDate);
        slotStart.setHours(
          slot.startTime.getHours(),
          slot.startTime.getMinutes(),
          0,
          0,
        );

        const slotEnd = new Date(currentDate);
        slotEnd.setHours(
          slot.endTime.getHours(),
          slot.endTime.getMinutes(),
          0,
          0,
        );

        // Dividir o slot em intervalos do tamanho do serviço
        const currentSlotTime = new Date(slotStart);
        while (
          new Date(
            currentSlotTime.getTime() + serviceDurationMinutes * 60000,
          ) <= slotEnd
        ) {
          // Verificar se este horário específico conflita com algum agendamento existente
          const hasConflict = existingAppointments.some((appointment) => {
            const appointmentEnd = new Date(
              appointment.scheduledAt.getTime() +
                appointment.service.duration * 60000,
            );

            const potentialEnd = new Date(
              currentSlotTime.getTime() + serviceDurationMinutes * 60000,
            );

            // Verificar sobreposição
            return (
              (currentSlotTime >= appointment.scheduledAt &&
                currentSlotTime < appointmentEnd) ||
              (potentialEnd > appointment.scheduledAt &&
                potentialEnd <= appointmentEnd) ||
              (currentSlotTime <= appointment.scheduledAt &&
                potentialEnd >= appointmentEnd)
            );
          });

          // Se não houver conflito, adicionar à lista de horários disponíveis
          if (!hasConflict) {
            availableTimeslots.push(new Date(currentSlotTime));
          }

          // Avançar para o próximo horário (intervalo de 15 minutos)
          currentSlotTime.setMinutes(currentSlotTime.getMinutes() + 15);
        }
      }

      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableTimeslots.sort((a, b) => a.getTime() - b.getTime());
  }
}
