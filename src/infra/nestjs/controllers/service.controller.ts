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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiProperty,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { ServiceUsecaseProxyModule } from '../../../application/usecases/Services/service-usecase-proxy.module';
import { UseCaseProxy } from '../../../application/usecases/usecase-proxy';
import { ListServicesUseCase } from '../../../application/usecases/Services/service-useCase-list';
import { GetServiceByIdUseCase } from '../../../application/usecases/Services/service-useCase-getById';
import { CreateServiceUseCase } from '../../../application/usecases/Services/service-useCase-create';
import { UpdateServiceUseCase } from '../../../application/usecases/Services/service-useCase-update';
import { RemoveServiceUseCase } from '../../../application/usecases/Services/service-useCase-remove';
import { CreateServiceDto, UpdateServiceDto } from '../../dtos/service.dto';

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
    @Inject(ServiceUsecaseProxyModule.LIST_SERVICES_USE_CASE)
    private readonly listServicesUseCaseProxy: UseCaseProxy<ListServicesUseCase>,
    @Inject(ServiceUsecaseProxyModule.GET_SERVICE_BY_ID_USE_CASE)
    private readonly getServiceByIdUseCaseProxy: UseCaseProxy<GetServiceByIdUseCase>,
    @Inject(ServiceUsecaseProxyModule.CREATE_SERVICE_USE_CASE)
    private readonly createServiceUseCaseProxy: UseCaseProxy<CreateServiceUseCase>,
    @Inject(ServiceUsecaseProxyModule.UPDATE_SERVICE_USE_CASE)
    private readonly updateServiceUseCaseProxy: UseCaseProxy<UpdateServiceUseCase>,
    @Inject(ServiceUsecaseProxyModule.REMOVE_SERVICE_USE_CASE)
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
    return this.listServicesUseCaseProxy
      .getInstance()
      .execute({ schema: tenantSchema });
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
      .execute({ schema: tenantSchema, id });
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
      .execute({ schema: tenantSchema, data });
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
      .execute({ schema: tenantSchema, data: { id, ...data } });
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
      .execute({ schema: tenantSchema, id });
    return { success: true };
  }
}
