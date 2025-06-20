import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Staff } from '../../../../domain/entities/staff.entity';
import { StaffRepository } from '../../../../domain/repositoriesInterface/staff.repository-interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffRepositoryPrisma implements StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(schema: string, email: string): Promise<Staff | null> {
    const result = await this.prisma.executeRaw<any[]>(
      `SELECT * FROM "${schema}"."Staff" WHERE email = $1`,
      [email],
    );

    if (!result || result.length === 0) return null;
    return Staff.fromPersistence(result[0]);
  }

  async findById(schema: string, id: string): Promise<Staff | null> {
    const result = await this.prisma.executeRaw<any[]>(
      `SELECT * FROM "${schema}"."Staff" WHERE id = $1`,
      [id],
    );

    if (!result || result.length === 0) return null;
    return Staff.fromPersistence(result[0]);
  }

  async findAll(schema: string): Promise<Staff[]> {
    const result = await this.prisma.executeRaw<any[]>(
      `SELECT * FROM "${schema}"."Staff"`,
    );

    if (!result || result.length === 0) return [];
    return result.map(Staff.fromPersistence);
  }

  async save(schema: string, staff: Staff): Promise<void> {
    const props = staff.toPersistence();
    await this.prisma.executeRaw(
      `INSERT INTO "${schema}"."Staff" (id, name, role, email, password, "createdAt") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        props.id,
        props.name,
        props.role,
        props.email,
        props.password,
        props.createdAt,
      ],
    );
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.prisma.executeRaw(
      `DELETE FROM "${schema}"."Staff" WHERE id = $1`,
      [id],
    );
  }

  async update(schema: string, staff: Staff): Promise<void> {
    const props = staff.toPersistence();
    await this.prisma.executeRaw(
      `UPDATE "${schema}"."Staff" SET name = $1, role = $2, email = $3, password = $4 WHERE id = $5`,
      [props.name, props.role, props.email, props.password, props.id],
    );
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
