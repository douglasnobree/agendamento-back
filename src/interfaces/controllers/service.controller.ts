import { Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiProperty,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { UsecaseProxyModule } from '../../application/usecases/usecase-proxy.module';
import { UseCaseProxy } from '../../application/usecases/usecase-proxy';
import { ListServicesUseCase } from '../../application/usecases/Services/service-useCase-list';
import { GetServiceByIdUseCase } from '../../application/usecases/Services/service-useCase-getById';
import { CreateServiceUseCase } from '../../application/usecases/Services/service-useCase-create';
import { UpdateServiceUseCase } from '../../application/usecases/Services/service-useCase-update';
import { RemoveServiceUseCase } from '../../application/usecases/Services/service-useCase-remove';

// DTOs
class CreateServiceDto {
  @ApiProperty({ description: 'Nome do serviço', example: 'Corte de cabelo' })
  name: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Corte com tesoura e máquina',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: 'Duração do serviço em minutos', example: 30 })
  duration: number;

  @ApiProperty({ description: 'Preço do serviço', example: 50.0 })
  price: number;
}

class UpdateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Corte de cabelo',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Corte com tesoura e máquina',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Duração do serviço em minutos',
    example: 30,
    required: false,
  })
  duration?: number;

  @ApiProperty({
    description: 'Preço do serviço',
    example: 50.0,
    required: false,
  })
  price?: number;
}

@Controller('api/tenant/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Serviços')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do tenant',
  required: true,
  schema: { type: 'string' },
})
export class ServiceController {
  constructor(
    @Inject(UsecaseProxyModule.LIST_SERVICES_USE_CASE)
    private readonly listServicesUseCaseProxy: UseCaseProxy<ListServicesUseCase>,
    @Inject(UsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE)
    private readonly getServiceByIdUseCaseProxy: UseCaseProxy<GetServiceByIdUseCase>,
    @Inject(UsecaseProxyModule.CREATE_SERVICE_USE_CASE)
    private readonly createServiceUseCaseProxy: UseCaseProxy<CreateServiceUseCase>,
    @Inject(UsecaseProxyModule.UPDATE_SERVICE_USE_CASE)
    private readonly updateServiceUseCaseProxy: UseCaseProxy<UpdateServiceUseCase>,
    @Inject(UsecaseProxyModule.REMOVE_SERVICE_USE_CASE)
    private readonly removeServiceUseCaseProxy: UseCaseProxy<RemoveServiceUseCase>,
  ) {}

  @Get()
  @Roles('owner', 'admin', 'client')
  @ApiOperation({ summary: 'Listar todos os serviços' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async findAll(@Req() req: Request) {
    const tenantSchema = (req as any).tenantSchema;
    return this.listServicesUseCaseProxy.getInstance().execute(tenantSchema);
  }

  @Get(':id')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({ summary: 'Obter um serviço pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({ status: 200, description: 'Serviço encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    return this.getServiceByIdUseCaseProxy
      .getInstance()
      .execute(tenantSchema, id);
  }

  @Post()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Criar um novo serviço' })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async create(@Req() req: Request, @Body() data: CreateServiceDto) {
    const tenantSchema = (req as any).tenantSchema;
    console.log('Creating service with data:', data);
    return this.createServiceUseCaseProxy
      .getInstance()
      .execute(tenantSchema, data);
  }

  @Put(':id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Atualizar um serviço existente' })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({ status: 200, description: 'Serviço atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: UpdateServiceDto,
  ) {
    const tenantSchema = (req as any).tenantSchema;
    return this.updateServiceUseCaseProxy
      .getInstance()
      .execute(tenantSchema, { id, ...data });
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Remover um serviço' })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({ status: 200, description: 'Serviço removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    await this.removeServiceUseCaseProxy
      .getInstance()
      .execute(tenantSchema, id);
    return { success: true };
  }
}
