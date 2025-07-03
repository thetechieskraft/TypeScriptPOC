import { 
  Book, 
  CreateBookData, 
  UpdateBookData, 
  CrudRepository, 
  BookNotFoundError,
  Result 
} from './types';
import { 
  generateId, 
  validateCreateBookData, 
  validateUpdateBookData, 
  sanitizeString 
} from './utils';

/**
 * Service class for managing book CRUD operations
 * Implements in-memory storage with full CRUD functionality
 */
export class BookService implements CrudRepository<Book, string, CreateBookData, UpdateBookData> {
  private books: Map<string, Book> = new Map();

  /**
   * Creates a new book and adds it to the collection
   * @param data - The book data to create
   * @returns The created book with generated ID
   * @throws ValidationError if the data is invalid
   */
  create(data: CreateBookData): Book {
    validateCreateBookData(data);

    const book: Book = {
      id: generateId(),
      title: sanitizeString(data.title),
      author: sanitizeString(data.author),
      year: data.year
    };

    this.books.set(book.id, book);
    return { ...book }; // Return a copy to prevent external mutation
  }

  /**
   * Safe version of create that returns a Result type
   * @param data - The book data to create
   * @returns Result containing either the created book or an error
   */
  safeCreate(data: CreateBookData): Result<Book> {
    try {
      const book = this.create(data);
      return { success: true, data: book };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Finds a book by its ID
   * @param id - The ID of the book to find
   * @returns The book if found, null otherwise
   */
  findById(id: string): Book | null {
    const book = this.books.get(id);
    return book ? { ...book } : null; // Return a copy to prevent external mutation
  }

  /**
   * Retrieves all books in the collection
   * @returns Array of all books
   */
  findAll(): Book[] {
    return Array.from(this.books.values()).map(book => ({ ...book })); // Return copies
  }

  /**
   * Finds books by author
   * @param author - The author name to search for
   * @returns Array of books by the specified author
   */
  findByAuthor(author: string): Book[] {
    const normalizedAuthor = author.toLowerCase().trim();
    return this.findAll().filter(book => 
      book.author.toLowerCase().includes(normalizedAuthor)
    );
  }

  /**
   * Finds books by title (partial match, case-insensitive)
   * @param title - The title to search for
   * @returns Array of books matching the title
   */
  findByTitle(title: string): Book[] {
    const normalizedTitle = title.toLowerCase().trim();
    return this.findAll().filter(book => 
      book.title.toLowerCase().includes(normalizedTitle)
    );
  }

  /**
   * Finds books by year
   * @param year - The publication year
   * @returns Array of books published in the specified year
   */
  findByYear(year: number): Book[] {
    return this.findAll().filter(book => book.year === year);
  }

  /**
   * Updates an existing book
   * @param id - The ID of the book to update
   * @param data - The data to update
   * @returns The updated book if found, null otherwise
   * @throws ValidationError if the update data is invalid
   */
  update(id: string, data: UpdateBookData): Book | null {
    validateUpdateBookData(data);

    const existingBook = this.books.get(id);
    if (!existingBook) {
      return null;
    }

    const updatedBook: Book = {
      ...existingBook,
      title: data.title ? sanitizeString(data.title) : existingBook.title,
      author: data.author ? sanitizeString(data.author) : existingBook.author,
      year: data.year !== undefined ? data.year : existingBook.year
    };

    this.books.set(id, updatedBook);
    return { ...updatedBook }; // Return a copy
  }

  /**
   * Safe version of update that returns a Result type
   * @param id - The ID of the book to update
   * @param data - The data to update
   * @returns Result containing either the updated book or an error
   */
  safeUpdate(id: string, data: UpdateBookData): Result<Book> {
    try {
      const book = this.update(id, data);
      if (!book) {
        return { success: false, error: new BookNotFoundError(id) };
      }
      return { success: true, data: book };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Deletes a book by its ID
   * @param id - The ID of the book to delete
   * @returns true if the book was deleted, false if not found
   */
  delete(id: string): boolean {
    return this.books.delete(id);
  }

  /**
   * Safe version of delete that throws an error if book not found
   * @param id - The ID of the book to delete
   * @throws BookNotFoundError if the book is not found
   */
  safeDelete(id: string): void {
    if (!this.delete(id)) {
      throw new BookNotFoundError(id);
    }
  }

  /**
   * Gets the total number of books in the collection
   * @returns The count of books
   */
  count(): number {
    return this.books.size;
  }

  /**
   * Clears all books from the collection
   */
  clear(): void {
    this.books.clear();
  }

  /**
   * Checks if the collection is empty
   * @returns true if no books exist, false otherwise
   */
  isEmpty(): boolean {
    return this.books.size === 0;
  }

  /**
   * Gets books in a paginated manner
   * @param page - Page number (1-based)
   * @param pageSize - Number of books per page
   * @returns Object containing books for the page and pagination info
   */
  getPaginated(page: number = 1, pageSize: number = 10): {
    books: Book[];
    totalBooks: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } {
    const totalBooks = this.count();
    const totalPages = Math.ceil(totalBooks / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const allBooks = this.findAll();
    const books = allBooks.slice(startIndex, endIndex);

    return {
      books,
      totalBooks,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }
}
