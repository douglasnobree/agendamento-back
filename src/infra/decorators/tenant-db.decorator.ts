import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantService } from '../prisma/tenant.service';
import { ModuleRef } from '@nestjs/core';

// Referência global para o ModuleRef
let moduleRefGlobal: ModuleRef;

// Função para configurar o ModuleRef
export function setModuleRef(moduleRef: ModuleRef) {
  moduleRefGlobal = moduleRef;
}

export const TenantDB = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID não encontrado na requisição');
    }

    console.log(
      `TenantDB decorator: Obtaining Prisma client for tenant ID: ${tenantId}`,
    );

    // Obter o TenantService usando o ModuleRef
    const tenantService = moduleRefGlobal.get(TenantService, { strict: false });

    if (!tenantService) {
      throw new Error('TenantService não disponível');
    }

    // Obter o PrismaClient específico para o tenant
    const prismaClient = await tenantService.getTenantPrismaClient(tenantId);
    return prismaClient;
  },
);
