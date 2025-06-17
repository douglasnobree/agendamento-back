import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Staff } from '../../../../domain/entities/staff.entity';
import { StaffRepository } from '../../../../domain/repositoriesInterface/staff.repository-interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffRepositoryPrisma implements StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async setSchema(schema: string) {
    await this.prisma.$executeRawUnsafe(`SET search_path TO "${schema}"`);
  }

  async findByEmail(schema: string, email: string): Promise<Staff | null> {
    await this.setSchema(schema);
    const data = await this.prisma.staff.findUnique({ where: { email } });
    if (!data) return null;
    return Staff.fromPersistence(data);
  }

  async findById(schema: string, id: string): Promise<Staff | null> {
    await this.setSchema(schema);
    const data = await this.prisma.staff.findUnique({ where: { id } });
    if (!data) return null;
    return Staff.fromPersistence(data);
  }

  async findAll(schema: string): Promise<Staff[]> {
    await this.setSchema(schema);
    const data = await this.prisma.staff.findMany();
    return data.map(Staff.fromPersistence);
  }

  async save(schema: string, staff: Staff): Promise<void> {
    await this.setSchema(schema);
    const props = staff.toPersistence();
    await this.prisma.staff.create({ data: props });
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.setSchema(schema);
    await this.prisma.staff.delete({ where: { id } });
  }

  async update(schema: string, staff: Staff): Promise<void> {
    await this.setSchema(schema);
    const props = staff.toPersistence();
    await this.prisma.staff.update({ where: { id: props.id }, data: props });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
