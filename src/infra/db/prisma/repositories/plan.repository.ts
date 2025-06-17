import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Plan } from '../../../../domain/entities/plan.entity';
import { PlanRepository } from '../../../../domain/repositoriesInterface/plan.repository-interface';

@Injectable()
export class PlanRepositoryPrisma implements PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Plan[]> {
    const data = await this.prisma.plan.findMany();
    return data.map(row => new Plan(row.id, row.name, row.description, row.price, row.features));
  }

  async findById(id: string): Promise<Plan> {
    const row = await this.prisma.plan.findUnique({ where: { id } });
    if (!row) return null;
    return new Plan(row.id, row.name, row.description, row.price, row.features);
  }

  async create(plan: Partial<Plan>): Promise<Plan> {
    if (!plan.name || !plan.description || !plan.price || !plan.features) {
      throw new Error('Campos obrigatórios ausentes para criar o plano');
    }
    const row = await this.prisma.plan.create({
      data: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        features: plan.features,
      },
    });
    return new Plan(row.id, row.name, row.description, row.price, row.features);
  }

  async update(id: string, plan: Partial<Plan>): Promise<Plan> {
    const row = await this.prisma.plan.update({ where: { id }, data: plan });
    if (!row) return null;
    return new Plan(row.id, row.name, row.description, row.price, row.features);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.plan.delete({ where: { id } });
  }
}
