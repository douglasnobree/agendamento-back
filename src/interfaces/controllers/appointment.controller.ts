import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';
import { PostgresService } from '../../infra/db/postgres/postgres.service';

class CreateAppointmentDto {
  clientId: string;
  serviceId: string;
  staffId: string;
  scheduledAt: Date;
  status: string; // 'pending' | 'confirmed' | 'cancelled'
}

class UpdateAppointmentDto {
  clientId?: string;
  serviceId?: string;
  staffId?: string;
  scheduledAt?: Date;
  status?: string;
}

@Controller('tenant/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly postgres: PostgresService) {}

  @Get()
  @Roles('owner', 'admin')
  async findAll(
    req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const tenantSchema = req.tenantSchema;
    let query = `SELECT * FROM "${tenantSchema}"."Appointment"`;
    const params: any[] = [];
    const where: string[] = [];
    if (startDate && endDate) {
      params.push(startDate, endDate);
      where.push(
        `scheduledAt BETWEEN $${params.length - 1} AND $${params.length}`,
      );
    }
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (where.length) {
      query += ' WHERE ' + where.join(' AND ');
    }
    const result = await this.postgres.query(query, params);
    return result.rows;
  }

  @Get('client/:clientId')
  @Roles('owner', 'admin', 'client')
  async findByClient(req: any, @Param('clientId') clientId: string) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `SELECT * FROM "${tenantSchema}"."Appointment" WHERE clientId = $1`,
      [clientId],
    );
    return result.rows;
  }

  @Get(':id')
  @Roles('owner', 'admin', 'client')
  async findOne(req: any, @Param('id') id: string) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `SELECT * FROM "${tenantSchema}"."Appointment" WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  @Post()
  @Roles('owner', 'admin', 'client')
  async create(req: any, @Body() data: CreateAppointmentDto) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `INSERT INTO "${tenantSchema}"."Appointment" (id, clientId, serviceId, staffId, scheduledAt, status, createdAt) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
      [
        data.clientId,
        data.serviceId,
        data.staffId,
        data.scheduledAt,
        data.status,
      ],
    );
    return result.rows[0];
  }

  @Put(':id')
  @Roles('owner', 'admin', 'client')
  async update(
    req: any,
    @Param('id') id: string,
    @Body() data: UpdateAppointmentDto,
  ) {
    const tenantSchema = req.tenantSchema;
    const result = await this.postgres.query(
      `UPDATE "${tenantSchema}"."Appointment" SET clientId = $1, serviceId = $2, staffId = $3, scheduledAt = $4, status = $5 WHERE id = $6 RETURNING *`,
      [
        data.clientId,
        data.serviceId,
        data.staffId,
        data.scheduledAt,
        data.status,
        id,
      ],
    );
    return result.rows[0];
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  async remove(req: any, @Param('id') id: string) {
    const tenantSchema = req.tenantSchema;
    await this.postgres.query(
      `DELETE FROM "${tenantSchema}"."Appointment" WHERE id = $1`,
      [id],
    );
    return { success: true };
  }
}
