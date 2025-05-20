import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../prisma/tenant.service';

// Estendendo o tipo Request para incluir tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantSchema?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(
    req: Request & { tenantId?: string },
    res: Response,
    next: NextFunction,
  ) {
    // Obter o tenant do token JWT ou do header
    // @ts-ignore
    const tenant = req.user?.tenantId || (req.headers['x-tenant-id'] as string);

    if (!tenant) {
      return res.status(400).json({ message: 'Tenant ID não encontrado' });
    }

    // Adicionar o tenantId à requisição
    req.tenantId = tenant;

    // Recuperar o tenantId do header, query ou da URL
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      (req.query.tenantId as string) ||
      this.extractTenantFromPath(req.path);

    if (tenantId) {
      try {
        const tenant = await this.tenantService.getTenantById(tenantId);

        if (tenant) {
          req.tenantId = tenant.id;
          req.tenantSchema = tenant.schema;
          console.log(`Tenant identificado: ${tenant.name} (${tenant.schema})`);
        } else {
          console.warn(`Tenant não encontrado: ${tenantId}`);
        }
      } catch (error) {
        console.error('Erro ao buscar tenant:', error);
      }
    }

    next();
  }

  // Extrai o ID do tenant da URL se estiver no formato /api/tenant/{tenantId}/...
  private extractTenantFromPath(path: string): string | null {
    const match = path.match(/^\/api\/tenant\/([^\/]+)\//);
    return match ? match[1] : null;
  }
}
