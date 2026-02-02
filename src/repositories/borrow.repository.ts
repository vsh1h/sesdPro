import { Borrow, IBorrow } from "../models/Borrow";
import { ApiError } from "../utils/ApiError";
import { BorrowStatus } from "../utils/enums";

export interface BorrowSearchOptions {
  userId?: string;
  bookId?: string;
  status?: BorrowStatus;
  page?: number;
  limit?: number;
  sort?: string;
}

export class BorrowRepository {
  async create(borrowData: Partial<IBorrow>): Promise<IBorrow> {
    const borrow = await Borrow.create(borrowData);
    return borrow;
  }

  async findById(id: string): Promise<IBorrow | null> {
    return Borrow.findById(id)
      .populate("userId", "name email")
      .populate("bookId", "title author isbn");
  }

  async findAll(options: BorrowSearchOptions = {}): Promise<IBorrow[]> {
    const {
      userId,
      bookId,
      status,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = options;

    const query: any = {};

    if (userId) query.userId = userId;
    if (bookId) query.bookId = bookId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    return Borrow.find(query)
      .populate("userId", "name email")
      .populate("bookId", "title author isbn")
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(options: BorrowSearchOptions = {}): Promise<number> {
    const { userId, bookId, status } = options;

    const query: any = {};

    if (userId) query.userId = userId;
    if (bookId) query.bookId = bookId;
    if (status) query.status = status;

    return Borrow.countDocuments(query);
  }

  async findActiveBorrowByUserAndBook(
    userId: string,
    bookId: string,
  ): Promise<IBorrow | null> {
    return Borrow.findOne({
      userId,
      bookId,
      status: { $in: [BorrowStatus.ACTIVE, BorrowStatus.OVERDUE] },
    });
  }

  async update(
    id: string,
    borrowData: Partial<IBorrow>,
  ): Promise<IBorrow | null> {
    const borrow = await Borrow.findByIdAndUpdate(
      id,
      { $set: borrowData },
      { new: true, runValidators: true },
    )
      .populate("userId", "name email")
      .populate("bookId", "title author isbn");

    if (!borrow) {
      throw ApiError.notFound("Borrow record not found");
    }

    return borrow;
  }

  async findOverdueBorrows(): Promise<IBorrow[]> {
    return Borrow.find({
      status: { $in: [BorrowStatus.ACTIVE, BorrowStatus.OVERDUE] },
      dueDate: { $lt: new Date() },
    })
      .populate("userId", "name email")
      .populate("bookId", "title author isbn");
  }

  async updateOverdueStatus(): Promise<void> {
    const overdueRecords = await this.findOverdueBorrows();

    for (const record of overdueRecords) {
      if (record.status === BorrowStatus.ACTIVE) {
        record.status = BorrowStatus.OVERDUE;
        record.fine = record.calculateFine();
        await record.save();
      }
    }
  }
}
