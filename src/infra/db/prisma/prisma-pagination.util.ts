import { Prisma } from '@prisma/client';
import { PaginationQuery, PaginatedResult, PaginationMeta } from '../../../application/dtos/pagination.dto';

/**
 * Utilitário genérico para paginação com Prisma.
 * O model Prisma deve possuir os métodos findMany e count.
 */
export class PrismaPagination {
  static async paginate<T, M extends { findMany: Function; count: Function }>(
    prismaModel: M,
    args: any = {},
    pagination: PaginationQuery,
    mapFn?: (item: any) => T,
  ): Promise<PaginatedResult<T>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      prismaModel.findMany({ ...args, skip, take: limit }),
      prismaModel.count(args?.where ? { where: args.where } : {}),
    ]);
    const mapped = mapFn ? items.map(mapFn) : items;
    const meta: PaginationMeta = {
      totalItems,
      itemCount: mapped.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
    return { items: mapped, meta };
  }
}
