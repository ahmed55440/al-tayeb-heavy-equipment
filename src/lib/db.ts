import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://altayeb-db-ahmed55440.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTU1NDQ5MTQsImlkIjoiMDFhMjBlZDAtOTEwMS03MzUxLTkzOTQtMDNlZjI2YzBkMjgyIiwia2lkIjoiWENXZFVQbmI1MVlQd1RNZW1GTlBDcXRnTEtNdTNLM1d1STRVTUcyd3puTSIsInJpZCI6IjMyMjE1YWNjLTExNGUtNDY0My1iNTFlLWZlMWJkODlkMzYyOCJ9.2sOW8WbnrGXkwO0BdfsPWD71_PELerNiIyYXix48toml9nPmcwDZYdhO31924bfXr_O2xk9e-cjhLUB1_r5NAw';

export const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

/**
 * Execute a query that returns multiple rows
 */
export async function query<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await turso.execute({ sql, args });
  return (result.rows as unknown as T[]) || [];
}

/**
 * Execute a query that returns a single row or null
 */
export async function queryOne<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const result = await turso.execute({ sql, args });
  if (!result.rows || result.rows.length === 0) return null;
  return result.rows[0] as unknown as T;
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement
 */
export async function execute(sql: string, args: any[] = []): Promise<{ lastInsertRowid?: number; rowsAffected: number }> {
  const result = await turso.execute({ sql, args });
  return {
    lastInsertRowid: result.lastInsertRowid ? Number(result.lastInsertRowid) : undefined,
    rowsAffected: result.rowsAffected,
  };
}

/**
 * Execute multiple statements in batch
 */
export async function batch(statements: Array<{ sql: string; args?: any[] }>) {
  return await turso.batch(statements, 'write');
}

export default turso;
