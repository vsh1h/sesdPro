import { BorrowRepository, BorrowSearchOptions } from "../repositories/borrow.repository";
import { BookRepository } from "../repositories/book.repository";
import { UserRepository } from "../repositories/user.repository";
import { IBorrow } from "../models/Borrow";
import { ApiError } from "../utils/ApiError";
import { PaginationHelper, PaginationResult } from "../utils/pagination";
import { BorrowStatus } from "../utils/enums";

export class BorrowService {
  private borrowRepository: BorrowRepository;
  private bookRepository: BookRepository;
  private userRepository: UserRepository;
  private maxBorrowDays: number;

  constructor(
    borrowRepository: BorrowRepository,
    bookRepository: BookRepository,
    userRepository: UserRepository,
  ) {
    this.borrowRepository = borrowRepository;
    this.bookRepository = bookRepository;
    this.userRepository = userRepository;
    this.maxBorrowDays = parseInt(process.env.MAX_BORROW_DAYS || "14");
  }

  async borrowBook(userId: string, bookId: string): Promise<IBorrow> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Check if book exists
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw ApiError.notFound("Book not found");
    }

    // Check if book is available
    if (!book.isAvailable()) {
      throw ApiError.badRequest("Book is not available for borrowing");
    }

    // Check if user already has an active borrow for this book
    const existingBorrow =
      await this.borrowRepository.findActiveBorrowByUserAndBook(userId, bookId);
    if (existingBorrow) {
      throw ApiError.badRequest(
        "You already have an active borrow for this book",
      );
    }

    // Calculate due date
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + this.maxBorrowDays);

    // Create borrow record
    const borrow = await this.borrowRepository.create({
      userId: userId as any,
      bookId: bookId as any,
      borrowDate,
      dueDate,
      status: BorrowStatus.ACTIVE,
      fine: 0,
    });

    // Decrement available copies
    await this.bookRepository.decrementAvailableCopies(bookId);

    return borrow;
  }

  async returnBook(borrowId: string): Promise<IBorrow> {
    const borrow = await this.borrowRepository.findById(borrowId);
    if (!borrow) {
      throw ApiError.notFound("Borrow record not found");
    }

    // Check if already returned
    if (borrow.status === BorrowStatus.RETURNED) {
      throw ApiError.badRequest("Book has already been returned");
    }

    // Calculate fine if overdue
    const returnDate = new Date();
    const fine = borrow.calculateFine();

    // Update borrow record
    const updatedBorrow = await this.borrowRepository.update(borrowId, {
      returnDate,
      status: BorrowStatus.RETURNED,
      fine,
    });

    // Increment available copies
    await this.bookRepository.incrementAvailableCopies(
      borrow.bookId.toString(),
    );

    return updatedBorrow!;
  }

  async getUserBorrows(
    userId: string,
    query: any,
  ): Promise<PaginationResult<IBorrow>> {
    const { page, limit, sort } = PaginationHelper.getPaginationParams(query);

    const options: BorrowSearchOptions = {
      userId,
      status: query.status as BorrowStatus,
      page,
      limit,
      sort,
    };

    const borrows = await this.borrowRepository.findAll(options);
    const total = await this.borrowRepository.count(options);

    return PaginationHelper.buildPaginationResult(borrows, total, page, limit);
  }

  async getAllBorrows(query: any): Promise<PaginationResult<IBorrow>> {
    const { page, limit, sort } = PaginationHelper.getPaginationParams(query);

    const options: BorrowSearchOptions = {
      status: query.status as BorrowStatus,
      page,
      limit,
      sort,
    };

    const borrows = await this.borrowRepository.findAll(options);
    const total = await this.borrowRepository.count(options);

    return PaginationHelper.buildPaginationResult(borrows, total, page, limit);
  }

  async getBorrowById(borrowId: string): Promise<IBorrow> {
    const borrow = await this.borrowRepository.findById(borrowId);
    if (!borrow) {
      throw ApiError.notFound("Borrow record not found");
    }
    return borrow;
  }

  async updateOverdueRecords(): Promise<void> {
    await this.borrowRepository.updateOverdueStatus();
  }

  async getOverdueBorrows(): Promise<IBorrow[]> {
    return await this.borrowRepository.findOverdueBorrows();
  }
}
