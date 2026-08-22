import mysql from "mysql2/promise";

/**
 * Shared MySQL connection pool.
 *
 * Created lazily on first query rather than at module load, so importing this
 * file during `next build` never tries to open a socket. That keeps the build
 * working on machines (and CI) where MySQL is not running.
 *
 * The pool is cached on globalThis because the dev server hot-reloads modules,
 * which would otherwise leak a new pool on every edit.
 */
const globalForDb = globalThis as unknown as {
  acornDbPool?: mysql.Pool;
};

/**
 * Maximum simultaneous MySQL connections.
 *
 * Deliberately conservative: shared hosting usually caps concurrent
 * connections per database far below what a dedicated server allows, and
 * exhausting that cap takes the whole site down rather than just slowing it.
 * This site's queries are short form inserts and one admin SELECT, so a small
 * pool is plenty.
 *
 * TODO: check this against Hostinger's stated MySQL connection limit once the
 * account exists (hPanel > Databases), and raise or lower DB_POOL_MAX to suit.
 */
const DEFAULT_POOL_MAX = 5;

function poolMax(): number {
  const configured = Number(process.env.DB_POOL_MAX);
  return Number.isInteger(configured) && configured > 0
    ? configured
    : DEFAULT_POOL_MAX;
}

export function getPool(): mysql.Pool {
  if (!globalForDb.acornDbPool) {
    globalForDb.acornDbPool = mysql.createPool({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "acorn_construction",
      waitForConnections: true,
      connectionLimit: poolMax(),
      queueLimit: 0,
      // Keeps DATE columns as 'YYYY-MM-DD' strings instead of JS Dates, which
      // avoids timezone drift when displaying them in the admin tables.
      dateStrings: true,
    });
  }
  return globalForDb.acornDbPool;
}

/** Everything these queries actually bind. */
export type SqlParam = string | number | boolean | null | Buffer | Date;

/** Runs an INSERT and returns the new row id. */
export async function insert(
  sql: string,
  params: readonly SqlParam[]
): Promise<number> {
  const [result] = await getPool().execute<mysql.ResultSetHeader>(sql, [
    ...params,
  ]);
  return result.insertId;
}

/** Runs an UPDATE or DELETE and returns the number of rows affected. */
export async function execute(
  sql: string,
  params: readonly SqlParam[] = []
): Promise<number> {
  const [result] = await getPool().execute<mysql.ResultSetHeader>(sql, [
    ...params,
  ]);
  return result.affectedRows;
}

/** Runs a SELECT and returns the rows. */
export async function query<T>(
  sql: string,
  params: readonly SqlParam[] = []
): Promise<T[]> {
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(sql, [
    ...params,
  ]);
  return rows as T[];
}
