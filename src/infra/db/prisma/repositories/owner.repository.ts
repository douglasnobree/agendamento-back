import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Owner } from '../../../../domain/entities/owner.entity';
import { OwnerRepository } from '../../../../domain/repositoriesInterface/owner.repository-interface';

@Injectable()
export class OwnerRepositoryPrisma implements OwnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async setSchema(schema: string) {
    await this.prisma.$executeRawUnsafe(`SET search_path TO "${schema}"`);
  }

  async findByEmail(schema: string, email: string): Promise<Owner | null> {
    await this.setSchema(schema);
    const data = await this.prisma.owner.findUnique({ where: { email } });
    if (!data) return null;
    return Owner.fromPersistence(data);
  }

  async findById(schema: string, id: string): Promise<Owner | null> {
    await this.setSchema(schema);
    const data = await this.prisma.owner.findUnique({ where: { id } });
    if (!data) return null;
    return Owner.fromPersistence(data);
  }

  async findAll(schema: string): Promise<Owner[]> {
    await this.setSchema(schema);
    const data = await this.prisma.owner.findMany();
    return data.map(Owner.fromPersistence);
  }

  async save(schema: string, owner: Owner): Promise<void> {
    await this.setSchema(schema);
    const props = owner.toPersistence();
    await this.prisma.owner.create({ data: props });
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.setSchema(schema);
    await this.prisma.owner.delete({ where: { id } });
  }

  async update(schema: string, owner: Owner): Promise<void> {
    await this.setSchema(schema);
    const props = owner.toPersistence();
    await this.prisma.owner.update({ where: { id: props.id }, data: props });
  }
}
