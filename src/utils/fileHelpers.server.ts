/**
 * Server-only file helpers for writing JSON mock data files
 * These helpers MUST only be used in API routes or server components
 * 
 * IMPORTANT: This file uses Node.js modules (fs/promises) and cannot be imported
 * by client components. Use API routes for write operations.
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Get the path to a mock data file
 * @param filename - Name of the JSON file (e.g., 'mockProjects.json')
 * @returns Full path to the file
 */
function getMockDataPath(filename: string): string {
  return path.join(process.cwd(), 'src', 'data', filename);
}

/**
 * Read a JSON mock data file from file system (server-side only)
 * @param filename - Name of the JSON file (e.g., 'mockProjects.json')
 * @returns Parsed JSON data
 */
export async function readMockDataFileServer<T>(filename: string): Promise<T[]> {
  try {
    const filePath = getMockDataPath(filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    console.error(`Error reading mock data file ${filename}:`, error);
    throw new Error(`Failed to read mock data file: ${filename}`);
  }
}

/**
 * Write data to a JSON mock data file (server-side only)
 * @param filename - Name of the JSON file (e.g., 'mockProjects.json')
 * @param data - Data to write (will be stringified as JSON)
 */
export async function writeMockDataFile<T>(filename: string, data: T[]): Promise<void> {
  try {
    const filePath = getMockDataPath(filename);
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf-8');
  } catch (error) {
    console.error(`Error writing mock data file ${filename}:`, error);
    throw new Error(`Failed to write mock data file: ${filename}`);
  }
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
 * Create a new item in a JSON file (server-side only)
 * @param filename - Name of the JSON file
 * @param itemData - Item data without ID (ID will be auto-generated)
 * @returns The created item with ID
 */
export async function createItem<T extends { id: number }>(
  filename: string,
  itemData: Omit<T, 'id'>
): Promise<T> {
  const items = await readMockDataFileServer<T>(filename);
  
  // Generate new ID (highest existing ID + 1, or timestamp if no items)
  const maxId = items.length > 0 
    ? Math.max(...items.map(item => typeof item.id === 'number' ? item.id : parseInt(String(item.id), 10)))
    : 0;
  const newId = maxId + 1;

  const newItem = {
    ...itemData,
    id: newId,
  } as T;

  items.push(newItem);
  await writeMockDataFile(filename, items);
  
  return newItem;
}

/**
 * Update an item in a JSON file (server-side only)
 * @param filename - Name of the JSON file
 * @param id - ID of item to update
 * @param updates - Partial item data to update
 * @returns The updated item
 */
export async function updateItem<T extends { id: number | string }>(
  filename: string,
  id: number | string,
  updates: Partial<T>
): Promise<T> {
  const items = await readMockDataFileServer<T>(filename);
  const index = findIndexById(items, id);

  if (index === -1) {
    throw new Error(`Item with ID ${id} not found in ${filename}`);
  }

  const updatedItem = {
    ...items[index],
    ...updates,
  } as T;

  items[index] = updatedItem;
  await writeMockDataFile(filename, items);
  
  return updatedItem;
}

/**
 * Delete an item from a JSON file (server-side only)
 * @param filename - Name of the JSON file
 * @param id - ID of item to delete
 * @returns true if item was deleted, false if not found
 */
export async function deleteItem<T extends { id: number | string }>(
  filename: string,
  id: number | string
): Promise<boolean> {
  const items = await readMockDataFileServer<T>(filename);
  const index = findIndexById(items, id);

  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  await writeMockDataFile(filename, items);
  
  return true;
}

