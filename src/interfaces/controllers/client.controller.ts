import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Inject,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';
import { ClientUsecaseProxyModule } from '../../application/usecases/Clients/client-usecase-proxy.module';
import { UseCaseProxy } from '../../application/usecases/usecase-proxy';
import { ListClientsUseCase } from '../../application/usecases/Clients/client-useCase-list';
import { GetClientByIdUseCase } from '../../application/usecases/Clients/client-useCase-getById';
import { CreateClientUseCase } from '../../application/usecases/Clients/client-useCase-create';
import { UpdateClientUseCase } from '../../application/usecases/Clients/client-useCase-update';
import { RemoveClientUseCase } from '../../application/usecases/Clients/client-useCase-remove';
import { CreateClientDto, UpdateClientDto } from '../dtos/client.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiProperty,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';

@Controller('api/tenant/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Clientes')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do tenant',
  required: true,
  schema: { type: 'string' },
})
export class ClientController {
  constructor(
    @Inject(ClientUsecaseProxyModule.LIST_CLIENTS_USE_CASE)
    private readonly listClientsUseCaseProxy: UseCaseProxy<ListClientsUseCase>,
    @Inject(ClientUsecaseProxyModule.GET_CLIENT_BY_ID_USE_CASE)
    private readonly getClientByIdUseCaseProxy: UseCaseProxy<GetClientByIdUseCase>,
    @Inject(ClientUsecaseProxyModule.CREATE_CLIENT_USE_CASE)
    private readonly createClientUseCaseProxy: UseCaseProxy<CreateClientUseCase>,
    @Inject(ClientUsecaseProxyModule.UPDATE_CLIENT_USE_CASE)
    private readonly updateClientUseCaseProxy: UseCaseProxy<UpdateClientUseCase>,
    @Inject(ClientUsecaseProxyModule.REMOVE_CLIENT_USE_CASE)
    private readonly removeClientUseCaseProxy: UseCaseProxy<RemoveClientUseCase>,
  ) {}

  @Get()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async findAll(@Req() req: Request) {
    const tenantSchema = (req as any).tenantSchema;
    console.log('tenantSchema', tenantSchema);
    return this.listClientsUseCaseProxy.getInstance().execute(tenantSchema);
  }

  @Get(':id')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({ summary: 'Obter um cliente pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    return this.getClientByIdUseCaseProxy
      .getInstance()
      .execute(tenantSchema, id);
  }

  @Post()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async create(@Req() req: Request, @Body() data: CreateClientDto) {
    const tenantSchema = (req as any).tenantSchema;
    return this.createClientUseCaseProxy
      .getInstance()
      .execute(tenantSchema, data);
  }

  @Put(':id')
  @Roles('owner', 'admin')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: UpdateClientDto,
  ) {
    const tenantSchema = (req as any).tenantSchema;
    return this.updateClientUseCaseProxy
      .getInstance()
      .execute(tenantSchema, { id, ...data });
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    await this.removeClientUseCaseProxy.getInstance().execute(tenantSchema, id);
    return { success: true };
  }
}
