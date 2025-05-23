import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UseCaseProxy } from '../../application/usecases/usecase-proxy';
import { GetTenantByIdUseCase } from '../../application/usecases/Tenants/tenant-useCase-getById';
import { GetTenantBySchemaUseCase } from '../../application/usecases/Tenants/tenant-useCase-getBySchema';
import { TenantUsecaseProxyModule } from '../../application/usecases/Tenants/tenant-usecase-proxy.module';

@Injectable()
export class TenantSchemaMiddleware implements NestMiddleware {
  constructor(
    @Inject(TenantUsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE)
    private readonly getTenantByIdUseCaseProxy: UseCaseProxy<GetTenantByIdUseCase>,
    @Inject(TenantUsecaseProxyModule.GET_TENANT_BY_SCHEMA_USE_CASE)
    private readonly getTenantBySchemaUseCaseProxy: UseCaseProxy<GetTenantBySchemaUseCase>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.header('x-tenant-id');
    if (!tenantId) {
      return res
        .status(400)
        .json({ message: 'x-tenant-id header obrigatório' });
    }
    try {
      // Busca o schema do tenant pelo id ou schema direto
      let schema = tenantId;
      if (!tenantId.startsWith('tenant_')) {
        try {
          const tenant = await this.getTenantByIdUseCaseProxy
            .getInstance()
            .execute(tenantId);
          schema = tenant.schema;
        } catch (error) {
          return res.status(404).json({ message: 'Tenant não encontrado' });
        }
      } else {
        try {
          // Verificar se o schema existe
          await this.getTenantBySchemaUseCaseProxy
            .getInstance()
            .execute(schema);
        } catch (error) {
          return res.status(404).json({ message: 'Tenant não encontrado' });
        }
      }

      // Disponibiliza o schema na request
      (req as any).tenantSchema = schema;
      console.log(`Tenant schema identificado: ${schema}`);
      next();
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Erro ao resolver tenant', error: err.message });
    }
  }
}
