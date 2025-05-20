import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../prisma/tenant.service';

@Injectable()
export class TenantSchemaMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

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
        const tenant = await this.tenantService.getTenantById(tenantId);
        if (!tenant) {
          return res.status(404).json({ message: 'Tenant não encontrado' });
        }
        schema = tenant.schema;
      }
      // Disponibiliza o schema na request
      (req as any).tenantSchema = schema;
      console.log(`Tenant schema identificado v2: ${schema}`);
      next();
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Erro ao resolver tenant', error: err.message });
    }
  }
}
