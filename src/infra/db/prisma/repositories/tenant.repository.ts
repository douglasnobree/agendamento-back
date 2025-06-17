import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Tenant } from '../../../../domain/entities/tenant.entity';
import { TenantRepository } from '../../../../domain/repositoriesInterface/tenant.repository-interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantRepositoryPrisma implements TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Tenant | null> {
    const data = await this.prisma.tenant.findUnique({ where: { id } });
    if (!data) return null;
    return Tenant.fromPersistence(data);
  }

  async findBySchema(schema: string): Promise<Tenant | null> {
    const data = await this.prisma.tenant.findUnique({ where: { schema } });
    if (!data) return null;
    return Tenant.fromPersistence(data);
  }

  async list(): Promise<Tenant[]> {
    const data = await this.prisma.tenant.findMany();
    return data.map(Tenant.fromPersistence);
  }

  async save(tenant: Tenant): Promise<void> {
    const props = tenant.toPersistence();
    await this.prisma.tenant.create({ data: props });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.tenant.delete({ where: { id } });
  }

  async update(tenant: Tenant): Promise<void> {
    const props = tenant.toPersistence();
    await this.prisma.tenant.update({ where: { id: props.id }, data: props });
  }
  async createTenantWithSchema(input: {
    name: string;
    ownerEmail: string;
    planId: string;
  }): Promise<Tenant> {
    const schema = `tenant_${input.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    const tenant = Tenant.create(
      input.name,
      input.ownerEmail,
      input.planId,
      schema,
    );

    try {
      // Usar transação para garantir atomicidade
      await this.prisma.$transaction(async (prisma) => {
        // Criar o registro do tenant
        await prisma.tenant.create({
          data: tenant.toPersistence(),
        });

        // Criar o schema
        await prisma.$executeRawUnsafe(
          `CREATE SCHEMA IF NOT EXISTS "${schema}"`,
        );

        // Criar hash da senha padrão
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Criar tabela Owner
        await prisma.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS "${schema}"."Owner" (
            "id" TEXT PRIMARY KEY,
            "email" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "password" TEXT,
            "oauthType" TEXT,
            "oauthId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
        );
        await prisma.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "Owner_email_key" ON "${schema}"."Owner"("email")`,
        );
        await prisma.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "Owner_oauthId_key" ON "${schema}"."Owner"("oauthId")`,
        );

        // Criar tabela Client
        await prisma.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS "${schema}"."Client" (
            "id" TEXT PRIMARY KEY,
            "email" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "phone" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
        );
        await prisma.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "Client_email_key" ON "${schema}"."Client"("email")`,
        );

        // Criar tabela Service
        await prisma.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS "${schema}"."Service" (
            "id" TEXT PRIMARY KEY,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "duration" INTEGER NOT NULL,
            "price" DOUBLE PRECISION NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
        );

        // Criar tabela Staff
        await prisma.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS "${schema}"."Staff" (
            "id" TEXT PRIMARY KEY,
            "name" TEXT NOT NULL,
            "role" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
        );
        await prisma.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "Staff_email_key" ON "${schema}"."Staff"("email")`,
        );

        // Criar tabela Appointment
        await prisma.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS "${schema}"."Appointment" (
            "id" TEXT PRIMARY KEY,
            "clientId" TEXT NOT NULL,
            "serviceId" TEXT NOT NULL,
            "staffId" TEXT NOT NULL,
            "scheduledAt" TIMESTAMP(3) NOT NULL,
            "status" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
        );

        // Adicionar Foreign Keys (tratando possíveis erros se já existirem)
        try {
          await prisma.$executeRawUnsafe(
            `ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "${schema}"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
          );
        } catch (e) {
          if (!e.message.includes('already exists')) throw e;
        }

        try {
          await prisma.$executeRawUnsafe(
            `ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "${schema}"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
          );
        } catch (e) {
          if (!e.message.includes('already exists')) throw e;
        }

        try {
          await prisma.$executeRawUnsafe(
            `ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "${schema}"."Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
          );
        } catch (e) {
          if (!e.message.includes('already exists')) throw e;
        } // Criar owner inicial
        await prisma.$executeRawUnsafe(
          `INSERT INTO "${schema}"."Owner" ("id", "email", "name", "password", "createdAt") VALUES (gen_random_uuid(), '${input.ownerEmail}', '${input.name} Owner', '${hashedPassword}', CURRENT_TIMESTAMP)`,
        );
      });

      return tenant;
    } catch (error) {
      // Em caso de erro, remover o tenant e o schema
      await this.prisma.tenant.delete({ where: { schema } }).catch(() => {});
      await this.prisma
        .$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
        .catch(() => {});
      throw error;
    }
  }
}
