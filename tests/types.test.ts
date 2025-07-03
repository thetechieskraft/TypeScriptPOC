import { BookNotFoundError, ValidationError } from '../src/types';

describe('Custom Error Types', () => {
  describe('ValidationError', () => {
    it('should create ValidationError with message', () => {
      const message = 'Test validation error';
      const error = new ValidationError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(`Validation error: ${message}`);
      expect(error.name).toBe('ValidationError');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new ValidationError('Test error');
      }).toThrow(ValidationError);
    });

    it('should be catchable', () => {
      try {
        throw new ValidationError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Validation error: Test error');
      }
    });

    it('should have correct stack trace', () => {
      const error = new ValidationError('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('BookNotFoundError', () => {
    it('should create BookNotFoundError with book ID', () => {
      const bookId = 'test-book-123';
      const error = new BookNotFoundError(bookId);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BookNotFoundError);
      expect(error.message).toBe(`Book with id '${bookId}' not found`);
      expect(error.name).toBe('BookNotFoundError');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new BookNotFoundError('test-id');
      }).toThrow(BookNotFoundError);
    });

    it('should be catchable', () => {
      const testId = 'test-book-456';
      try {
        throw new BookNotFoundError(testId);
      } catch (error) {
        expect(error).toBeInstanceOf(BookNotFoundError);
        expect((error as BookNotFoundError).message).toBe(`Book with id '${testId}' not found`);
      }
    });

    it('should have correct stack trace', () => {
      const error = new BookNotFoundError('test-id');
      expect(error.stack).toBeDefined();
    });

    it('should create proper error message', () => {
      const bookId = 'preserved-id-789';
      const error = new BookNotFoundError(bookId);
      
      expect(error.message).toContain(bookId);
      
      // Ensure the message is preserved after throwing/catching
      try {
        throw error;
      } catch (caughtError) {
        expect((caughtError as BookNotFoundError).message).toContain(bookId);
      }
    });
  });

  describe('Error Type Differentiation', () => {
    it('should differentiate between ValidationError and BookNotFoundError', () => {
      const validationError = new ValidationError('Validation failed');
      const bookNotFoundError = new BookNotFoundError('book-123');

      expect(validationError).toBeInstanceOf(ValidationError);
      expect(validationError).not.toBeInstanceOf(BookNotFoundError);
      
      expect(bookNotFoundError).toBeInstanceOf(BookNotFoundError);
      expect(bookNotFoundError).not.toBeInstanceOf(ValidationError);
    });

    it('should allow proper error handling in try-catch blocks', () => {
      const errors = [
        new ValidationError('Validation error'),
        new BookNotFoundError('missing-book')
      ];

      errors.forEach(error => {
        try {
          throw error;
        } catch (caughtError) {
          if (caughtError instanceof ValidationError) {
            expect(caughtError.message).toBe('Validation error: Validation error');
          } else if (caughtError instanceof BookNotFoundError) {
            expect(caughtError.message).toBe("Book with id 'missing-book' not found");
          } else {
            fail('Unexpected error type');
          }
        }
      });
    });
  });
});
