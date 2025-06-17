import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Appointment } from '../../../../domain/entities/appointment.entity';
import { AppointmentRepository } from '../../../../domain/repositoriesInterface/appointment.repository-interface';

@Injectable()
export class AppointmentRepositoryPrisma implements AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async setSchema(schema: string) {
    await this.prisma.$executeRawUnsafe(`SET search_path TO "${schema}"`);
  }

  async findById(schema: string, id: string): Promise<Appointment | null> {
    await this.setSchema(schema);
    const data = await this.prisma.appointment.findUnique({ where: { id } });
    if (!data) return null;
    return Appointment.fromPersistence(data);
  }

  async findAppointmentsByClientId(schema: string, clientId: string): Promise<Appointment[]> {
    await this.setSchema(schema);
    const data = await this.prisma.appointment.findMany({ where: { clientId } });
    return data.map(Appointment.fromPersistence);
  }

  async findAll(schema: string): Promise<Appointment[]> {
    await this.setSchema(schema);
    const data = await this.prisma.appointment.findMany();
    return data.map(Appointment.fromPersistence);
  }

  async save(schema: string, appointment: Appointment): Promise<void> {
    await this.setSchema(schema);
    const props = appointment.toPersistence();
    await this.prisma.appointment.create({ data: props });
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.setSchema(schema);
    await this.prisma.appointment.delete({ where: { id } });
  }

  async update(schema: string, appointment: Appointment): Promise<void> {
    await this.setSchema(schema);
    const props = appointment.toPersistence();
    await this.prisma.appointment.update({ where: { id: props.id }, data: props });
  }
}
