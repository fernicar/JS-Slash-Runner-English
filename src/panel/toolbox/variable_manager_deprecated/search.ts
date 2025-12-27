/**
 * Search utility function: Used to judge if node matches search term, and determine visibility in card mode 。
 */

export type SearchQuery = string | RegExp | undefined | null;

/**
 * Judge if currently in search state (has non-empty query ）
 */
export const isSearching = (q: SearchQuery): boolean => q !== '' && q !== undefined && q !== null;

/**
 * Text match ：
 * - If query is regex, use it test
 * - If query is string, perform case-insensitive inclusion match
 */
export const textMatches = (text: string, query: string | RegExp): boolean => {
  if (query instanceof RegExp) {
    try {
      return query.test(text);
    } catch {
      return false;
    }
  }
  const q = String(query).toLowerCase();
  if (!q.length) return false;
  return text.toLowerCase().includes(q);
};

/**
 * Normalize raw value to text usable for matching 。
 */
const normalizePrimitive = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return String(value);
  } catch {
    return '';
  }
};

/**
 * Recursively judge if value hits search term (check string display and children ）。
 * - Object: Check both key text and sub-values
 * - Array: Check elements
 * - Primitive type: Match its string representation
 */
export const valueMatchesSearch = (
  value: unknown,
  query: string | RegExp,
  visited: WeakSet<object> = new WeakSet<object>(),
): boolean => {
  if (value === null || value === undefined) {
    return textMatches(normalizePrimitive(value), query);
  }
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') {
    return textMatches(normalizePrimitive(value), query);
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (valueMatchesSearch(item, query, visited)) return true;
    }
    return false;
  }
  if (t === 'object') {
    const obj = value as Record<string, unknown>;
    if (visited.has(obj)) return false;
    visited.add(obj);
    for (const [k, v] of Object.entries(obj)) {
      if (textMatches(String(k), query)) return true;
      if (valueMatchesSearch(v, query, visited)) return true;
    }
    return false;
  }
  return false;
};

/**
 * Node match: Match if either key name or value hits 。
 */
export const nodeMatchesSearch = (
  name: string | number | undefined,
  value: unknown,
  query: string | RegExp,
): boolean => {
  if (name !== undefined) {
    if (textMatches(String(name), query)) return true;
  }
  return valueMatchesSearch(value, query);
};
