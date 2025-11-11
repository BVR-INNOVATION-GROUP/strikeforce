/**
 * MongoDB connection utility for Next.js
 * Handles connection pooling and reuses connections across requests
 * 
 * In Next.js, each API route is a serverless function that may be cold-started.
 * This utility caches the MongoDB client to reuse connections.
 */

import { MongoClient, Db, Collection } from 'mongodb';

// Database name from environment (defaults to 'strikeforce')
const dbName = process.env.MONGODB_DB_NAME || 'strikeforce';

/**
 * Get MongoDB connection URI
 * Throws error only when actually trying to use MongoDB (lazy check)
 */
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please add MONGODB_URI to your .env file');
  }
  return uri;
}

// TypeScript interfaces
interface MongoGlobal {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

// Cache the MongoDB client and promise in global scope
// This prevents creating multiple connections in development due to hot reloading
declare global {
  var _mongoClient: MongoGlobal | undefined;
}

const cached: MongoGlobal = global._mongoClient || { client: null, promise: null };

if (!global._mongoClient) {
  global._mongoClient = cached;
}

/**
 * Get MongoDB client instance
 * Reuses existing connection if available, otherwise creates new one
 * @returns Promise<MongoClient>
 */
export async function getMongoClient(): Promise<MongoClient> {
  // Lazy check for MONGODB_URI - only when actually trying to connect
  const uri = getMongoUri();
  
  // If we have a cached client, return it
  if (cached.client) {
    return cached.client;
  }

  // If we don't have a promise, create one
  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri).then((client) => {
      // Set connection options
      client.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      cached.client = client;
      return client;
    });
  }

  // Wait for the promise to resolve and cache the client
  cached.client = await cached.promise;
  return cached.client;
}

/**
 * Get MongoDB client promise (for NextAuth adapter)
 * Returns the promise directly without awaiting
 */
export function getMongoClientPromise(): Promise<MongoClient> {
  // Lazy check for MONGODB_URI - only when actually trying to connect
  const uri = getMongoUri();
  
  if (cached.client) {
    return Promise.resolve(cached.client);
  }
  
  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri).then((client) => {
      client.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      cached.client = client;
      return client;
    });
  }
  
  return cached.promise;
}

/**
 * Get MongoDB database instance
 * @param databaseName - Optional database name (defaults to env variable or 'strikeforce')
 * @returns Promise<Db>
 */
export async function getDatabase(databaseName?: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(databaseName || dbName);
}

/**
 * Get a MongoDB collection
 * @param collectionName - Name of the collection
 * @param databaseName - Optional database name
 * @returns Promise<Collection>
 */
export async function getCollection<T = unknown>(
  collectionName: string,
  databaseName?: string
): Promise<Collection<T>> {
  const db = await getDatabase(databaseName);
  return db.collection<T>(collectionName);
}

/**
 * Close MongoDB connection
 * Useful for cleanup in tests or graceful shutdown
 */
export async function closeMongoConnection(): Promise<void> {
  if (cached.client) {
    await cached.client.close();
    cached.client = null;
    cached.promise = null;
  }
}

