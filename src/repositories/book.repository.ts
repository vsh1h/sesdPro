import { Book, IBook } from "../models/Book";
import { ApiError } from "../utils/ApiError";
import { BookCategory } from "../utils/enums";

export interface BookSearchOptions {
  search?: string;
  category?: BookCategory;
  author?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class BookRepository {
  async create(bookData: Partial<IBook>): Promise<IBook> {
    try {
      const book = await Book.create(bookData);
      return book;
    } catch (error: any) {
      if (error.code === 11000) {
        throw ApiError.badRequest("ISBN already exists");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<IBook | null> {
    return Book.findById(id);
  }

  async findByIsbn(isbn: string): Promise<IBook | null> {
    return Book.findOne({ isbn });
  }

  async findAll(options: BookSearchOptions = {}): Promise<IBook[]> {
    const {
      search,
      category,
      author,
      sort = "-createdAt",
      page = 1,
      limit = 10,
    } = options;

    const query: any = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by author
    if (author) {
      query.author = { $regex: author, $options: "i" };
    }

    const skip = (page - 1) * limit;

    return Book.find(query).sort(sort).skip(skip).limit(limit);
  }

  async count(options: BookSearchOptions = {}): Promise<number> {
    const { search, category, author } = options;

    const query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = { $regex: author, $options: "i" };
    }

    return Book.countDocuments(query);
  }

  async update(id: string, bookData: Partial<IBook>): Promise<IBook | null> {
    const book = await Book.findByIdAndUpdate(
      id,
      { $set: bookData },
      { new: true, runValidators: true },
    );

    if (!book) {
      throw ApiError.notFound("Book not found");
    }

    return book;
  }

  async delete(id: string): Promise<void> {
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      throw ApiError.notFound("Book not found");
    }
  }

  async decrementAvailableCopies(id: string): Promise<IBook | null> {
    const book = await Book.findById(id);

    if (!book) {
      throw ApiError.notFound("Book not found");
    }

    book.borrowBook();
    await book.save();

    return book;
  }

  async incrementAvailableCopies(id: string): Promise<IBook | null> {
    const book = await Book.findById(id);

    if (!book) {
      throw ApiError.notFound("Book not found");
    }

    book.returnBook();
    await book.save();

    return book;
  }
}
