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
import { PostgresService } from '../../infra/db/postgres/postgres.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiProperty,
  ApiBearerAuth,
  ApiHeader,
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
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do tenant',
  required: true,
  schema: { type: 'string' },
})
export class ClientController {
  constructor(private readonly postgres: PostgresService) {}

  @Get()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async findAll(req: any) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `SELECT * FROM "${tenantSchema}"."Client"`,
    );
    return result.rows;
  }

  @Get(':id')
  @Roles('owner', 'admin', 'client')
  @ApiOperation({ summary: 'Obter um cliente pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(req: any, @Param('id') id: string) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `SELECT * FROM "${tenantSchema}"."Client" WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  @Post()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso proibido' })
  async create(req: any, @Body() data: CreateClientDto) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `INSERT INTO "${tenantSchema}"."Client" (id, email, name, phone, createdAt) VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`,
      [data.email, data.name, data.phone],
    );
    return result.rows[0];
  }

  @Put(':id')
  @Roles('owner', 'admin')
  async update(
    req: any,
    @Param('id') id: string,
    @Body() data: UpdateClientDto,
  ) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `UPDATE "${tenantSchema}"."Client" SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *`,
      [data.name, data.email, data.phone, id],
    );
    return result.rows[0];
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  async remove(req: any, @Param('id') id: string) {
    const tenantSchema = req.tenantSchema;
    await this.postgres.query(
      `DELETE FROM "${tenantSchema}"."Client" WHERE id = $1`,
      [id],
    );
    return { success: true };
  }
}
