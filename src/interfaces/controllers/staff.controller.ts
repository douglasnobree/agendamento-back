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
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

class CreateStaffDto {
  name: string;
  email: string;
  role: string;
}

class UpdateStaffDto {
  name?: string;
  email?: string;
  role?: string;
}

@Controller('api/tenant/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'admin')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Identificador do tenant',
  required: true,
  schema: { type: 'string' },
})
export class StaffController {
  constructor(private readonly postgres: PostgresService) {}

  @Get()
  async findAll(req: any) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `SELECT * FROM "${tenantSchema}"."Staff"`,
    );
    return result.rows;
  }

  @Get(':id')
  async findOne(req: any, @Param('id') id: string) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `SELECT * FROM "${tenantSchema}"."Staff" WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  @Post()
  async create(req: any, @Body() data: CreateStaffDto) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `INSERT INTO "${tenantSchema}"."Staff" (id, name, email, role, createdAt) VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`,
      [data.name, data.email, data.role],
    );
    return result.rows[0];
  }

  @Put(':id')
  async update(
    req: any,
    @Param('id') id: string,
    @Body() data: UpdateStaffDto,
  ) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `UPDATE "${tenantSchema}"."Staff" SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *`,
      [data.name, data.email, data.role, id],
    );
    return result.rows[0];
  }

  @Delete(':id')
  async remove(req: any, @Param('id') id: string) {
    const tenantSchema = req.tenantSchema;
    await this.postgres.query(
      `DELETE FROM "${tenantSchema}"."Staff" WHERE id = $1`,
      [id],
    );
    return { success: true };
  }
}
