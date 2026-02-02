import { Request, Response, NextFunction } from "express";
import { BorrowService } from "../services/borrow.service";

export class BorrowController {
  private borrowService: BorrowService;

  constructor(borrowService: BorrowService) {
    this.borrowService = borrowService;
  }

  borrowBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { bookId } = req.body;

      const borrow = await this.borrowService.borrowBook(userId, bookId);

      res.status(201).json({
        success: true,
        message: "Book borrowed successfully",
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  returnBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const borrow = await this.borrowService.returnBook(id);

      res.status(200).json({
        success: true,
        message: "Book returned successfully",
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyBorrows = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const result = await this.borrowService.getUserBorrows(userId, req.query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllBorrows = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.borrowService.getAllBorrows(req.query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getBorrowById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const borrow = await this.borrowService.getBorrowById(req.params.id);

      res.status(200).json({
        success: true,
        data: borrow,
      });
    } catch (error) {
      next(error);
    }
  };

  getOverdue = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const borrows = await this.borrowService.getOverdueBorrows();

      res.status(200).json({
        success: true,
        data: borrows,
      });
    } catch (error) {
      next(error);
    }
  };
}
