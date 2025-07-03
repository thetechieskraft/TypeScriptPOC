import { BookService } from './BookService';
import { BookCLI } from './BookCLI';
import { CreateBookData } from './types';

/**
 * Main entry point for the application
 * Demonstrates both programmatic usage and CLI interface
 */
async function main(): Promise<void> {
  // Check if we should run the CLI interface
  const args = process.argv.slice(2);
  
  if (args.includes('--cli') || args.includes('-c')) {
    // Run the interactive CLI
    const cli = new BookCLI();
    await cli.start();
    return;
  }

  // Otherwise, demonstrate programmatic usage
  console.log('📚 Book Management System - Programmatic Demo');
  console.log('============================================\n');

  const bookService = new BookService();

  try {
    // Demonstrate CREATE operations
    console.log('➕ Creating books...');
    const books: CreateBookData[] = [
      { title: 'The Catcher in the Rye', author: 'J.D. Salinger', year: 1951 },
      { title: 'Lord of the Flies', author: 'William Golding', year: 1954 },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', year: 1937 },
      { title: 'Dune', author: 'Frank Herbert', year: 1965 }
    ];

    const createdBooks = books.map(bookData => {
      const book = bookService.create(bookData);
      console.log(`✅ Created: "${book.title}" by ${book.author} (ID: ${book.id})`);
      return book;
    });

    console.log(`\n📊 Total books created: ${bookService.count()}\n`);

    // Demonstrate READ operations
    console.log('👀 Reading operations...');
    
    // Find all books
    console.log('All books:');
    bookService.findAll().forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title} by ${book.author} (${book.year})`);
    });

    // Find by ID
    const firstBook = createdBooks[0];
    if (firstBook) {
      const foundBook = bookService.findById(firstBook.id);
      console.log(`\n🔍 Found by ID "${firstBook.id}": ${foundBook?.title ?? 'Not found'}`);
    }

    // Find by author
    const tolkienBooks = bookService.findByAuthor('Tolkien');
    console.log(`\n📖 Books by Tolkien: ${tolkienBooks.length}`);
    tolkienBooks.forEach(book => {
      console.log(`  - ${book.title} (${book.year})`);
    });

    // Find by year
    const books1950s = bookService.findByYear(1954);
    console.log(`\n📅 Books from 1954: ${books1950s.length}`);
    books1950s.forEach(book => {
      console.log(`  - ${book.title} by ${book.author}`);
    });

    // Demonstrate UPDATE operations
    console.log('\n✏️ Updating a book...');
    const bookToUpdate = createdBooks[1];
    if (bookToUpdate) {
      const updatedBook = bookService.update(bookToUpdate.id, { 
        title: 'Lord of the Flies (Updated Edition)',
        year: 1955 
      });
      
      if (updatedBook) {
        console.log(`✅ Updated: "${updatedBook.title}" (${updatedBook.year})`);
      }
    }

    // Demonstrate error handling for update
    console.log('\n❌ Attempting to update non-existent book...');
    const nonExistentUpdate = bookService.update('fake-id', { title: 'This will fail' });
    console.log(`Result: ${nonExistentUpdate ? 'Success' : 'Failed as expected'}`);

    // Demonstrate safe operations
    console.log('\n🛡️ Using safe operations...');
    const safeCreateResult = bookService.safeCreate({
      title: 'Animal Farm',
      author: 'George Orwell',
      year: 1945
    });

    if (safeCreateResult.success) {
      console.log(`✅ Safe create succeeded: ${safeCreateResult.data.title}`);
    } else {
      console.log(`❌ Safe create failed: ${safeCreateResult.error.message}`);
    }

    // Demonstrate pagination
    console.log('\n📄 Pagination demo (page 1, 2 items per page):');
    const paginatedResult = bookService.getPaginated(1, 2);
    console.log(`Page ${paginatedResult.currentPage} of ${paginatedResult.totalPages}`);
    console.log(`Showing ${paginatedResult.books.length} of ${paginatedResult.totalBooks} books:`);
    paginatedResult.books.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title} by ${book.author}`);
    });

    // Demonstrate DELETE operations
    console.log('\n🗑️ Deleting a book...');
    const bookToDelete = createdBooks[2];
    if (bookToDelete) {
      const deleteSuccess = bookService.delete(bookToDelete.id);
      console.log(`Delete result: ${deleteSuccess ? 'Success' : 'Failed'}`);
      console.log(`Books remaining: ${bookService.count()}`);
    }

    // Demonstrate error handling for delete
    console.log('\n❌ Attempting to safely delete non-existent book...');
    try {
      bookService.safeDelete('fake-id');
    } catch (error) {
      console.log(`Caught expected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Final statistics
    console.log('\n📊 Final Statistics:');
    console.log(`Total books: ${bookService.count()}`);
    console.log(`Is empty: ${bookService.isEmpty()}`);

  } catch (error) {
    console.error('❌ An error occurred:', error instanceof Error ? error.message : error);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('Failed to run application:', error);
    process.exit(1);
  });
}
