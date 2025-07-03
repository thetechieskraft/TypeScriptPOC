/**
 * Represents a book entity with all its properties
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
}

/**
 * Data required to create a new book (without id)
 */
export interface CreateBookData {
  title: string;
  author: string;
  year: number;
}

/**
 * Data that can be updated for a book (all properties optional)
 */
export interface UpdateBookData {
  title?: string;
  author?: string;
  year?: number;
}

/**
 * Generic interface for CRUD operations
 * T represents the entity type, K represents the key type, C represents create data type, U represents update data type
 */
export interface CrudRepository<T, K, C, U> {
  create(data: C): T;
  findById(id: K): T | null;
  findAll(): T[];
  update(id: K, data: U): T | null;
  delete(id: K): boolean;
}

/**
 * Custom error types for better error handling
 */
export class BookNotFoundError extends Error {
  constructor(id: string) {
    super(`Book with id '${id}' not found`);
    this.name = 'BookNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
  }
}

/**
 * Result type for operations that might fail
 */
export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};
