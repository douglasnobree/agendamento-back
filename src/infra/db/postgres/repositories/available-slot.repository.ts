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

  // Método auxiliar para converter string de hora (HH:MM) para minutos
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Método auxiliar para converter minutos para string de hora (HH:MM)
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }

  // Método auxiliar para extrair só o horário de um objeto Date
  private formatTimeFromDate(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  // Método auxiliar para criar uma data a partir de um dia e um horário
  private createDateFromTimeString(
    dateOrDayIndex: Date | number,
    timeString: string,
  ): Date {
    let date: Date;

    if (typeof dateOrDayIndex === 'number') {
      // Calcular próxima data com esse dia da semana
      const today = new Date();
      const currentDay = today.getDay();
      const daysUntilTarget = (dateOrDayIndex - currentDay + 7) % 7;
      date = new Date(today);
      date.setDate(today.getDate() + daysUntilTarget);
    } else {
      // Usar a data fornecida
      date = new Date(dateOrDayIndex);
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
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

    console.log(
      '==== VERIFICAÇÃO DE DISPONIBILIDADE DE HORÁRIO SIMPLIFICADA ====',
    );
    console.log(`Staff ID: ${staffId}`);

    // Extrair dados da data
    const targetDate = new Date(dateTime);
    const dayOfWeek = targetDate.getDay();
    const targetTimeString = this.formatTimeFromDate(dateTime);
    console.log(`Data solicitada: ${targetDate.toISOString()}`);
    console.log(`Horário solicitado: ${targetTimeString}`);
    console.log(
      `Dia da semana: ${dayOfWeek} (0=domingo, 1=segunda, ..., 6=sábado)`,
    );

    // Calcular horário de término com base na duração
    const targetStartMinutes = this.timeToMinutes(targetTimeString);
    const targetEndMinutes = targetStartMinutes + durationMinutes;
    const targetEndTimeString = this.minutesToTime(targetEndMinutes);
    console.log(`Duração (minutos): ${durationMinutes}`);
    console.log(`Horário de término: ${targetEndTimeString}`);

    // 1. Verificar se existe um slot disponível que inclua o horário solicitado
    const slotQuery = `
      SELECT * FROM "AvailableSlot"
      WHERE "staffId" = $1 AND (
        ("isRecurring" = true AND "dayOfWeek" = $2 AND 
         EXTRACT(HOUR FROM "startTime") * 60 + EXTRACT(MINUTE FROM "startTime") <= $3 AND 
         EXTRACT(HOUR FROM "endTime") * 60 + EXTRACT(MINUTE FROM "endTime") >= $4)
        OR
        ("isRecurring" = false AND DATE("specificDate") = DATE($5) AND 
         EXTRACT(HOUR FROM "startTime") * 60 + EXTRACT(MINUTE FROM "startTime") <= $3 AND 
         EXTRACT(HOUR FROM "endTime") * 60 + EXTRACT(MINUTE FROM "endTime") >= $4)
      )
      LIMIT 1
    `;

    const slotParams = [
      staffId,
      dayOfWeek,
      targetStartMinutes,
      targetEndMinutes,
      targetDate,
    ];

    console.log('Verificando slots disponíveis...');
    const slotResult = await this.postgres.query(slotQuery, slotParams);

    if (slotResult.rows.length === 0) {
      console.log('Nenhum slot disponível encontrado para esse horário');
      return false;
    }

    console.log('Slot disponível encontrado');

    // 2. Verificar se já existe algum agendamento no horário solicitado
    let conflictQuery = `
      SELECT a.id FROM "Appointment" a
      JOIN "Service" s ON a."serviceId" = s.id
      WHERE a."staffId" = $1
        AND a.status IN ('pending', 'confirmed')
        AND DATE(a."scheduledAt") = DATE($2)
        AND (
          -- Início do novo agendamento durante um existente
          (EXTRACT(HOUR FROM a."scheduledAt") * 60 + EXTRACT(MINUTE FROM a."scheduledAt") <= $3 AND
           EXTRACT(HOUR FROM a."scheduledAt") * 60 + EXTRACT(MINUTE FROM a."scheduledAt") + s.duration >= $3)
          OR
          -- Final do novo agendamento durante um existente
          (EXTRACT(HOUR FROM a."scheduledAt") * 60 + EXTRACT(MINUTE FROM a."scheduledAt") <= $4 AND
           EXTRACT(HOUR FROM a."scheduledAt") * 60 + EXTRACT(MINUTE FROM a."scheduledAt") + s.duration >= $4)
          OR
          -- Novo agendamento engloba um existente
          (EXTRACT(HOUR FROM a."scheduledAt") * 60 + EXTRACT(MINUTE FROM a."scheduledAt") >= $3 AND
           EXTRACT(HOUR FROM a."scheduledAt") * 60 + EXTRACT(MINUTE FROM a."scheduledAt") + s.duration <= $4)
        )
    `;

    // Parâmetros para a consulta
    const conflictParams = [
      staffId,
      targetDate,
      targetStartMinutes,
      targetEndMinutes,
    ];

    // Se estiver atualizando um agendamento, ignorar o próprio agendamento
    if (excludeAppointmentId) {
      conflictQuery += ' AND a.id <> $5';
      conflictParams.push(excludeAppointmentId);
    }

    conflictQuery += ' LIMIT 1';

    console.log('Verificando conflitos...');
    const conflictResult = await this.postgres.query(
      conflictQuery,
      conflictParams,
    );

    const isAvailable = conflictResult.rows.length === 0;
    console.log(
      `Resultado final: ${isAvailable ? 'DISPONÍVEL' : 'NÃO DISPONÍVEL'}`,
    );

    return isAvailable;
  }

  async getAvailableTimeslots(
    schema: string,
    staffId: string,
    startDate: Date,
    endDate: Date,
    serviceDurationMinutes: number,
  ): Promise<Date[]> {
    await this.setSchema(schema);
    console.log('==== BUSCANDO HORÁRIOS DISPONÍVEIS SIMPLIFICADO ====');

    const availableTimeslots: Date[] = [];
    const currentDate = new Date(startDate);

    // Para cada dia dentro do período
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const currentDateStr = currentDate.toISOString().split('T')[0];

      // Buscar slots disponíveis para esse dia (recorrentes e específicos)
      const slotsQuery = `
        SELECT * FROM "AvailableSlot"
        WHERE "staffId" = $1 AND (
          ("isRecurring" = true AND "dayOfWeek" = $2)
          OR
          ("isRecurring" = false AND DATE("specificDate") = DATE($3))
        )
        ORDER BY "startTime"
      `;

      const slotsResult = await this.postgres.query(slotsQuery, [
        staffId,
        dayOfWeek,
        currentDate,
      ]);

      // Para cada slot disponível, gerar os horários possíveis
      for (const slot of slotsResult.rows) {
        // Converter horas para minutos para facilitar cálculos
        const startHour = slot.startTime.getHours();
        const startMinute = slot.startTime.getMinutes();
        const startMinutes = startHour * 60 + startMinute;

        const endHour = slot.endTime.getHours();
        const endMinute = slot.endTime.getMinutes();
        const endMinutes = endHour * 60 + endMinute;

        // Gerar horários a cada 30 minutos (ou outro intervalo definido)
        const interval = 30; // minutos
        for (
          let timeMinutes = startMinutes;
          timeMinutes <= endMinutes - serviceDurationMinutes;
          timeMinutes += interval
        ) {
          // Verificar se este horário específico está disponível
          const timeString = this.minutesToTime(timeMinutes);
          const potentialDateTime = this.createDateFromTimeString(
            new Date(currentDateStr),
            timeString,
          );

          const isAvailable = await this.isSlotAvailable(
            schema,
            staffId,
            potentialDateTime,
            serviceDurationMinutes,
          );

          if (isAvailable) {
            availableTimeslots.push(potentialDateTime);
          }
        }
      }

      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableTimeslots;
  }

  // Método para debug - verificar disponibilidade por dia da semana
  async debugAvailableSlots(schema: string, staffId: string): Promise<void> {
    await this.setSchema(schema);

    console.log('==== DEBUG DE SLOTS DISPONÍVEIS ====');
    console.log(`Schema: ${schema}`);
    console.log(`Staff ID: ${staffId}`);

    // Buscar todos os slots disponíveis do funcionário
    const query = `
      SELECT * FROM "AvailableSlot"
      WHERE "staffId" = $1
      ORDER BY "dayOfWeek", "startTime"
    `;

    const result = await this.postgres.query(query, [staffId]);

    console.log(`Total de slots encontrados: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log('ERRO: Nenhum slot cadastrado para este funcionário!');
      console.log(
        'É necessário criar slots de disponibilidade antes de agendar.',
      );
      return;
    }

    // Mostrar detalhes de cada slot
    result.rows.forEach((slot, index) => {
      const diasSemana = [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
      ];
      const diaSemanaTexto = diasSemana[slot.dayOfWeek] || 'Desconhecido';

      console.log(`Slot ${index + 1}:`);
      console.log(`  ID: ${slot.id}`);
      console.log(`  Dia da semana: ${slot.dayOfWeek} (${diaSemanaTexto})`);
      console.log(
        `  Horário início: ${new Date(slot.startTime).toISOString()}`,
      );
      console.log(`  Horário fim: ${new Date(slot.endTime).toISOString()}`);
      console.log(`  Recorrente: ${slot.isRecurring}`);
      if (!slot.isRecurring && slot.specificDate) {
        console.log(
          `  Data específica: ${new Date(slot.specificDate).toISOString()}`,
        );
        console.log(
          `  Dia da semana da data específica: ${new Date(slot.specificDate).getDay()}`,
        );
      }
    });

    // Verificar slots para todos os dias da semana
    console.log('==== SLOTS POR DIA DA SEMANA ====');
    for (let i = 0; i < 7; i++) {
      const diasSemana = [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
      ];
      const slotsForDay = result.rows.filter((slot) => slot.dayOfWeek === i);

      console.log(`${diasSemana[i]} (${i}): ${slotsForDay.length} slots`);
      if (slotsForDay.length === 0) {
        console.log(`  Nenhum slot disponível para ${diasSemana[i]}`);
      }
    }
    console.log('=======================================');
  }
}
