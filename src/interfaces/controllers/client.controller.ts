import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';
import { TenantDB } from '../../infra/decorators/tenant-db.decorator';
import { PrismaClient } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiProperty,
  ApiBearerAuth,
} from '@nestjs/swagger';

class CreateClientDto {
  @ApiProperty({ description: 'Nome do cliente', example: 'João Silva' })
  name: string;

  @ApiProperty({ description: 'Email do cliente', example: 'joao@example.com' })
  email: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '11987654321',
    required: false,
  })
  phone?: string;
}

class UpdateClientDto {
  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João Silva',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '11987654321',
    required: false,
  })
  phone?: string;
}

@Controller('api/tenant/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Clientes')
@ApiBearerAuth()
export class ClientController {
  @Get()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async findAll(@TenantDB() db: PrismaClient) {
    return db.client.findMany();
  }
  @Get(':id')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({ summary: 'Obter um cliente pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Param('id') id: string, @TenantDB() db: PrismaClient) {
    return db.client.findUnique({
      where: { id },
    });
  }
  @Post()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async create(@Body() data: CreateClientDto, @TenantDB() db: PrismaClient) {
    return db.client.create({
      data,
    });
  }

  @Put(':id')
  @Roles('owner', 'admin')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateClientDto,
    @TenantDB() db: PrismaClient,
  ) {
    return db.client.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  async remove(@Param('id') id: string, @TenantDB() db: PrismaClient) {
    return db.client.delete({
      where: { id },
    });
  }
}
