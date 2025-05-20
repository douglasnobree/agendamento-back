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
import { PrismaService } from '../../infra/prisma/prisma.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { RolesGuard } from '../../infra/auth/roles.guard';
import { Roles } from '../../infra/decorators/roles.decorator';

class CreatePlanDto {
  name: string;
  description: string;
  price: number;
  features: any;
}

class UpdatePlanDto {
  name?: string;
  description?: string;
  price?: number;
  features?: any;
}

@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PlanController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.plan.findMany();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.plan.findUnique({
      where: { id },
      include: {
        tenants: true,
      },
    });
  }

  @Post()
  async create(@Body() data: CreatePlanDto) {
    return this.prisma.plan.create({
      data,
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdatePlanDto) {
    return this.prisma.plan.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prisma.plan.delete({
      where: { id },
    });
  }
}
