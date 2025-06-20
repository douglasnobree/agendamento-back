import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { CreateTenantDto, TenantResponseDto } from '../../dtos/tenant.dto';
import { TenantUsecaseProxyModule } from '../../../application/usecases/Tenants/tenant-usecase-proxy.module';
import { UseCaseProxy } from '../../../application/usecases/usecase-proxy';
import { ListTenantsUseCase } from '../../../application/usecases/Tenants/tenant-useCase-list';
import { CreateTenantUseCase } from '../../../application/usecases/Tenants/tenant-useCase-create';
import { GetTenantByIdUseCase } from '../../../application/usecases/Tenants/tenant-useCase-getById';

@Controller('admin/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiTags('Tenants')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do tenant',
  required: false,
  schema: { type: 'string' },
})
export class TenantController {
  constructor(
    @Inject(TenantUsecaseProxyModule.LIST_TENANTS_USE_CASE)
    private readonly listTenantsUseCaseProxy: UseCaseProxy<ListTenantsUseCase>,
    @Inject(TenantUsecaseProxyModule.CREATE_TENANT_USE_CASE)
    private readonly createTenantUseCaseProxy: UseCaseProxy<CreateTenantUseCase>,
    @Inject(TenantUsecaseProxyModule.GET_TENANT_BY_ID_USE_CASE)
    private readonly getTenantByIdUseCaseProxy: UseCaseProxy<GetTenantByIdUseCase>,
  ) {}
  @Post()
  @ApiOperation({ summary: 'Criar um novo tenant' })
  @ApiResponse({ status: 201, description: 'Tenant criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiBody({
    type: CreateTenantDto,
    description: 'Dados do tenant',
  })
  async createTenant(
    @Body() data: CreateTenantDto,
  ): Promise<TenantResponseDto> {
    try {
      const tenant = await this.createTenantUseCaseProxy
        .getInstance()
        .execute(data);
      return {
        id: tenant.id,
        name: tenant.name,
        schema: tenant.schema,
        ownerEmail: tenant.ownerEmail,
        planId: tenant.planId,
        createdAt: tenant.createdAt,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao criar tenant: ' + error.message,
      );
    }
  }
  @Get()
  @ApiOperation({ summary: 'Listar todos os tenants' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants retornada com sucesso',
    type: TenantResponseDto,
    isArray: true,
  })
  async listTenants() {
    const tenants = await this.listTenantsUseCaseProxy.getInstance().execute();
    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      schema: t.schema,
      ownerEmail: t.ownerEmail,
      planId: t.planId,
      createdAt: t.createdAt,
    }));
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obter um tenant pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do tenant' })
  @ApiResponse({ status: 200, description: 'Tenant encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  async getTenant(@Param('id') id: string): Promise<TenantResponseDto> {
    const tenant = await this.getTenantByIdUseCaseProxy
      .getInstance()
      .execute(id);
    if (!tenant) {
      throw new BadRequestException('Tenant não encontrado');
    }
    return {
      id: tenant.id,
      name: tenant.name,
      schema: tenant.schema,
      ownerEmail: tenant.ownerEmail,
      planId: tenant.planId,
      createdAt: tenant.createdAt,
    };
  }
}
