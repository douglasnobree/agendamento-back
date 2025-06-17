import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationQuery } from '../../application/dtos/pagination.dto';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationQuery => {
    const request = ctx.switchToHttp().getRequest();
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    return { page, limit };
  },
);
