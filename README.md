# TypeScript CRUD Books Project

A comprehensive TypeScript project that demonstrates CRUD (Create, Read, Update, Delete) operations on an in-memory collection of books. This project showcases modern TypeScript development practices, proper error handling, comprehensive testing, and clean architecture.

## 🚀 Features

- **Complete CRUD Operations**: Create, read, update, and delete books
- **Type Safety**: Full TypeScript implementation with strict type checking
- **In-Memory Storage**: No external dependencies for data persistence
- **Error Handling**: Custom error types and safe operation variants
- **Comprehensive Testing**: Unit tests with Jest covering all functionality
- **CLI Interface**: Interactive command-line interface for book management
- **Search Functionality**: Search books by title, author, or year
- **Pagination**: Built-in pagination support for large collections
- **Data Validation**: Input validation and sanitization
- **Immutable Returns**: Prevents external mutation of internal data

## 📋 Project Structure

```
src/                      # Source code only
├── types.ts             # TypeScript interfaces and type definitions
├── utils.ts             # Utility functions (validation, ID generation)
├── BookService.ts       # Main service class with CRUD operations
├── BookCLI.ts          # Command-line interface
└── index.ts            # Main entry point

tests/                   # Test files (separated from source code)
├── BookService.test.ts  # Unit tests for BookService
├── utils.test.ts        # Unit tests for utility functions
└── types.test.ts        # Unit tests for type definitions

dist/                    # Compiled JavaScript output
node_modules/           # Dependencies
package.json            # Project configuration
tsconfig.json          # TypeScript configuration
jest.config.js         # Jest testing configuration
```

## 🛠️ Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

## 📚 Usage

### Building the Project

```bash
npm run build
```

### Running the Application

#### Interactive CLI Mode
```bash
npm run dev -- --cli
# or
npm start -- --cli
```

#### Programmatic Demo Mode
```bash
npm run dev
# or
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Cleaning Build Files

```bash
npm run clean
```

## 🔧 API Reference

### BookService Class

The main service class that provides CRUD operations:

#### Constructor
```typescript
const bookService = new BookService();
```

#### Create Operations
```typescript
// Create a new book
create(data: CreateBookData): Book

// Safe create (returns Result type)
safeCreate(data: CreateBookData): Result<Book>
```

#### Read Operations
```typescript
// Find book by ID
findById(id: string): Book | null

// Get all books
findAll(): Book[]

// Search by author (case-insensitive, partial match)
findByAuthor(author: string): Book[]

// Search by title (case-insensitive, partial match)
findByTitle(title: string): Book[]

// Find books by publication year
findByYear(year: number): Book[]

// Get paginated results
getPaginated(page: number, pageSize: number): PaginatedResult
```

#### Update Operations
```typescript
// Update a book
update(id: string, data: UpdateBookData): Book | null

// Safe update (returns Result type)
safeUpdate(id: string, data: UpdateBookData): Result<Book>
```

#### Delete Operations
```typescript
// Delete a book
delete(id: string): boolean

// Safe delete (throws error if not found)
safeDelete(id: string): void
```

#### Utility Operations
```typescript
// Get total count
count(): number

// Check if empty
isEmpty(): boolean

// Clear all books
clear(): void
```

### Type Definitions

#### Book Interface
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
}
```

#### CreateBookData Interface
```typescript
interface CreateBookData {
  title: string;
  author: string;
  year: number;
}
```

#### UpdateBookData Interface
```typescript
interface UpdateBookData {
  title?: string;
  author?: string;
  year?: number;
}
```

## 🧪 Example Usage

```typescript
import { BookService } from './BookService';

const bookService = new BookService();

// Create a book
const book = bookService.create({
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  year: 1925
});

// Find books
const foundBook = bookService.findById(book.id);
const allBooks = bookService.findAll();
const fitzgeraldBooks = bookService.findByAuthor('Fitzgerald');

// Update a book
const updatedBook = bookService.update(book.id, {
  title: 'The Great Gatsby (Revised Edition)'
});

// Delete a book
const deleteSuccess = bookService.delete(book.id);
```

## 🎯 Error Handling

The project includes comprehensive error handling:

### Custom Error Types

- **ValidationError**: Thrown for invalid input data
- **BookNotFoundError**: Thrown when attempting operations on non-existent books

### Safe Operations

Use safe operation variants that return `Result<T>` types instead of throwing:

```typescript
const result = bookService.safeCreate(bookData);
if (result.success) {
  console.log('Created:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

## 🔍 Validation Rules

### Book Creation/Update
- **Title**: Required, non-empty string (trimmed)
- **Author**: Required, non-empty string (trimmed)
- **Year**: Valid integer between 0 and current year

### Update Operations
- At least one field must be provided
- All provided fields must pass validation

## 🧪 Testing

The project includes comprehensive unit tests covering:

- All CRUD operations
- Error handling scenarios
- Edge cases and boundary conditions
- Data validation
- Utility functions
- Type definitions

Run tests with:
```bash
npm test
```

### Test Coverage

- **BookService**: 100% coverage of all methods
- **Utils**: Complete validation and utility function testing
- **Types**: Error type behavior verification
- **Edge Cases**: Empty collections, invalid data, boundary conditions

## 🏗️ Architecture

### Design Patterns Used

- **Repository Pattern**: `BookService` implements `CrudRepository` interface
- **Generic Interfaces**: Reusable CRUD interface with type parameters
- **Result Pattern**: Safe operations return `Result<T>` for better error handling
- **Immutable Returns**: All methods return copies to prevent external mutation

### TypeScript Features

- **Strict Type Checking**: Enabled with `strict: true`
- **Interface Definitions**: Clear contracts for data structures
- **Generic Types**: Flexible, reusable interfaces
- **Union Types**: `Result<T, E>` for error handling
- **Optional Properties**: `UpdateBookData` with optional fields

## 🔧 Configuration

### TypeScript Configuration (tsconfig.json)
- Target: ES2020
- Strict mode enabled
- Source maps for debugging
- Declaration files generated

### Jest Configuration (jest.config.js)
- TypeScript support via ts-jest
- Coverage reporting
- Test file pattern matching

## 🚀 Development

### Adding New Features

1. **Add Types**: Define interfaces in `types.ts`
2. **Implement Logic**: Add methods to `BookService.ts`
3. **Add Validation**: Update `utils.ts` if needed
4. **Write Tests**: Create comprehensive tests
5. **Update CLI**: Add new commands to `BookCLI.ts` if needed

### Best Practices Followed

- **Single Responsibility**: Each class has a clear, focused purpose
- **Type Safety**: Full TypeScript coverage with strict checking
- **Error Handling**: Comprehensive error scenarios covered
- **Testing**: High test coverage with edge cases
- **Documentation**: Clear comments and README
- **Immutability**: Prevent external mutation of internal state

## 📄 License

MIT License - feel free to use this project for learning and development purposes.

## 🤝 Contributing

This is a learning project demonstrating TypeScript CRUD operations. Feel free to:

- Add new features (e.g., file persistence, sorting, filtering)
- Improve error handling
- Add more comprehensive validation
- Extend the CLI interface
- Add integration tests

## 📝 Notes

- This project uses in-memory storage - data is lost when the application stops
- All operations are synchronous for simplicity
- The CLI interface demonstrates interactive usage patterns
- The project follows modern TypeScript and Node.js best practices
