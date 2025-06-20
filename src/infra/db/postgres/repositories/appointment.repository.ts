import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import {
  Appointment,
  AppointmentProps,
} from '../../../../domain/entities/appointment.entity';
import { AppointmentRepository } from '../../../../domain/repositoriesInterface/appointment.repository-interface';

@Injectable()
export class AppointmentRepositoryPostgres implements AppointmentRepository {
  constructor(private readonly postgres: PostgresService) {}

  // Método auxiliar para configurar o schema
  private async setSchema(schema: string): Promise<void> {
    await this.postgres.query(`SET search_path TO "${schema}"`);
  }

  // Método auxiliar para converter string de hora (HH:MM) para objeto Date
  private parseTimeString(dateValue: string, timeString: string): Date {
    // Separar horas e minutos
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Criar um objeto Date a partir da data fornecida
    const date = new Date(dateValue);
    
    // Definir horas e minutos
    date.setHours(hours, minutes, 0, 0);
    
    return date;
  }
  
  // Método auxiliar para converter Date para string de hora (HH:MM)
  private formatTimeToString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  async findById(schema: string, id: string): Promise<Appointment | null> {
    await this.setSchema(schema);
    const result = await this.postgres.query<AppointmentProps>(
      `SELECT * FROM "Appointment" WHERE id = $1`,
      [id],
    );
    if (!result.rows[0]) return null;
    return Appointment.fromPersistence(result.rows[0]);
  }

  async findAppointmentsByClientId(schema: string, clientId: string): Promise<Appointment[]> {
    await this.setSchema(schema);
    const result = await this.postgres.query<AppointmentProps>(
      `SELECT * FROM "Appointment" WHERE "clientId" = $1`,
      [clientId],
    );
    return result.rows.map(Appointment.fromPersistence);
  }

  async findAll(schema: string): Promise<Appointment[]> {
    await this.setSchema(schema);
    const result = await this.postgres.query<AppointmentProps>(
      `SELECT * FROM "Appointment"`,
    );
    return result.rows.map(Appointment.fromPersistence);
  }

  async save(schema: string, appointment: Appointment): Promise<void> {
    await this.setSchema(schema);
    const props = appointment.toPersistence();
    await this.postgres.query(
      `INSERT INTO "Appointment" (id, "clientId", "serviceId", "staffId", "scheduledAt", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        props.id,
        props.clientId,
        props.serviceId,
        props.staffId,
        props.scheduledAt,
        props.status,
        props.createdAt,
      ],
    );
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.setSchema(schema);
    await this.postgres.query(
      `DELETE FROM "Appointment" WHERE id = $1`,
      [id],
    );
  }

  async update(schema: string, appointment: Appointment): Promise<void> {
    await this.setSchema(schema);
    const props = appointment.toPersistence();
    await this.postgres.query(
      `UPDATE "Appointment" SET "clientId" = $1, "serviceId" = $2, "staffId" = $3, "scheduledAt" = $4, status = $5 WHERE id = $6`,
      [
        props.clientId,
        props.serviceId,
        props.staffId,
        props.scheduledAt,
        props.status,
        props.id,
      ],
    );
  }
}
