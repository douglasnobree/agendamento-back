import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Client } from '../../../../domain/entities/client.entity';
import { ClientRepository } from '../../../../domain/repositoriesInterface/client.repository-interface';

@Injectable()
export class ClientRepositoryPrisma implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async setSchema(schema: string) {
    await this.prisma.$executeRawUnsafe(`SET search_path TO "${schema}"`);
  }

  async findByEmail(schema: string, email: string): Promise<Client | null> {
    await this.setSchema(schema);
    const data = await this.prisma.client.findUnique({ where: { email } });
    if (!data) return null;
    return Client.fromPersistence(data);
  }

  async findById(schema: string, id: string): Promise<Client | null> {
    await this.setSchema(schema);
    const data = await this.prisma.client.findUnique({ where: { id } });
    if (!data) return null;
    return Client.fromPersistence(data);
  }

  async findAll(schema: string): Promise<Client[]> {
    await this.setSchema(schema);
    const data = await this.prisma.client.findMany();
    return data.map(Client.fromPersistence);
  }

  async save(schema: string, client: Client): Promise<void> {
    await this.setSchema(schema);
    const props = client.toPersistence();
    await this.prisma.client.create({ data: props });
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.setSchema(schema);
    await this.prisma.client.delete({ where: { id } });
  }

  async update(schema: string, client: Client): Promise<void> {
    await this.setSchema(schema);
    const props = client.toPersistence();
    await this.prisma.client.update({ where: { id: props.id }, data: props });
  }
}
