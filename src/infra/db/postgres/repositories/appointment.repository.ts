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

  async findById(schema: string, id: string): Promise<Appointment | null> {
    const result = await this.postgres.query<AppointmentProps>(
      `SELECT * FROM "${schema}"."Appointment" WHERE id = $1`, //TODO - trocar para id do cliente
      [id],
    );
    if (!result.rows[0]) return null;
    return Appointment.fromPersistence(result.rows[0]);
  }

  async findAppointmentsByClientId(schema: string, clientId: string): Promise<Appointment[]> {
    const result = await this.postgres.query<AppointmentProps>(
      `SELECT * FROM "${schema}"."Appointment" WHERE "clientId" = $1`,
      [clientId],
    );
    return result.rows.map(Appointment.fromPersistence);
  }

  async findAll(schema: string): Promise<Appointment[]> {
    const result = await this.postgres.query<AppointmentProps>(
      `SELECT * FROM "${schema}"."Appointment"`,
    );
    return result.rows.map(Appointment.fromPersistence);
  }

  async save(schema: string, appointment: Appointment): Promise<void> {
    const props = appointment.toPersistence();
    await this.postgres.query(
      `INSERT INTO "${schema}"."Appointment" (id, "clientId", "serviceId", "staffId", "scheduledAt", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
    await this.postgres.query(
      `DELETE FROM "${schema}"."Appointment" WHERE id = $1`,
      [id],
    );
  }

  async update(schema: string, appointment: Appointment): Promise<void> {
    const props = appointment.toPersistence();
    await this.postgres.query(
      `UPDATE "${schema}"."Appointment" SET "clientId" = $1, "serviceId" = $2, "staffId" = $3, "scheduledAt" = $4, status = $5 WHERE id = $6`,
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
