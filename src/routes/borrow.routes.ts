import { Router } from "express";
import { BorrowController } from "../controllers/borrow.controller";
import { BorrowService } from "../services/borrow.service";
import { BorrowRepository } from "../repositories/borrow.repository";
import { BookRepository } from "../repositories/book.repository";
import { UserRepository } from "../repositories/user.repository";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../utils/enums";

const router = Router();

// Initialize dependencies
const borrowRepository = new BorrowRepository();
const bookRepository = new BookRepository();
const userRepository = new UserRepository();
const borrowService = new BorrowService(
  borrowRepository,
  bookRepository,
  userRepository,
);
const borrowController = new BorrowController(borrowService);

router.use(authenticate);

router.post("/", borrowController.borrowBook);
router.post("/:id/return", borrowController.returnBook);
router.get("/my-borrows", borrowController.getMyBorrows);
router.get("/overdue", authorize(UserRole.ADMIN), borrowController.getOverdue);

router.get("/", authorize(UserRole.ADMIN), borrowController.getAllBorrows);
router.get("/:id", authorize(UserRole.ADMIN), borrowController.getBorrowById);

export default router;
