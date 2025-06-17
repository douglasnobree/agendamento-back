import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PlatformAdmin } from '../../../../domain/entities/platform-admin.entity';
import { PlatformAdminRepository } from '../../../../domain/repositoriesInterface/platform-admin.repository-interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlatformAdminRepositoryPrisma implements PlatformAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<PlatformAdmin | null> {
    const data = await this.prisma.platformAdmin.findUnique({ where: { email } });
    if (!data) return null;
    return PlatformAdmin.fromPersistence(data);
  }

  async findById(id: string): Promise<PlatformAdmin | null> {
    const data = await this.prisma.platformAdmin.findUnique({ where: { id } });
    if (!data) return null;
    return PlatformAdmin.fromPersistence(data);
  }

  async list(): Promise<PlatformAdmin[]> {
    const data = await this.prisma.platformAdmin.findMany();
    return data.map(PlatformAdmin.fromPersistence);
  }

  async save(admin: PlatformAdmin): Promise<void> {
    const props = admin.toPersistence();
    if (!props.password) throw new Error('Senha obrigatória para criar PlatformAdmin');
    await this.prisma.platformAdmin.create({ data: {
      id: props.id,
      email: props.email,
      name: props.name,
      password: props.password,
      createdAt: props.createdAt,
    }});
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.platformAdmin.delete({ where: { id } });
  }

  async update(admin: PlatformAdmin): Promise<void> {
    const props = admin.toPersistence();
    await this.prisma.platformAdmin.update({ where: { id: props.id }, data: props });
  }
}
