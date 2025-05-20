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
} from '@nestjs/swagger';
import { PostgresService } from '../../infra/db/postgres/postgres.service';

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
  constructor(private readonly postgres: PostgresService) {}

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
    const result = await this.postgres.query(
      `SELECT * FROM "${tenantSchema}"."Service"`,
    );
    return result.rows;
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
    const result = await this.postgres.query(
      `SELECT * FROM "${tenantSchema}"."Service" WHERE id = $1`,
      [id],
    );
    return result.rows[0];
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
    const result = await this.postgres.query(
      `INSERT INTO "${tenantSchema}"."Service" (id, name, description, duration, price, createdAt) VALUES (gen_random_uuid(), $1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`,
      [data.name, data.description, data.duration, data.price],
    );
    return result.rows[0];
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
    const result = await this.postgres.query(
      `UPDATE "${tenantSchema}"."Service" SET name = $1, description = $2, duration = $3, price = $4 WHERE id = $5 RETURNING *`,
      [data.name, data.description, data.duration, data.price, id],
    );
    return result.rows[0];
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
    await this.postgres.query(
      `DELETE FROM "${tenantSchema}"."Service" WHERE id = $1`,
      [id],
    );
    return { success: true };
  }
}
