import { BookRepository, BookSearchOptions } from "../repositories/book.repository";
import { IBook } from "../models/Book";
import { ApiError } from "../utils/ApiError";
import { PaginationHelper, PaginationResult } from "../utils/pagination";
import { BookCategory } from "../utils/enums";

export class BookService {
  private bookRepository: BookRepository;

  constructor(bookRepository: BookRepository) {
    this.bookRepository = bookRepository;
  }

  async addBook(data: Partial<IBook>): Promise<IBook> {
    // Validation
    if (!data.totalCopies || data.totalCopies < 1) {
      throw ApiError.badRequest("Total copies must be at least 1");
    }

    // Set available copies equal to total copies if not provided
    if (data.availableCopies === undefined) {
      data.availableCopies = data.totalCopies;
    }

    // Validate available copies
    if (data.availableCopies > data.totalCopies) {
      throw ApiError.badRequest("Available copies cannot exceed total copies");
    }

    return await this.bookRepository.create(data);
  }

  async getAllBooks(query: any): Promise<PaginationResult<IBook>> {
    const { page, limit, sort } = PaginationHelper.getPaginationParams(query);

    const options: BookSearchOptions = {
      search: query.search,
      category: query.category as BookCategory,
      author: query.author,
      page,
      limit,
      sort,
    };

    const books = await this.bookRepository.findAll(options);
    const total = await this.bookRepository.count(options);

    return PaginationHelper.buildPaginationResult(books, total, page, limit);
  }

  async getBookById(id: string): Promise<IBook> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw ApiError.notFound("Book not found");
    }
    return book;
  }

  async updateBook(id: string, data: Partial<IBook>): Promise<IBook> {
    // Validate if updating copies
    if (data.totalCopies !== undefined || data.availableCopies !== undefined) {
      const existingBook = await this.bookRepository.findById(id);
      if (!existingBook) {
        throw ApiError.notFound("Book not found");
      }

      const totalCopies = data.totalCopies ?? existingBook.totalCopies;
      const availableCopies =
        data.availableCopies ?? existingBook.availableCopies;

      if (availableCopies > totalCopies) {
        throw ApiError.badRequest(
          "Available copies cannot exceed total copies",
        );
      }

      const borrowedCopies =
        existingBook.totalCopies - existingBook.availableCopies;
      if (data.totalCopies !== undefined && data.totalCopies < borrowedCopies) {
        throw ApiError.badRequest(
          `Cannot reduce total copies below currently borrowed count (${borrowedCopies})`,
        );
      }
    }

    const updated = await this.bookRepository.update(id, data);
    if (!updated) {
      throw ApiError.notFound("Book not found");
    }
    return updated;
  }

  async deleteBook(id: string): Promise<void> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw ApiError.notFound("Book not found");
    }

    // Check if book has borrowed copies
    const borrowedCopies = book.totalCopies - book.availableCopies;
    if (borrowedCopies > 0) {
      throw ApiError.badRequest("Cannot delete book with borrowed copies");
    }

    await this.bookRepository.delete(id);
  }

  async searchBooks(
    searchTerm: string,
    query: any,
  ): Promise<PaginationResult<IBook>> {
    const { page, limit, sort } = PaginationHelper.getPaginationParams(query);

    const options: BookSearchOptions = {
      search: searchTerm,
      page,
      limit,
      sort,
    };

    const books = await this.bookRepository.findAll(options);
    const total = await this.bookRepository.count(options);

    return PaginationHelper.buildPaginationResult(books, total, page, limit);
  }
}
