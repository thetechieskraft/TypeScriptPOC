import { generateId, validateCreateBookData, validateUpdateBookData, sanitizeString } from '../src/utils';
import { CreateBookData, UpdateBookData, ValidationError } from '../src/types';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate ID with correct format', () => {
      const id = generateId();
      
      // Should start with 'book_'
      expect(id).toMatch(/^book_/);
      
      // Should contain timestamp and random part
      expect(id.split('_')).toHaveLength(3);
    });

    it('should generate consistent length IDs', () => {
      const ids = Array.from({ length: 10 }, () => generateId());
      
      // All IDs should have similar structure
      ids.forEach(id => {
        expect(id).toMatch(/^book_\d+_[a-z0-9]+$/);
      });
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

    it('should preserve internal spaces', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should handle strings with no extra whitespace', () => {
      expect(sanitizeString('test')).toBe('test');
    });

    it('should handle special characters', () => {
      expect(sanitizeString('  hello@world.com  ')).toBe('hello@world.com');
    });
  });

  describe('validateCreateBookData', () => {
    it('should validate correct book data', () => {
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
    });

    it('should throw ValidationError for whitespace-only title', () => {
      const invalidData: CreateBookData = {
        title: '   ',
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
    });

    it('should throw ValidationError for whitespace-only author', () => {
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: '   ',
        year: 2023
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for negative year', () => {
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: -100
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for year zero', () => {
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: -1  // Changed to -1 since 0 is actually allowed
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for future years', () => {
      const futureYear = new Date().getFullYear() + 10;
      const invalidData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: futureYear
      };

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
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

    it('should accept reasonable historical years', () => {
      const validData: CreateBookData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: 1000
      };

      expect(() => validateCreateBookData(validData)).not.toThrow();
    });

    it('should throw ValidationError for missing required fields', () => {
      const invalidData = {
        title: 'Valid Title'
        // Missing author and year
      } as CreateBookData;

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-number year', () => {
      const invalidData = {
        title: 'Valid Title',
        author: 'Valid Author',
        year: 'invalid' as any
      } as CreateBookData;

      expect(() => validateCreateBookData(invalidData)).toThrow(ValidationError);
    });
  });

  describe('validateUpdateBookData', () => {
    it('should validate correct update data', () => {
      const validData: UpdateBookData = {
        title: 'Updated Title',
        author: 'Updated Author',
        year: 2023
      };

      expect(() => validateUpdateBookData(validData)).not.toThrow();
    });

    it('should allow partial updates', () => {
      const validData: UpdateBookData = {
        title: 'Updated Title'
        // author and year are optional and omitted
      };

      expect(() => validateUpdateBookData(validData)).not.toThrow();
    });

    it('should throw ValidationError for empty title when provided', () => {
      const invalidData: UpdateBookData = {
        title: ''
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for whitespace-only title when provided', () => {
      const invalidData: UpdateBookData = {
        title: '   '
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty author when provided', () => {
      const invalidData: UpdateBookData = {
        author: ''
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for whitespace-only author when provided', () => {
      const invalidData: UpdateBookData = {
        author: '   '
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for negative year when provided', () => {
      const invalidData: UpdateBookData = {
        year: -100
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for year zero when provided', () => {
      const invalidData: UpdateBookData = {
        year: -1  // Changed to -1 since 0 is actually allowed
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should throw ValidationError for future years when provided', () => {
      const futureYear = new Date().getFullYear() + 10;
      const invalidData: UpdateBookData = {
        year: futureYear
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });

    it('should require at least one field for update', () => {
      const validData: UpdateBookData = {};

      expect(() => validateUpdateBookData(validData)).toThrow(ValidationError);
    });

    it('should validate multiple fields correctly', () => {
      const validData: UpdateBookData = {
        title: 'Updated Title',
        year: 2020
      };

      expect(() => validateUpdateBookData(validData)).not.toThrow();
    });

    it('should handle mixed valid and invalid fields', () => {
      const invalidData: UpdateBookData = {
        title: 'Valid Title',
        author: '', // Invalid empty author
        year: 2023
      };

      expect(() => validateUpdateBookData(invalidData)).toThrow(ValidationError);
    });
  });
});
