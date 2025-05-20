import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TenantDB } from '../../infra/decorators/tenant-db.decorator';
import { PrismaClient } from '@prisma/client';
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
} from '@nestjs/swagger';
import { TenantMiddleware } from 'src/infra/middleware/tenant.middleware';

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
export class ServiceController {
  @Get()
  @Roles('owner', 'admin', 'client')
  @ApiOperation({ summary: 'Listar todos os serviços' })
  @ApiResponse({
    status: 200,
    description: 'Lista de serviços retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async findAll(@TenantDB() db: PrismaClient) {
    // O decorador @TenantDB() agora obterá corretamente o PrismaClient específico para o tenant
    return db.service.findMany();
  }
  @Get(':id')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({ summary: 'Obter um serviço pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({ status: 200, description: 'Serviço encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async findOne(@Param('id') id: string, @TenantDB() db: PrismaClient) {
    return db.service.findUnique({
      where: { id },
    });
  }
  @Post()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Criar um novo serviço' })
  @ApiResponse({ status: 201, description: 'Serviço criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async create(@Body() data: CreateServiceDto, @TenantDB() db: PrismaClient) {
    return db.service.create({
      data,
    });
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
    @Param('id') id: string,
    @Body() data: UpdateServiceDto,
    @TenantDB() db: PrismaClient,
  ) {
    return db.service.update({
      where: { id },
      data,
    });
  }
  @Delete(':id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Remover um serviço' })
  @ApiParam({ name: 'id', description: 'ID do serviço' })
  @ApiResponse({ status: 200, description: 'Serviço removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Serviço não encontrado' })
  async remove(@Param('id') id: string, @TenantDB() db: PrismaClient) {
    return db.service.delete({
      where: { id },
    });
  }
}
