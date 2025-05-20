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
export class StaffController {
  @Get()
  async findAll(@TenantDB() db: PrismaClient) {
    return db.staff.findMany();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @TenantDB() db: PrismaClient) {
    return db.staff.findUnique({
      where: { id },
    });
  }

  @Post()
  async create(@Body() data: CreateStaffDto, @TenantDB() db: PrismaClient) {
    return db.staff.create({
      data,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateStaffDto,
    @TenantDB() db: PrismaClient,
  ) {
    return db.staff.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @TenantDB() db: PrismaClient) {
    return db.staff.delete({
      where: { id },
    });
  }
}
