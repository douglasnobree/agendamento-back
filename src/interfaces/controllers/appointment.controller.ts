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
import { TenantDB } from '../../infra/decorators/tenant-db.decorator';
import { PrismaClient } from '@prisma/client';

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
  @Get()
  @Roles('owner', 'admin')
  async findAll(
    @TenantDB() db: PrismaClient,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const where: any = {};

    if (startDate && endDate) {
      where.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    return db.appointment.findMany({
      where,
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });
  }

  @Get('client/:clientId')
  @Roles('owner', 'admin', 'client')
  async findByClient(
    @Param('clientId') clientId: string,
    @TenantDB() db: PrismaClient,
  ) {
    return db.appointment.findMany({
      where: { clientId },
      include: {
        service: true,
        staff: true,
      },
    });
  }

  @Get(':id')
  @Roles('owner', 'admin', 'client')
  async findOne(@Param('id') id: string, @TenantDB() db: PrismaClient) {
    return db.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });
  }

  @Post()
  @Roles('owner', 'admin', 'client')
  async create(
    @Body() data: CreateAppointmentDto,
    @TenantDB() db: PrismaClient,
  ) {
    return db.appointment.create({
      data,
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });
  }

  @Put(':id')
  @Roles('owner', 'admin', 'client')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateAppointmentDto,
    @TenantDB() db: PrismaClient,
  ) {
    return db.appointment.update({
      where: { id },
      data,
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  async remove(@Param('id') id: string, @TenantDB() db: PrismaClient) {
    return db.appointment.delete({
      where: { id },
    });
  }
}
