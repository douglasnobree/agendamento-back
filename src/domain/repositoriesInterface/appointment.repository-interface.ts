import { Appointment } from '../entities/appointment.entity';

export interface AppointmentRepository {
  findById(schema: string, id: string): Promise<Appointment | null>; // TODO - trocar para id do cliente
  findAll(schema: string): Promise<Appointment[]>;
  save(schema: string, appointment: Appointment): Promise<void>;
  remove(schema: string, id: string): Promise<void>;
  update(schema: string, appointment: Appointment): Promise<void>;
  findAppointmentsByClientId(schema: string, clientId: string ): Promise<Appointment[]>;
}
