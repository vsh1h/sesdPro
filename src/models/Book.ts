import mongoose, { Document, Schema } from "mongoose";
import { BookCategory } from "../utils/enums";

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  category: BookCategory;
  totalCopies: number;
  availableCopies: number;
  description?: string;
  publishedYear?: number;
  createdAt: Date;
  updatedAt: Date;
  borrowBook(): void;
  returnBook(): void;
  isAvailable(): boolean;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
      match: [/^[0-9-]{10,17}$/, "Please provide a valid ISBN"],
    },
    category: {
      type: String,
      enum: Object.values(BookCategory),
      required: [true, "Category is required"],
    },
    totalCopies: {
      type: Number,
      required: [true, "Total copies is required"],
      min: [1, "Total copies must be at least 1"],
    },
    availableCopies: {
      type: Number,
      required: [true, "Available copies is required"],
      min: [0, "Available copies cannot be negative"],
      validate: {
        validator: function (this: IBook, value: number) {
          return value <= this.totalCopies;
        },
        message: "Available copies cannot exceed total copies",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    publishedYear: {
      type: Number,
      min: [1000, "Published year must be valid"],
      max: [new Date().getFullYear(), "Published year cannot be in the future"],
    },
  },
  {
    timestamps: true,
  },
);

// Index for search functionality
bookSchema.index({ title: "text", author: "text" });

// Method to borrow a book
bookSchema.methods.borrowBook = function (): void {
  if (this.availableCopies <= 0) {
    throw new Error("No copies available for borrowing");
  }
  this.availableCopies -= 1;
};

// Method to return a book
bookSchema.methods.returnBook = function (): void {
  if (this.availableCopies >= this.totalCopies) {
    throw new Error("All copies are already returned");
  }
  this.availableCopies += 1;
};

// Method to check availability
bookSchema.methods.isAvailable = function (): boolean {
  return this.availableCopies > 0;
};

export const Book = mongoose.model<IBook>("Book", bookSchema);
