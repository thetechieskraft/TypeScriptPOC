import { BookService } from '../src/BookService';
import { CreateBookData, UpdateBookData, BookNotFoundError, ValidationError, Book } from '../src/types';

describe('BookService', () => {
  let bookService: BookService;

  beforeEach(() => {
    bookService = new BookService();
  });

  describe('Create Operations', () => {
    it('should create a new book with valid data', () => {
      const bookData: CreateBookData = {
        title: 'Test Book',
        author: 'Test Author',
        year: 2023
      };

      const book = bookService.create(bookData);

      expect(book.id).toBeDefined();
      expect(book.title).toBe('Test Book');
      expect(book.author).toBe('Test Author');
      expect(book.year).toBe(2023);
    });

    it('should throw ValidationError for invalid book data', () => {
      const invalidData = {
        title: '',
        author: 'Test Author',
        year: 2023
      } as CreateBookData;

      expect(() => bookService.create(invalidData)).toThrow(ValidationError);
    });

    it('should sanitize book data when creating', () => {
      const bookData: CreateBookData = {
        title: '  Test Book  ',
        author: '  Test Author  ',
        year: 2023
      };

      const book = bookService.create(bookData);

      expect(book.title).toBe('Test Book');
      expect(book.author).toBe('Test Author');
    });

    it('should generate unique IDs for different books', () => {
      const bookData1: CreateBookData = {
        title: 'Book 1',
        author: 'Author 1',
        year: 2023
      };

      const bookData2: CreateBookData = {
        title: 'Book 2',
        author: 'Author 2',
        year: 2024
      };

      const book1 = bookService.create(bookData1);
      const book2 = bookService.create(bookData2);

      expect(book1.id).not.toBe(book2.id);
    });
  });

  describe('Read Operations', () => {
    beforeEach(() => {
      // Add some test data
      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2021 });
      bookService.create({ title: 'Book 2', author: 'Author 2', year: 2022 });
      bookService.create({ title: 'Book 3', author: 'Author 1', year: 2023 });
    });

    it('should find all books', () => {
      const books = bookService.findAll();
      expect(books).toHaveLength(3);
    });

    it('should find book by ID', () => {
      const allBooks = bookService.findAll();
      const firstBook = allBooks[0];
      
      if (firstBook) {
        const foundBook = bookService.findById(firstBook.id);
        expect(foundBook).toEqual(firstBook);
      }
    });

    it('should return null for non-existent ID', () => {
      const book = bookService.findById('non-existent-id');
      expect(book).toBeNull();
    });

    it('should find books by title with partial match', () => {
      const books = bookService.findByTitle('Book');
      expect(books).toHaveLength(3);
    });

    it('should find books by title with case-insensitive search', () => {
      const books = bookService.findByTitle('book 1');
      expect(books).toHaveLength(1);
      expect(books[0]?.title).toBe('Book 1');
    });

    it('should find books by author', () => {
      const books = bookService.findByAuthor('Author 1');
      expect(books).toHaveLength(2);
    });

    it('should find books by year', () => {
      const books = bookService.findByYear(2023);
      expect(books).toHaveLength(1);
      expect(books[0]?.year).toBe(2023);
    });
  });

  describe('Update Operations', () => {
    let bookId: string;

    beforeEach(() => {
      const book = bookService.create({ 
        title: 'Original Title', 
        author: 'Original Author', 
        year: 2020 
      });
      bookId = book.id;
    });

    it('should update an existing book', () => {
      const updateData: UpdateBookData = {
        title: 'Updated Title',
        author: 'Updated Author',
        year: 2024
      };

      const updatedBook = bookService.update(bookId, updateData);

      expect(updatedBook).not.toBeNull();
      expect(updatedBook!.title).toBe('Updated Title');
      expect(updatedBook!.author).toBe('Updated Author');
      expect(updatedBook!.year).toBe(2024);
    });

    it('should update only specified fields', () => {
      const updateData: UpdateBookData = {
        title: 'Only Title Updated'
      };

      const updatedBook = bookService.update(bookId, updateData);

      expect(updatedBook).not.toBeNull();
      expect(updatedBook!.title).toBe('Only Title Updated');
      expect(updatedBook!.author).toBe('Original Author'); // Should remain unchanged
      expect(updatedBook!.year).toBe(2020); // Should remain unchanged
    });

    it('should return null for non-existent book', () => {
      const updateData: UpdateBookData = {
        title: 'Updated Title'
      };

      const result = bookService.update('non-existent-id', updateData);
      expect(result).toBeNull();
    });

    it('should validate update data', () => {
      const invalidData: UpdateBookData = {
        title: '', // Empty title should be invalid
      };

      expect(() => bookService.update(bookId, invalidData)).toThrow(ValidationError);
    });

    it('should sanitize update data', () => {
      const updateData: UpdateBookData = {
        title: '  Updated Title  ',
        author: '  Updated Author  '
      };

      const updatedBook = bookService.update(bookId, updateData);

      expect(updatedBook).not.toBeNull();
      expect(updatedBook!.title).toBe('Updated Title');
      expect(updatedBook!.author).toBe('Updated Author');
    });
  });

  describe('Delete Operations', () => {
    let bookId: string;

    beforeEach(() => {
      const book = bookService.create({ 
        title: 'Test Book', 
        author: 'Test Author', 
        year: 2023 
      });
      bookId = book.id;
    });

    it('should delete an existing book', () => {
      const result = bookService.delete(bookId);
      expect(result).toBe(true);

      const deletedBook = bookService.findById(bookId);
      expect(deletedBook).toBeNull();
    });

    it('should return false for non-existent book', () => {
      const result = bookService.delete('non-existent-id');
      expect(result).toBe(false);
    });

    it('should reduce total count after deletion', () => {
      const initialCount = bookService.count();
      bookService.delete(bookId);
      const finalCount = bookService.count();

      expect(finalCount).toBe(initialCount - 1);
    });
  });

  describe('Advanced Search Operations', () => {
    beforeEach(() => {
      // Add test data with specific patterns
      bookService.create({ title: 'Test Author Book 1', author: 'Test Author', year: 2023 });
      bookService.create({ title: 'Test Author Book 2', author: 'Test Author', year: 2023 });
      bookService.create({ title: 'Another Book', author: 'Different Author', year: 2022 });
      bookService.create({ title: 'Old Book', author: 'Old Author', year: 1990 });
    });

    it('should find books by author with exact match', () => {
      const booksByAuthor = bookService.findByAuthor('Test Author');

      expect(booksByAuthor).toHaveLength(2);
      expect(booksByAuthor.every((book: Book) => book.author === 'Test Author')).toBe(true);
    });

    it('should find books by author with case-insensitive partial match', () => {
      const booksByAuthor = bookService.findByAuthor('test');

      expect(booksByAuthor).toHaveLength(2); // Both books have "Test Author" which contains "test"
      expect(booksByAuthor.every((book: Book) => book.author.toLowerCase().includes('test'))).toBe(true);
    });

    it('should find books by title containing search term', () => {
      const booksByTitle = bookService.findByTitle('Author Book');

      expect(booksByTitle).toHaveLength(2);
      expect(booksByTitle.every((book: Book) => book.title.includes('Test Author Book'))).toBe(true);
    });

    it('should find books by year range', () => {
      // This tests the specific year search
      const recentBooks = bookService.findByYear(2023);
      const oldBooks = bookService.findByYear(1990);

      expect(recentBooks).toHaveLength(2);
      expect(oldBooks).toHaveLength(1);
    });

    it('should find books by multiple criteria using findByYear', () => {
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

  describe('Utility Operations', () => {
    it('should return correct count of books', () => {
      expect(bookService.count()).toBe(0);

      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2023 });
      expect(bookService.count()).toBe(1);

      bookService.create({ title: 'Book 2', author: 'Author 2', year: 2024 });
      expect(bookService.count()).toBe(2);
    });

    it('should correctly identify empty collection', () => {
      expect(bookService.isEmpty()).toBe(true);

      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2023 });
      expect(bookService.isEmpty()).toBe(false);
    });

    it('should clear all books', () => {
      bookService.create({ title: 'Book 1', author: 'Author 1', year: 2023 });
      bookService.create({ title: 'Book 2', author: 'Author 2', year: 2024 });

      expect(bookService.count()).toBe(2);

      bookService.clear();

      expect(bookService.count()).toBe(0);
      expect(bookService.isEmpty()).toBe(true);
      expect(bookService.findAll()).toEqual([]);
    });
  });

  describe('Safe Operations', () => {
    it('should provide safe create operation', () => {
      const validData: CreateBookData = {
        title: 'Safe Book',
        author: 'Safe Author',
        year: 2023
      };

      const result = bookService.safeCreate(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.title).toBe('Safe Book');
      }
    });

    it('should handle safe create with invalid data', () => {
      const invalidData = {
        title: '',
        author: 'Author',
        year: 2023
      } as CreateBookData;

      const result = bookService.safeCreate(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    it('should provide safe update operation', () => {
      const book = bookService.create({ title: 'Original', author: 'Author', year: 2023 });
      const updateData: UpdateBookData = { title: 'Updated' };

      const result = bookService.safeUpdate(book.id, updateData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.title).toBe('Updated');
      }
    });

    it('should handle safe update with non-existent book', () => {
      const updateData: UpdateBookData = { title: 'Updated' };

      const result = bookService.safeUpdate('non-existent-id', updateData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error).toBeInstanceOf(BookNotFoundError);
      }
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data integrity when retrieving books', () => {
      const originalData: CreateBookData = {
        title: 'Original Book',
        author: 'Original Author',
        year: 2023
      };

      const createdBook = bookService.create(originalData);
      const retrievedBook = bookService.findById(createdBook.id);

      expect(retrievedBook).toEqual(createdBook);
      expect(retrievedBook).not.toBe(createdBook); // Should be different object instances
    });

    it('should not allow external mutation of internal data', () => {
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
