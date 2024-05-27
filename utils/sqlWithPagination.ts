import type { MySqlSelect } from 'drizzle-orm/mysql-core'

/** @param queryBuilder must have .orderBy() setted */
export const sqlWithPagination = <TQueryBuilder extends MySqlSelect>(
  queryBuilder: TQueryBuilder,
  page: number,
  pageSize: number,
) => {
  return queryBuilder.limit(pageSize).offset((page - 1) * pageSize)
}
