export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class PaginationHelper {
  static getPaginationParams(query: any): PaginationOptions {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const sort = query.sort || "-createdAt";

    return { page, limit, sort };
  }

  static buildPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginationResult<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
