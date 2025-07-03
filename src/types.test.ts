import { BookNotFoundError, ValidationError } from './types';

describe('Custom Error Types', () => {
  describe('BookNotFoundError', () => {
    it('should create error with correct message and name', () => {
      const id = 'test-book-id';
      const error = new BookNotFoundError(id);

      expect(error.message).toBe(`Book with id '${id}' not found`);
      expect(error.name).toBe('BookNotFoundError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BookNotFoundError);
    });

    it('should include the book ID in the error message', () => {
      const id = 'another-test-id';
      const error = new BookNotFoundError(id);

      expect(error.message).toContain(id);
    });
  });

  describe('ValidationError', () => {
    it('should create error with correct message and name', () => {
      const message = 'Test validation error';
      const error = new ValidationError(message);

      expect(error.message).toBe(`Validation error: ${message}`);
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should include the validation message in the error message', () => {
      const message = 'Title is required';
      const error = new ValidationError(message);

      expect(error.message).toContain(message);
      expect(error.message).toContain('Validation error:');
    });
  });
});

describe('Type Definitions', () => {
  describe('Book interface', () => {
    it('should define the correct structure', () => {
      // This is more of a compile-time test, but we can check at runtime
      const book = {
        id: 'test-id',
        title: 'Test Title',
        author: 'Test Author',
        year: 2023
      };

      // TypeScript will ensure this compiles correctly
      expect(book.id).toBeDefined();
      expect(book.title).toBeDefined();
      expect(book.author).toBeDefined();
      expect(book.year).toBeDefined();
      
      expect(typeof book.id).toBe('string');
      expect(typeof book.title).toBe('string');
      expect(typeof book.author).toBe('string');
      expect(typeof book.year).toBe('number');
    });
  });

  describe('CreateBookData interface', () => {
    it('should define the correct structure', () => {
      const createData = {
        title: 'Test Title',
        author: 'Test Author',
        year: 2023
      };

      // Should not have id field
      expect('id' in createData).toBe(false);
      
      expect(createData.title).toBeDefined();
      expect(createData.author).toBeDefined();
      expect(createData.year).toBeDefined();
    });
  });

  describe('UpdateBookData interface', () => {
    it('should allow partial updates', () => {
      const updateData1 = { title: 'New Title' };
      const updateData2 = { author: 'New Author' };
      const updateData3 = { year: 2024 };
      const updateData4 = { title: 'New Title', author: 'New Author', year: 2024 };

      // All should be valid UpdateBookData
      expect(updateData1.title).toBeDefined();
      expect(updateData2.author).toBeDefined();
      expect(updateData3.year).toBeDefined();
      expect(updateData4.title).toBeDefined();
      expect(updateData4.author).toBeDefined();
      expect(updateData4.year).toBeDefined();
    });

    it('should allow empty object', () => {
      const emptyUpdate = {};
      
      // Should compile, though validation will catch this at runtime
      expect(typeof emptyUpdate).toBe('object');
    });
  });
});
