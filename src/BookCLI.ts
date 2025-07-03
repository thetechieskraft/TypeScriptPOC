import * as readline from 'readline';
import { BookService } from './BookService';
import { CreateBookData, UpdateBookData, BookNotFoundError, ValidationError } from './types';

/**
 * Simple CLI interface for interacting with the book collection
 * Provides a menu-driven interface for CRUD operations
 */
export class BookCLI {
  private bookService: BookService;
  private rl: readline.Interface;

  constructor() {
    this.bookService = new BookService();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Starts the CLI interface
   */
  async start(): Promise<void> {
    console.log('📚 Welcome to the Book Management System!');
    console.log('=========================================');
    
    // Add some sample data
    this.addSampleData();
    
    await this.showMainMenu();
  }

  /**
   * Adds sample books for demonstration
   */
  private addSampleData(): void {
    const sampleBooks = [
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
      { title: '1984', author: 'George Orwell', year: 1949 },
      { title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813 }
    ];

    sampleBooks.forEach(book => {
      try {
        this.bookService.create(book);
      } catch (error) {
        console.log(`Failed to add sample book: ${book.title}`);
      }
    });

    console.log(`✅ Added ${sampleBooks.length} sample books to get you started!\n`);
  }

  /**
   * Shows the main menu and handles user input
   */
  private async showMainMenu(): Promise<void> {
    while (true) {
      console.log('\n📋 Main Menu:');
      console.log('1. View all books');
      console.log('2. Search books');
      console.log('3. Add a new book');
      console.log('4. Update a book');
      console.log('5. Delete a book');
      console.log('6. View statistics');
      console.log('7. Exit');

      const choice = await this.question('Enter your choice (1-7): ');

      try {
        switch (choice.trim()) {
          case '1':
            await this.viewAllBooks();
            break;
          case '2':
            await this.searchBooks();
            break;
          case '3':
            await this.addBook();
            break;
          case '4':
            await this.updateBook();
            break;
          case '5':
            await this.deleteBook();
            break;
          case '6':
            await this.viewStatistics();
            break;
          case '7':
            console.log('👋 Thank you for using the Book Management System!');
            this.rl.close();
            return;
          default:
            console.log('❌ Invalid choice. Please enter a number between 1 and 7.');
        }
      } catch (error) {
        console.log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Displays all books in the collection
   */
  private async viewAllBooks(): Promise<void> {
    const books = this.bookService.findAll();
    
    if (books.length === 0) {
      console.log('📭 No books found in the collection.');
      return;
    }

    console.log(`\n📚 All Books (${books.length} total):`);
    console.log('─'.repeat(80));
    
    books.forEach((book, index) => {
      console.log(`${index + 1}. 📖 ${book.title}`);
      console.log(`   Author: ${book.author}`);
      console.log(`   Year: ${book.year}`);
      console.log(`   ID: ${book.id}`);
      console.log('');
    });
  }

  /**
   * Handles book search functionality
   */
  private async searchBooks(): Promise<void> {
    console.log('\n🔍 Search Options:');
    console.log('1. Search by title');
    console.log('2. Search by author');
    console.log('3. Search by year');
    console.log('4. Find by ID');

    const choice = await this.question('Enter your choice (1-4): ');

    switch (choice.trim()) {
      case '1':
        await this.searchByTitle();
        break;
      case '2':
        await this.searchByAuthor();
        break;
      case '3':
        await this.searchByYear();
        break;
      case '4':
        await this.searchById();
        break;
      default:
        console.log('❌ Invalid choice.');
    }
  }

  private async searchByTitle(): Promise<void> {
    const title = await this.question('Enter title to search: ');
    const books = this.bookService.findByTitle(title);
    this.displaySearchResults(books, `title containing "${title}"`);
  }

  private async searchByAuthor(): Promise<void> {
    const author = await this.question('Enter author to search: ');
    const books = this.bookService.findByAuthor(author);
    this.displaySearchResults(books, `author containing "${author}"`);
  }

  private async searchByYear(): Promise<void> {
    const yearStr = await this.question('Enter year to search: ');
    const year = parseInt(yearStr, 10);
    
    if (isNaN(year)) {
      console.log('❌ Please enter a valid year.');
      return;
    }

    const books = this.bookService.findByYear(year);
    this.displaySearchResults(books, `year ${year}`);
  }

  private async searchById(): Promise<void> {
    const id = await this.question('Enter book ID: ');
    const book = this.bookService.findById(id);
    
    if (book) {
      console.log('\n✅ Book found:');
      this.displayBook(book);
    } else {
      console.log('❌ Book not found.');
    }
  }

  private displaySearchResults(books: any[], searchCriteria: string): void {
    if (books.length === 0) {
      console.log(`❌ No books found for ${searchCriteria}.`);
      return;
    }

    console.log(`\n✅ Found ${books.length} book(s) for ${searchCriteria}:`);
    console.log('─'.repeat(80));
    
    books.forEach((book, index) => {
      console.log(`${index + 1}. 📖 ${book.title} by ${book.author} (${book.year})`);
      console.log(`   ID: ${book.id}`);
    });
  }

  /**
   * Adds a new book to the collection
   */
  private async addBook(): Promise<void> {
    console.log('\n➕ Add New Book');
    console.log('─'.repeat(20));

    const title = await this.question('Enter book title: ');
    const author = await this.question('Enter author name: ');
    const yearStr = await this.question('Enter publication year: ');

    const year = parseInt(yearStr, 10);
    if (isNaN(year)) {
      console.log('❌ Please enter a valid year.');
      return;
    }

    const bookData: CreateBookData = { title, author, year };

    try {
      const newBook = this.bookService.create(bookData);
      console.log('✅ Book added successfully!');
      this.displayBook(newBook);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log(`❌ Validation Error: ${error.message}`);
      } else {
        console.log(`❌ Error adding book: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Updates an existing book
   */
  private async updateBook(): Promise<void> {
    const id = await this.question('Enter the ID of the book to update: ');
    const existingBook = this.bookService.findById(id);

    if (!existingBook) {
      console.log('❌ Book not found.');
      return;
    }

    console.log('\n📝 Current book details:');
    this.displayBook(existingBook);

    console.log('\n✏️ Enter new values (press Enter to keep current value):');

    const title = await this.question(`Title [${existingBook.title}]: `);
    const author = await this.question(`Author [${existingBook.author}]: `);
    const yearStr = await this.question(`Year [${existingBook.year}]: `);

    const updateData: UpdateBookData = {};

    if (title.trim()) updateData.title = title;
    if (author.trim()) updateData.author = author;
    if (yearStr.trim()) {
      const year = parseInt(yearStr, 10);
      if (isNaN(year)) {
        console.log('❌ Invalid year provided.');
        return;
      }
      updateData.year = year;
    }

    if (Object.keys(updateData).length === 0) {
      console.log('ℹ️ No changes made.');
      return;
    }

    try {
      const updatedBook = this.bookService.update(id, updateData);
      if (updatedBook) {
        console.log('✅ Book updated successfully!');
        this.displayBook(updatedBook);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log(`❌ Validation Error: ${error.message}`);
      } else {
        console.log(`❌ Error updating book: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Deletes a book from the collection
   */
  private async deleteBook(): Promise<void> {
    const id = await this.question('Enter the ID of the book to delete: ');
    const existingBook = this.bookService.findById(id);

    if (!existingBook) {
      console.log('❌ Book not found.');
      return;
    }

    console.log('\n📖 Book to be deleted:');
    this.displayBook(existingBook);

    const confirm = await this.question('Are you sure you want to delete this book? (yes/no): ');

    if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
      try {
        this.bookService.safeDelete(id);
        console.log('✅ Book deleted successfully!');
      } catch (error) {
        if (error instanceof BookNotFoundError) {
          console.log(`❌ ${error.message}`);
        } else {
          console.log(`❌ Error deleting book: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      console.log('ℹ️ Delete operation cancelled.');
    }
  }

  /**
   * Displays collection statistics
   */
  private async viewStatistics(): Promise<void> {
    const totalBooks = this.bookService.count();
    const books = this.bookService.findAll();

    console.log('\n📊 Collection Statistics:');
    console.log('─'.repeat(30));
    console.log(`Total Books: ${totalBooks}`);

    if (totalBooks === 0) {
      console.log('Collection is empty.');
      return;
    }

    // Author statistics
    const authorCounts = new Map<string, number>();
    books.forEach(book => {
      const count = authorCounts.get(book.author) || 0;
      authorCounts.set(book.author, count + 1);
    });

    console.log(`Unique Authors: ${authorCounts.size}`);

    // Year statistics
    const years = books.map(book => book.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    console.log(`Publication Year Range: ${minYear} - ${maxYear}`);

    // Most prolific author
    let mostProlificAuthor = '';
    let maxBookCount = 0;
    authorCounts.forEach((count, author) => {
      if (count > maxBookCount) {
        maxBookCount = count;
        mostProlificAuthor = author;
      }
    });

    if (mostProlificAuthor) {
      console.log(`Most Prolific Author: ${mostProlificAuthor} (${maxBookCount} book${maxBookCount > 1 ? 's' : ''})`);
    }
  }

  /**
   * Displays a single book's information
   */
  private displayBook(book: any): void {
    console.log(`📖 Title: ${book.title}`);
    console.log(`👤 Author: ${book.author}`);
    console.log(`📅 Year: ${book.year}`);
    console.log(`🆔 ID: ${book.id}`);
  }

  /**
   * Prompts the user for input
   */
  private question(prompt: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(prompt, resolve);
    });
  }
}
