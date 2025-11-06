/**
 * Client-safe file helpers for reading JSON mock data files
 * These helpers work in both client and server contexts
 * Write operations should go through API routes
 */

/**
 * Read a JSON mock data file (client-safe)
 * Uses dynamic imports which work in both client and server contexts
 * @param filename - Name of the JSON file (e.g., 'mockProjects.json')
 * @returns Parsed JSON data
 */
export async function readMockDataFile<T>(filename: string): Promise<T[]> {
  // Use dynamic import which works in both client and server contexts
  const mockData = await import(`@/src/data/${filename}`);
  return mockData.default as T[];
}

/**
 * Find an item by ID in an array
 * @param items - Array of items
 * @param id - ID to find (can be string or number)
 * @returns The item if found, undefined otherwise
 */
export function findById<T extends { id: number | string }>(
  items: T[],
  id: number | string
): T | undefined {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  return items.find((item) => {
    const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
    return itemId === numericId;
  });
}

/**
 * Find an item by ID and return its index
 * @param items - Array of items
 * @param id - ID to find (can be string or number)
 * @returns The index if found, -1 otherwise
 */
export function findIndexById<T extends { id: number | string }>(
  items: T[],
  id: number | string
): number {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  return items.findIndex((item) => {
    const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
    return itemId === numericId;
  });
}

/**
 * Read JSON file (alias for readMockDataFile for backward compatibility)
 */
export const readJsonFile = readMockDataFile;
