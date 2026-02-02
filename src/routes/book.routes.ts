import { Router } from "express";
import { BookController } from "../controllers/book.controller";
import { BookService } from "../services/book.service";
import { BookRepository } from "../repositories/book.repository";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../utils/enums";

const router = Router();

// Initialize dependencies
const bookRepository = new BookRepository();
const bookService = new BookService(bookRepository);
const bookController = new BookController(bookService);

router.get("/", bookController.getAll);
router.get("/search", bookController.search);
router.get("/:id", bookController.getOne);

router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  bookController.create,
);
router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  bookController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  bookController.delete,
);

export default router;
