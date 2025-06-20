import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Executa consultas SQL diretas no banco de dados, útil para especificar o schema explicitamente
   * @param sql Consulta SQL com placeholders $1, $2, etc.
   * @param params Parâmetros para a consulta
   * @returns Resultado da consulta
   */
  async executeRaw<T = any>(sql: string, params: any[] = []): Promise<T> {
    return this.$queryRawUnsafe<T>(sql, ...params);
  }

  async getTenantPrisma(schema: string) {
    console.log(`Using Prisma client for schema: ${schema}`);
    console.log(`Database URL: ${process.env.DATABASE_URL}`);
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + `?schema=${schema}`,
        },
      },
    });
  }
}
