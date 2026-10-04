/** Cross-cutting shared types. */

export type UUID = string;

export interface Pagination {
  readonly page: number; // 1-based
  readonly pageSize: number;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export function paginate<T>(items: readonly T[], total: number, p: Pagination): Paginated<T> {
  return { items, total, page: p.page, pageSize: p.pageSize };
}

export function offset(p: Pagination): number {
  return (p.page - 1) * p.pageSize;
}
