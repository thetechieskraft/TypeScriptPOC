import { generateId, validateCreateBookData, validateUpdateBookData, sanitizeString } from './utils';
import { CreateBookData, UpdateBookData, ValidationError } from './types';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should generate IDs with the correct prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^book_/);
    });

    it('should generate IDs with reasonable length', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(10);
    });
  });

  describe('validateCreateBookData', () => {
    it('should validate correct book data without throwing', () => {
      const validData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: 2023
      };

      expect(() => validateCreateBookData(validData)).not.toThrow();
    });

    it('should throw ValidationError for empty title', () => {
      const invalidData: CreateBookData = {
        title: '',
        author: 'Valid Author',
        year: 2023
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateCreateBookData(invalidData)).toThrow('Title is required');
    });

    it('should throw ValidationError for whitespace-only title', () => {
      const invalidData: CreateBookData = {
        title: '   ',
        author: 'Valid Author',
        year: 2023
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateCreateBookData(invalidData)).toThrow('Title is required');
    });

    it('should throw ValidationError for non-string title', () => {
      const invalidData = {
        title: 123 as any,
        author: 'Valid Author',
        year: 2023
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty author', () => {
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: '',
        year: 2023
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateCreateBookData(invalidData)).toThrow('Author is required');
    });

    it('should throw ValidationError for whitespace-only author', () => {
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: '   ',
        year: 2023
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateCreateBookData(invalidData)).toThrow('Author is required');
    });

    it('should throw ValidationError for non-string author', () => {
      const invalidData = {
        title: 'Valid Title',
        author: 123 as any,
        year: 2023
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-integer year', () => {
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: 2023.5
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateCreateBookData(invalidData)).toThrow('Year must be a valid integer');
    });

    it('should throw ValidationError for negative year', () => {
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: -1
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateCreateBookData(invalidData)).toThrow('Year must be between');
    });

    it('should throw ValidationError for future year', () => {
      const futureYear = new Date().getFullYear() + 1;
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: futureYear
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateCreateBookData(invalidData)).toThrow('Year must be between');
    });

    it('should accept current year', () => {
      const currentYear = new Date().getFullYear();
      const validData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: currentYear
      };

      expect(() => validateCreateBookData(validData)).not.toThrow();
    });

    it('should accept year 0', () => {
      const validData: CreateBookData = {
        title: 'Ancient Book',
        author: 'Ancient Author',
        year: 0
      };

      expect(() => validateCreateBookData(validData)).not.toThrow();
    });
  });

  describe('validateUpdateBookData', () => {
    it('should validate correct update data without throwing', () => {
      const validData: UpdateBookData = {
        title: 'Updated Title'
      };

      expect(() => validateUpdateBookData(validData)).not.toThrow();
    });

    it('should validate update data with multiple fields', () => {
      const validData: UpdateBookData = {
        title: 'Updated Title',
        author: 'Updated Author',
        year: 2024
      };

      expect(() => validateUpdateBookData(validData)).not.toThrow();
    });

    it('should throw ValidationError for empty update data', () => {
      const invalidData: UpdateBookData = {};

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateUpdateBookData(invalidData)).toThrow('At least one field must be provided');
    });

    it('should throw ValidationError for empty title in update', () => {
      const invalidData: UpdateBookData = {
        title: ''
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateUpdateBookData(invalidData)).toThrow('Title must be a non-empty string');
    });

    it('should throw ValidationError for whitespace-only title in update', () => {
      const invalidData: UpdateBookData = {
        title: '   '
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty author in update', () => {
      const invalidData: UpdateBookData = {
        author: ''
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateUpdateBookData(invalidData)).toThrow('Author must be a non-empty string');
    });

    it('should throw ValidationError for invalid year in update', () => {
      const invalidData: UpdateBookData = {
        year: 2023.5
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
      expect(() => validateUpdateBookData(invalidData)).toThrow('Year must be a valid integer');
    });

    it('should throw ValidationError for negative year in update', () => {
      const invalidData: UpdateBookData = {
        year: -1
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for future year in update', () => {
      const futureYear = new Date().getFullYear() + 1;
      const invalidData: UpdateBookData = {
        year: futureYear
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should allow undefined fields in update data', () => {
      const validData: UpdateBookData = {
        title: 'Updated Title'
        // author and year are optional and omitted
      };

      expect(() => validateUpdateBookData(validData)).not.toThrow();
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace from strings', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\t\nworld\t\n')).toBe('world');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });

    it('should leave already clean strings unchanged', () => {
      expect(sanitizeString('clean string')).toBe('clean string');
    });

    it('should handle strings with internal whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should handle special characters', () => {
      expect(sanitizeString('  special@#$%^&*()chars  ')).toBe('special@#$%^&*()chars');
    });
  });
});
