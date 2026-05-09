// Transforms between camelCase (frontend) and snake_case (Supabase database)

/**
 * Convert camelCase object keys to snake_case
 * E.g. createdAt -> created_at, leadScore -> lead_score
 */
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value && typeof value === 'object' && !Array.isArray(value)
      ? toSnakeCase(value)
      : value;
  }
  return result;
}

/**
 * Convert snake_case object keys to camelCase
 * E.g. created_at -> createdAt, lead_score -> leadScore
 */
export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value && typeof value === 'object' && !Array.isArray(value)
      ? toCamelCase(value)
      : value;
  }
  return result;
}

/**
 * Transform array of snake_case records to camelCase
 */
export function mapFromDb<T>(records: any[]): T[] {
  if (!Array.isArray(records)) return [];
  return records.map((r) => toCamelCase(r) as T);
}

/**
 * Transform single camelCase record to snake_case for insert/update
 */
export function mapToDb<T extends Record<string, any>>(record: T): Record<string, any> {
  return toSnakeCase(record);
}

/**
 * Transform a single record from DB (snake_case) to frontend (camelCase)
 */
export function singleFromDb<T>(record: any): T | null {
  if (!record) return null;
  return toCamelCase(record) as T;
}
