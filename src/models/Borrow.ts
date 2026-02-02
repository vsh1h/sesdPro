import mongoose, { Document, Schema } from "mongoose";
import { BorrowStatus } from "../utils/enums";

export interface IBorrow extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: BorrowStatus;
  fine: number;
  createdAt: Date;
  updatedAt: Date;
  calculateFine(): number;
  isOverdue(): boolean;
}

const borrowSchema = new Schema<IBorrow>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book ID is required"],
    },
    borrowDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(BorrowStatus),
      default: BorrowStatus.ACTIVE,
    },
    fine: {
      type: Number,
      default: 0,
      min: [0, "Fine cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
borrowSchema.index({ userId: 1, status: 1 });
borrowSchema.index({ bookId: 1, status: 1 });
borrowSchema.index({ dueDate: 1, status: 1 });

// Method to calculate fine
borrowSchema.methods.calculateFine = function (): number {
  if (!this.returnDate || this.status === BorrowStatus.RETURNED) {
    return this.fine;
  }

  const currentDate = new Date();
  const dueDate = new Date(this.dueDate);

  if (currentDate <= dueDate) {
    return 0;
  }

  const daysOverdue = Math.ceil(
    (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const finePerDay = parseInt(process.env.FINE_PER_DAY || "5");
  return daysOverdue * finePerDay;
};

// Method to check if overdue
borrowSchema.methods.isOverdue = function (): boolean {
  if (this.status === BorrowStatus.RETURNED) {
    return false;
  }

  const currentDate = new Date();
  const dueDate = new Date(this.dueDate);
  return currentDate > dueDate;
};

// Update status to OVERDUE automatically
borrowSchema.pre("save", function (next) {
  if (this.isOverdue() && this.status === BorrowStatus.ACTIVE) {
    this.status = BorrowStatus.OVERDUE;
    this.fine = this.calculateFine();
  }
  next();
});

export const Borrow = mongoose.model<IBorrow>("Borrow", borrowSchema);
