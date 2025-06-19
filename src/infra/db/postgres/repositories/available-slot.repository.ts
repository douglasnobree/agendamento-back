import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import { AvailableSlot } from '../../../../domain/entities/available-slot.entity';
import { AvailableSlotRepository } from '../../../../domain/repositoriesInterface/available-slot.repository-interface';

@Injectable()
export class AvailableSlotRepositoryPostgres
  implements AvailableSlotRepository
{
  constructor(private readonly postgres: PostgresService) {}
  private async setSchema(schema: string) {
    await this.postgres.query(`SET search_path TO "${schema}"`);
  }
  async findById(schema: string, id: string): Promise<AvailableSlot | null> {
    await this.setSchema(schema);
    const query = 'SELECT * FROM "AvailableSlot" WHERE id = $1';
    const result = await this.postgres.query(query, [id]);

    if (result.rows.length === 0) return null;
    return AvailableSlot.fromPersistence(result.rows[0]);
  }

  async findByStaffId(
    schema: string,
    staffId: string,
  ): Promise<AvailableSlot[]> {
    await this.setSchema(schema);
    const query =
      'SELECT * FROM "AvailableSlot" WHERE "staffId" = $1 ORDER BY "dayOfWeek" ASC, "startTime" ASC';
    const result = await this.postgres.query(query, [staffId]);

    return result.rows.map(AvailableSlot.fromPersistence);
  }

  async findAvailableSlotsByDateRange(
    schema: string,
    staffId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailableSlot[]> {
    await this.setSchema(schema);

    // Obter dia da semana de início e fim
    const startDayOfWeek = startDate.getDay();
    const endDayOfWeek = endDate.getDay();
    // Buscar slots recorrentes
    const recurringQuery = `
      SELECT * FROM "AvailableSlot" 
      WHERE "staffId" = $1 
        AND "isRecurring" = true
        AND "dayOfWeek" BETWEEN $2 AND $3
    `;
    const recurringResult = await this.postgres.query(recurringQuery, [
      staffId,
      startDayOfWeek,
      endDayOfWeek,
    ]);

    // Buscar slots específicos
    const specificQuery = `
      SELECT * FROM "AvailableSlot" 
      WHERE "staffId" = $1 
        AND "isRecurring" = false
        AND "specificDate" BETWEEN $2 AND $3
    `;
    const specificResult = await this.postgres.query(specificQuery, [
      staffId,
      startDate,
      endDate,
    ]);

    // Combinar resultados
    return [...recurringResult.rows, ...specificResult.rows].map(
      AvailableSlot.fromPersistence,
    );
  }
  async save(schema: string, availableSlot: AvailableSlot): Promise<void> {
    await this.setSchema(schema);
    const props = availableSlot.toPersistence();

    const query = `
      INSERT INTO "AvailableSlot" (
        "id", "staffId", "dayOfWeek", "startTime", "endTime", 
        "isRecurring", "specificDate", "createdAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await this.postgres.query(query, [
      props.id,
      props.staffId,
      props.dayOfWeek,
      props.startTime,
      props.endTime,
      props.isRecurring,
      props.specificDate,
      props.createdAt,
    ]);
  }

  async saveMany(
    schema: string,
    availableSlots: AvailableSlot[],
  ): Promise<void> {
    if (availableSlots.length === 0) return;

    await this.setSchema(schema);

    // Criar uma transação
    const client = await this.postgres.getClient();
    try {
      await client.query('BEGIN');

      for (const slot of availableSlots) {
        const props = slot.toPersistence();
        const query = `
          INSERT INTO "AvailableSlot" (
            "id", "staffId", "dayOfWeek", "startTime", "endTime", 
            "isRecurring", "specificDate", "createdAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        await client.query(query, [
          props.id,
          props.staffId,
          props.dayOfWeek,
          props.startTime,
          props.endTime,
          props.isRecurring,
          props.specificDate,
          props.createdAt,
        ]);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
  async remove(schema: string, id: string): Promise<void> {
    await this.setSchema(schema);
    const query = 'DELETE FROM "AvailableSlot" WHERE id = $1';
    await this.postgres.query(query, [id]);
  }

  async update(schema: string, availableSlot: AvailableSlot): Promise<void> {
    await this.setSchema(schema);
    const props = availableSlot.toPersistence();

    const query = `
      UPDATE "AvailableSlot" 
      SET "staffId" = $2, 
          "dayOfWeek" = $3, 
          "startTime" = $4, 
          "endTime" = $5, 
          "isRecurring" = $6, 
          "specificDate" = $7
      WHERE id = $1
    `;

    await this.postgres.query(query, [
      props.id,
      props.staffId,
      props.dayOfWeek,
      props.startTime,
      props.endTime,
      props.isRecurring,
      props.specificDate,
    ]);
  }

  async isSlotAvailable(
    schema: string,
    staffId: string,
    dateTime: Date,
    durationMinutes: number,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    await this.setSchema(schema);

    // Dia da semana do agendamento solicitado
    const dayOfWeek = dateTime.getDay();
    // Data final do agendamento solicitado
    const requestedEndTime = new Date(
      dateTime.getTime() + durationMinutes * 60000,
    );

    // Verificar se há um slot disponível para o horário solicitado
    const timeSlotQuery = `
      SELECT * FROM "AvailableSlot"
      WHERE "staffId" = $1 AND (
        ("isRecurring" = true AND "dayOfWeek" = $2 AND "startTime" <= $3 AND "endTime" >= $4)
        OR
        ("isRecurring" = false AND DATE("specificDate") = DATE($5) AND "startTime" <= $3 AND "endTime" >= $4)
      )
      LIMIT 1
    `;
    const timeSlotResult = await this.postgres.query(timeSlotQuery, [
      staffId,
      dayOfWeek,
      dateTime,
      requestedEndTime,
      dateTime,
    ]);

    // Se não encontrou slot disponível, retornar false
    if (timeSlotResult.rows.length === 0) {
      return false;
    }

    // Verificar se já existe algum agendamento nesse horário
    let conflictQuery = `
      SELECT a.* FROM "Appointment" a
      JOIN "Service" s ON a."serviceId" = s.id
      WHERE a."staffId" = $1
        AND a.status IN ('pending', 'confirmed')
        AND (
          -- Início do novo agendamento durante um agendamento existente
          ($2 BETWEEN a."scheduledAt" AND (a."scheduledAt" + (s.duration || ' minutes')::interval))
          OR
          -- Final do novo agendamento durante um agendamento existente
          ($3 BETWEEN a."scheduledAt" AND (a."scheduledAt" + (s.duration || ' minutes')::interval))
          OR
          -- Novo agendamento engloba um existente
          (a."scheduledAt" BETWEEN $2 AND $3)
        )
    `;

    const params = [staffId, dateTime, requestedEndTime];

    // Se estiver atualizando um agendamento, ignorar o próprio agendamento
    if (excludeAppointmentId) {
      conflictQuery += ' AND a.id != $4';
      params.push(excludeAppointmentId);
    }

    conflictQuery += ' LIMIT 1';

    const conflictResult = await this.postgres.query(conflictQuery, params);

    // Se não encontrou conflito, o horário está disponível
    return conflictResult.rows.length === 0;
  }

  async getAvailableTimeslots(
    schema: string,
    staffId: string,
    startDate: Date,
    endDate: Date,
    serviceDurationMinutes: number,
  ): Promise<Date[]> {
    await this.setSchema(schema);
    const availableTimeslots: Date[] = [];

    // Obter todos os slots disponíveis do funcionário no período
    const availableSlots = await this.findAvailableSlotsByDateRange(
      schema,
      staffId,
      startDate,
      endDate,
    );

    // Buscar todos os agendamentos existentes no período
    const appointmentsQuery = `
      SELECT a.*, s.duration 
      FROM "Appointment" a
      JOIN "Service" s ON a."serviceId" = s.id
      WHERE a."staffId" = $1
        AND a."scheduledAt" BETWEEN $2 AND $3
        AND a.status IN ('pending', 'confirmed')
      ORDER BY a."scheduledAt" ASC
    `;

    const appointmentsResult = await this.postgres.query(appointmentsQuery, [
      staffId,
      startDate,
      endDate,
    ]);

    const existingAppointments = appointmentsResult.rows.map((row) => ({
      scheduledAt: row.scheduledAt,
      endTime: new Date(row.scheduledAt.getTime() + row.duration * 60000),
      duration: row.duration,
    }));

    // Para cada dia no intervalo de datas
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();

      // Filtrar slots para este dia (recorrentes ou específicos)
      const slotsForDay = availableSlots.filter((slot) => {
        if (slot.isRecurring) {
          return slot.dayOfWeek === dayOfWeek;
        } else if (slot.specificDate) {
          const slotDate = new Date(slot.specificDate);
          return (
            slotDate.getFullYear() === currentYear &&
            slotDate.getMonth() === currentMonth &&
            slotDate.getDate() === currentDay
          );
        }
        return false;
      });

      // Para cada slot disponível neste dia
      for (const slot of slotsForDay) {
        // Criar hora de início e fim específicas para este dia
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

        // Dividir o slot em intervalos de 15 minutos
        const currentSlotTime = new Date(slotStart);

        // Enquanto o horário atual + duração do serviço for menor ou igual ao fim do slot
        while (
          new Date(
            currentSlotTime.getTime() + serviceDurationMinutes * 60000,
          ) <= slotEnd
        ) {
          // Verificar se há conflito com algum agendamento existente
          const potentialEndTime = new Date(
            currentSlotTime.getTime() + serviceDurationMinutes * 60000,
          );

          const hasConflict = existingAppointments.some((appointment) => {
            // Verificar sobreposição
            return (
              (currentSlotTime >= appointment.scheduledAt &&
                currentSlotTime < appointment.endTime) ||
              (potentialEndTime > appointment.scheduledAt &&
                potentialEndTime <= appointment.endTime) ||
              (currentSlotTime <= appointment.scheduledAt &&
                potentialEndTime >= appointment.endTime)
            );
          });

          // Se não houver conflito, adicionar à lista de horários disponíveis
          if (!hasConflict) {
            availableTimeslots.push(new Date(currentSlotTime));
          }

          // Avançar para o próximo intervalo (15 minutos)
          currentSlotTime.setMinutes(currentSlotTime.getMinutes() + 15);
        }
      }

      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Ordenar por data/hora
    return availableTimeslots.sort((a, b) => a.getTime() - b.getTime());
  }
}
