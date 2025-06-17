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
  Query,
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
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { Client } from '../../domain/entities/client.entity';
import { PaginatedResult } from '../../application/dtos/pagination.dto';
import {
  Pagination,
  ApiPaginationQuery,
} from '../../infra/decorators/pagination.decorator';

@ApiExtraModels(CreateClientDto, UpdateClientDto)
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
  @ApiOperation({ summary: 'Listar todos os clientes (paginado)' })
  @ApiPaginationQuery()
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de clientes',
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(CreateClientDto) },
        },
        meta: {
          type: 'object',
          properties: {
            totalItems: { type: 'number', example: 100 },
            itemCount: { type: 'number', example: 10 },
            itemsPerPage: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
            currentPage: { type: 'number', example: 1 },
          },
        },
      },
      example: {
        items: [
          {
            id: 'uuid',
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '11987654321',
            createdAt: '2025-06-17T19:00:00Z',
          },
        ],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async findAll(
    @Req() req: Request,
    @Pagination() pag: { page?: number; limit?: number },
  ): Promise<PaginatedResult<Client>> {
    const tenantSchema = (req as any).tenantSchema;
    return this.listClientsUseCaseProxy
      .getInstance()
      .execute({ schema: tenantSchema, page: pag.page, limit: pag.limit });
  }

  @Get(':id')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({ summary: 'Obter um cliente pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado com sucesso',
    schema: { $ref: getSchemaPath(CreateClientDto) },
    examples: {
      exemplo: {
        summary: 'Exemplo de retorno',
        value: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '11987654321',
          createdAt: '2025-06-17T19:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    return this.getClientByIdUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      id,
    });
  }

  @Post()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
    schema: { $ref: getSchemaPath(CreateClientDto) },
    examples: {
      exemplo: {
        summary: 'Exemplo de retorno',
        value: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '11987654321',
          createdAt: '2025-06-17T19:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async create(@Req() req: Request, @Body() data: CreateClientDto) {
    const tenantSchema = (req as any).tenantSchema;
    return this.createClientUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      data,
    });
  }

  @Put(':id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Atualizar um cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
    schema: { $ref: getSchemaPath(CreateClientDto) },
    examples: {
      exemplo: {
        summary: 'Exemplo de retorno',
        value: {
          id: 'uuid',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '11987654321',
          createdAt: '2025-06-17T19:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() data: UpdateClientDto,
  ) {
    const tenantSchema = (req as any).tenantSchema;
    return this.updateClientUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      data: { id, ...data },
    });
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Remover um cliente' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente removido com sucesso',
    schema: {
      example: { success: true },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const tenantSchema = (req as any).tenantSchema;
    await this.removeClientUseCaseProxy.getInstance().execute({
      schema: tenantSchema,
      id,
    });
    return { success: true };
  }
}
