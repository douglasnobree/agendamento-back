import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Tenant } from '../../../../domain/entities/tenant.entity';
import { TenantRepository } from '../../../../domain/repositoriesInterface/tenant.repository-interface';

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

  async createTenantWithSchema(input: { name: string; ownerEmail: string; planId: string }): Promise<Tenant> {
    // Exemplo: cria o tenant e o schema (a lógica real pode envolver migration/seed)
    const schema = `tenant_${Date.now()}`;
    // Cria o registro do tenant
    const data = await this.prisma.tenant.create({
      data: {
        name: input.name,
        ownerEmail: input.ownerEmail,
        planId: input.planId,
        schema,
      },
    });
    // Aqui você pode rodar migrations/seed para o novo schema, se necessário
    return Tenant.fromPersistence(data);
  }
}
