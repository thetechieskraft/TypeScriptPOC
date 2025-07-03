import { CreateBookData, UpdateBookData, ValidationError } from './types';

/**
 * Generates a unique ID for books
 * Uses timestamp and random number for uniqueness
 */
export function generateId(): string {
  return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates book creation data
 * @param data - The book data to validate
 * @throws ValidationError if data is invalid
 */
export function validateCreateBookData(data: CreateBookData): void {
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new ValidationError('Title is required and must be a non-empty string');
  }

  if (!data.author || typeof data.author !== 'string' || data.author.trim().length === 0) {
    throw new ValidationError('Author is required and must be a non-empty string');
  }

  if (typeof data.year !== 'number' || !Number.isInteger(data.year)) {
    throw new ValidationError('Year must be a valid integer');
  }

  if (data.year < 0 || data.year > new Date().getFullYear()) {
    throw new ValidationError(`Year must be between 0 and ${new Date().getFullYear()}`);
  }
}

/**
 * Validates book update data
 * @param data - The book data to validate
 * @throws ValidationError if data is invalid
 */
export function validateUpdateBookData(data: UpdateBookData): void {
  if (Object.keys(data).length === 0) {
    throw new ValidationError('At least one field must be provided for update');
  }

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new ValidationError('Title must be a non-empty string');
    }
  }

  if (data.author !== undefined) {
    if (typeof data.author !== 'string' || data.author.trim().length === 0) {
      throw new ValidationError('Author must be a non-empty string');
    }
  }

  if (data.year !== undefined) {
    if (typeof data.year !== 'number' || !Number.isInteger(data.year)) {
      throw new ValidationError('Year must be a valid integer');
    }

    if (data.year < 0 || data.year > new Date().getFullYear()) {
      throw new ValidationError(`Year must be between 0 and ${new Date().getFullYear()}`);
    }
  }
}

/**
 * Sanitizes string input by trimming whitespace
 * @param input - The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeString(input: string): string {
  return input.trim();
}
