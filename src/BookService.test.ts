import { BookService } from './BookService';
import { CreateBookData, UpdateBookData, BookNotFoundError, ValidationError, Book } from './types';

describe('BookService', () => {
  let bookService: BookService;

  beforeEach(() => {
    bookService = new BookService();
  });

  describe('CREATE operations', () => {
    it('should create a book with valid data', () => {
      const bookData: CreateBookData = {
        title: 'Test Book',
        author: 'Test Author',
        year: 2023
      };

      const createdBook = bookService.create(bookData);

      expect(createdBook).toMatchObject({
        title: 'Test Book',
        author: 'Test Author',
        year: 2023
      });
      expect(createdBook.id).toBeDefined();
      expect(typeof createdBook.id).toBe('string');
    });

    it('should sanitize string inputs when creating a book', () => {
      const bookData: CreateBookData = {
        title: '  Test Book  ',
        author: '  Test Author  ',
        year: 2023
      };

      const createdBook = bookService.create(bookData);

      expect(createdBook.title).toBe('Test Book');
      expect(createdBook.author).toBe('Test Author');
    });

    it('should throw ValidationError when title is empty', () => {
      const bookData: CreateBookData = {
        title: '',
        author: 'Test Author',
        year: 2023
      };

      expect(() => bookService.create(bookData)).toThrow(ValidationError);
      expect(() => bookService.create(bookData)).toThrow('Title is required');
    });

    it('should throw ValidationError when author is empty', () => {
      const bookData: CreateBookData = {
        title: 'Test Book',
        author: '',
        year: 2023
      };

      expect(() => bookService.create(bookData)).toThrow(ValidationError);
      expect(() => bookService.create(bookData)).toThrow('Author is required');
    });

    it('should throw ValidationError when year is invalid', () => {
      const bookData: CreateBookData = {
        title: 'Test Book',
        author: 'Test Author',
        year: -1
      };

      expect(() => bookService.create(bookData)).toThrow(ValidationError);
      expect(() => bookService.create(bookData)).toThrow('Year must be between');
    });

    it('should throw ValidationError when year is in the future', () => {
      const futureYear = new Date().getFullYear() + 1;
      const bookData: CreateBookData = {
        title: 'Test Book',
        author: 'Test Author',
        year: futureYear
      };

      expect(() => bookService.create(bookData)).toThrow(ValidationError);
    });

    it('should use safeCreate and return success result', () => {
      const bookData: CreateBookData = {
        title: 'Test Book',
        author: 'Test Author',
        year: 2023
      };

      const result = bookService.safeCreate(bookData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Book');
      }
    });

    it('should use safeCreate and return error result for invalid data', () => {
      const bookData: CreateBookData = {
        title: '',
        author: 'Test Author',
        year: 2023
      };

      const result = bookService.safeCreate(bookData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('READ operations', () => {
    let testBook: any;

    beforeEach(() => {
      testBook = bookService.create({
        title: 'Test Book',
        author: 'Test Author',
        year: 2023
      });
    });

    it('should find a book by ID', () => {
      const foundBook = bookService.findById(testBook.id);

      expect(foundBook).toEqual(testBook);
    });

    it('should return null when book ID is not found', () => {
      const foundBook = bookService.findById('non-existent-id');

      expect(foundBook).toBeNull();
    });

    it('should return all books', () => {
      const anotherBook = bookService.create({
        title: 'Another Book',
        author: 'Another Author',
        year: 2022
      });

      const allBooks = bookService.findAll();

      expect(allBooks).toHaveLength(2);
      expect(allBooks).toContainEqual(testBook);
      expect(allBooks).toContainEqual(anotherBook);
    });

    it('should return empty array when no books exist', () => {
      bookService.clear();
      const allBooks = bookService.findAll();

      expect(allBooks).toEqual([]);
    });

    it('should find books by author', () => {
      bookService.create({
        title: 'Another Book by Same Author',
        author: 'Test Author',
        year: 2022
      });

      bookService.create({
        title: 'Book by Different Author',
        author: 'Different Author',
        year: 2021
      });

      const booksByAuthor = bookService.findByAuthor('Test Author');

      expect(booksByAuthor).toHaveLength(2);
      expect(booksByAuthor.every((book: Book) => book.author === 'Test Author')).toBe(true);
    });

    it('should find books by author with case-insensitive partial match', () => {
      const booksByAuthor = bookService.findByAuthor('test');

      expect(booksByAuthor).toHaveLength(1);
      expect(booksByAuthor[0]?.author).toBe('Test Author');
    });

    it('should find books by title', () => {
      const booksByTitle = bookService.findByTitle('Test');

      expect(booksByTitle).toHaveLength(1);
      expect(booksByTitle[0]?.title).toBe('Test Book');
    });

    it('should find books by title with case-insensitive partial match', () => {
      const booksByTitle = bookService.findByTitle('test book');

      expect(booksByTitle).toHaveLength(1);
      expect(booksByTitle[0]?.title).toBe('Test Book');
    });

    it('should find books by year', () => {
      bookService.create({
        title: 'Another Book Same Year',
        author: 'Another Author',
        year: 2023
      });

      const booksByYear = bookService.findByYear(2023);

      expect(booksByYear).toHaveLength(2);
      expect(booksByYear.every((book: Book) => book.year === 2023)).toBe(true);
    });

    it('should return empty array when no books match search criteria', () => {
      expect(bookService.findByAuthor('Non-existent Author')).toEqual([]);
      expect(bookService.findByTitle('Non-existent Title')).toEqual([]);
      expect(bookService.findByYear(1800)).toEqual([]);
    });
  });

  describe('UPDATE operations', () => {
    let testBook: any;

    beforeEach(() => {
      testBook = bookService.create({
        title: 'Original Title',
        author: 'Original Author',
        year: 2023
      });
    });

    it('should update a book title', () => {
      const updateData: UpdateBookData = { title: 'Updated Title' };
      const updatedBook = bookService.update(testBook.id, updateData);

      expect(updatedBook).not.toBeNull();
      expect(updatedBook?.title).toBe('Updated Title');
      expect(updatedBook?.author).toBe('Original Author');
      expect(updatedBook?.year).toBe(2023);
    });

    it('should update a book author', () => {
      const updateData: UpdateBookData = { author: 'Updated Author' };
      const updatedBook = bookService.update(testBook.id, updateData);

      expect(updatedBook?.author).toBe('Updated Author');
      expect(updatedBook?.title).toBe('Original Title');
    });

    it('should update a book year', () => {
      const updateData: UpdateBookData = { year: 2024 };
      const updatedBook = bookService.update(testBook.id, updateData);

      expect(updatedBook?.year).toBe(2024);
      expect(updatedBook?.title).toBe('Original Title');
    });

    it('should update multiple fields at once', () => {
      const updateData: UpdateBookData = {
        title: 'New Title',
        author: 'New Author',
        year: 2024
      };
      const updatedBook = bookService.update(testBook.id, updateData);

      expect(updatedBook?.title).toBe('New Title');
      expect(updatedBook?.author).toBe('New Author');
      expect(updatedBook?.year).toBe(2024);
    });

    it('should sanitize string inputs when updating', () => {
      const updateData: UpdateBookData = {
        title: '  Updated Title  ',
        author: '  Updated Author  '
      };
      const updatedBook = bookService.update(testBook.id, updateData);

      expect(updatedBook?.title).toBe('Updated Title');
      expect(updatedBook?.author).toBe('Updated Author');
    });

    it('should return null when updating non-existent book', () => {
      const updateData: UpdateBookData = { title: 'New Title' };
      const result = bookService.update('non-existent-id', updateData);

      expect(result).toBeNull();
    });

    it('should throw ValidationError when update data is empty', () => {
      const updateData: UpdateBookData = {};

      expect(() => bookService.update(testBook.id, updateData)).toThrow(ValidationError);
      expect(() => bookService.update(testBook.id, updateData)).toThrow('At least one field must be provided');
    });

    it('should throw ValidationError when title is empty in update', () => {
      const updateData: UpdateBookData = { title: '' };

      expect(() => bookService.update(testBook.id, updateData)).toThrow(ValidationError);
    });

    it('should throw ValidationError when year is invalid in update', () => {
      const updateData: UpdateBookData = { year: -1 };

      expect(() => bookService.update(testBook.id, updateData)).toThrow(ValidationError);
    });

    it('should use safeUpdate and return success result', () => {
      const updateData: UpdateBookData = { title: 'Updated Title' };
      const result = bookService.safeUpdate(testBook.id, updateData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Updated Title');
      }
    });

    it('should use safeUpdate and return error result for non-existent book', () => {
      const updateData: UpdateBookData = { title: 'Updated Title' };
      const result = bookService.safeUpdate('non-existent-id', updateData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(BookNotFoundError);
      }
    });

    it('should use safeUpdate and return error result for invalid data', () => {
      const updateData: UpdateBookData = { title: '' };
      const result = bookService.safeUpdate(testBook.id, updateData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('DELETE operations', () => {
    let testBook: any;

    beforeEach(() => {
      testBook = bookService.create({
        title: 'Test Book',
        author: 'Test Author',
        year: 2023
      });
    });

    it('should delete a book by ID', () => {
      const initialCount = bookService.count();
      const deleteResult = bookService.delete(testBook.id);

      expect(deleteResult).toBe(true);
      expect(bookService.count()).toBe(initialCount - 1);
      expect(bookService.findById(testBook.id)).toBeNull();
    });

    it('should return false when deleting non-existent book', () => {
      const deleteResult = bookService.delete('non-existent-id');

      expect(deleteResult).toBe(false);
    });

    it('should use safeDelete and succeed for existing book', () => {
      expect(() => bookService.safeDelete(testBook.id)).not.toThrow();
      expect(bookService.findById(testBook.id)).toBeNull();
    });

    it('should use safeDelete and throw error for non-existent book', () => {
      expect(() => bookService.safeDelete('non-existent-id')).toThrow(BookNotFoundError);
    });
  });

  describe('UTILITY operations', () => {
    it('should return correct count of books', () => {
      expect(bookService.count()).toBe(0);

      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2023 });
      expect(bookService.count()).toBe(1);

      bookService.create({ title: 'Book 2', author: 'Author 2', year: 2022 });
      expect(bookService.count()).toBe(2);
    });

    it('should check if collection is empty', () => {
      expect(bookService.isEmpty()).toBe(true);

      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2023 });
      expect(bookService.isEmpty()).toBe(false);
    });

    it('should clear all books', () => {
      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2023 });
      bookService.create({ title: 'Book 2', author: 'Author 2', year: 2022 });

      expect(bookService.count()).toBe(2);

      bookService.clear();

      expect(bookService.count()).toBe(0);
      expect(bookService.isEmpty()).toBe(true);
      expect(bookService.findAll()).toEqual([]);
    });

    it('should return paginated results', () => {
      // Create 5 books
      for (let i = 1; i <= 5; i++) {
        bookService.create({
          title: `Book ${i}`,
          author: `Author ${i}`,
          year: 2020 + i
        });
      }

      // Test first page
      const page1 = bookService.getPaginated(1, 2);
      expect(page1.books).toHaveLength(2);
      expect(page1.currentPage).toBe(1);
      expect(page1.totalPages).toBe(3);
      expect(page1.totalBooks).toBe(5);
      expect(page1.hasNextPage).toBe(true);
      expect(page1.hasPreviousPage).toBe(false);

      // Test middle page
      const page2 = bookService.getPaginated(2, 2);
      expect(page2.books).toHaveLength(2);
      expect(page2.currentPage).toBe(2);
      expect(page2.hasNextPage).toBe(true);
      expect(page2.hasPreviousPage).toBe(true);

      // Test last page
      const page3 = bookService.getPaginated(3, 2);
      expect(page3.books).toHaveLength(1);
      expect(page3.currentPage).toBe(3);
      expect(page3.hasNextPage).toBe(false);
      expect(page3.hasPreviousPage).toBe(true);
    });

    it('should handle pagination edge cases', () => {
      // Empty collection
      const emptyResult = bookService.getPaginated(1, 10);
      expect(emptyResult.books).toHaveLength(0);
      expect(emptyResult.totalBooks).toBe(0);
      expect(emptyResult.totalPages).toBe(0);

      // Page number too high
      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2023 });
      const highPageResult = bookService.getPaginated(10, 10);
      expect(highPageResult.currentPage).toBe(1); // Should default to valid page
      expect(highPageResult.books).toHaveLength(1);
    });
  });

  describe('Data immutability', () => {
    it('should return copies of books to prevent external mutation', () => {
      const originalBook = bookService.create({
        title: 'Original Title',
        author: 'Original Author',
        year: 2023
      });

      const foundBook = bookService.findById(originalBook.id);
      
      // Attempt to mutate the returned book
      if (foundBook) {
        foundBook.title = 'Mutated Title';
      }

      // Original book should remain unchanged
      const originalAgain = bookService.findById(originalBook.id);
      expect(originalAgain?.title).toBe('Original Title');
    });

    it('should return copies in findAll to prevent external mutation', () => {
      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2023 });
      
      const allBooks = bookService.findAll();
      
      // Attempt to mutate the returned array and book
      allBooks[0]!.title = 'Mutated Title';
      
      // Original collection should remain unchanged
      const allBooksAgain = bookService.findAll();
      expect(allBooksAgain[0]?.title).toBe('Book 1');
    });
  });
});
