import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma, Tenant } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantService {
  private tenantPrismaClients: Map<string, PrismaClient> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createTenant(data: {
    name: string;
    ownerEmail: string;
    planId: string;
  }): Promise<Tenant> {
    // Gerar um schema único baseado no nome (transformar em slug e adicionar um timestamp)
    const schema = `tenant_${data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    // Criar um novo tenant no schema public
    const tenant = await this.prisma.tenant.create({
      data: {
        ...data,
        schema,
      },
    });

    // Criar o schema no banco de dados
    await this.prisma.$executeRawUnsafe(
      `CREATE SCHEMA IF NOT EXISTS "${schema}"`,
    );

    try {
      // Vamos migrar o schema do tenant usando o Prisma
      // Em um ambiente de produção, você deve usar uma estratégia mais robusta
      // Isso é apenas para fins de demonstração

      // Gerar hash de senha para o owner
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('password123', salt); // Criar tabelas para o tenant usando Prisma schema
      // Executar comandos SQL separados para criar as tabelas no schema específico

      // Criar tabela Owner
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${schema}"."Owner" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "password" TEXT,
          "oauthType" TEXT,
          "oauthId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
        );
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Owner_email_key" ON "${schema}"."Owner"("email");
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Owner_oauthId_key" ON "${schema}"."Owner"("oauthId");
      `);

      // Criar tabela Client
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${schema}"."Client" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "phone" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
        );
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Client_email_key" ON "${schema}"."Client"("email");
      `);

      // Criar tabela Service
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${schema}"."Service" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "duration" INTEGER NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
        );
      `);

      // Criar tabela Staff
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${schema}"."Staff" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
        );
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Staff_email_key" ON "${schema}"."Staff"("email");
      `);

      // Criar tabela Appointment
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "${schema}"."Appointment" (
          "id" TEXT NOT NULL,
          "clientId" TEXT NOT NULL,
          "serviceId" TEXT NOT NULL,
          "staffId" TEXT NOT NULL,
          "scheduledAt" TIMESTAMP(3) NOT NULL,
          "status" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
        );
      `);

      // Adicionar chaves estrangeiras
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" 
          FOREIGN KEY ("clientId") REFERENCES "${schema}"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);

      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" 
          FOREIGN KEY ("serviceId") REFERENCES "${schema}"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);

      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" 
          FOREIGN KEY ("staffId") REFERENCES "${schema}"."Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);

      // Criar o primeiro usuário dono (owner) para este tenant
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO "${schema}"."Owner" ("id", "email", "name", "password", "createdAt")
        VALUES (gen_random_uuid(), '${data.ownerEmail}', '${data.name} Owner', '${hashedPassword}', CURRENT_TIMESTAMP);
      `);

      return tenant;
    } catch (error) {
      // Em caso de erro, remover o tenant criado
      await this.prisma.tenant.delete({
        where: { id: tenant.id },
      });

      // Tentar remover o schema para limpar recursos
      try {
        await this.prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE;`,
        );
      } catch {}

      throw error;
    }
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  async getTenantBySchema(schema: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({
      where: { schema },
    });
  }

  async getTenantPrismaClient(tenantIdOrSchema: string): Promise<PrismaClient> {
    // Verificar se já temos um cliente para este tenant
    if (this.tenantPrismaClients.has(tenantIdOrSchema)) {
      return this.tenantPrismaClients.get(tenantIdOrSchema)!;
    }

    // Determinar se o parâmetro é um ID ou um schema
    let tenant: Tenant | null;

    // Verificar se é um UUID válido (formato de ID)
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        tenantIdOrSchema,
      )
    ) {
      tenant = await this.getTenantById(tenantIdOrSchema);
    } else {
      tenant = await this.getTenantBySchema(tenantIdOrSchema);
    }

    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantIdOrSchema}`);
    }

    // Criar um novo cliente Prisma para o schema deste tenant
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Configurar o schema para as operações
    await prismaClient.$executeRawUnsafe(
      `SET search_path TO "${tenant.schema}"`,
    );

    // Armazenar o cliente para uso futuro
    this.tenantPrismaClients.set(tenant.id, prismaClient);
    this.tenantPrismaClients.set(tenant.schema, prismaClient);

    return prismaClient;
  }

  async listTenants(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      include: {
        plan: true,
      },
    });
  }
}
