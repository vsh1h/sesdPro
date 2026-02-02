import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user.repository";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../utils/enums";

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.use(authenticate);

router.get("/", authorize(UserRole.ADMIN), userController.getAll);
router.get("/:id", authorize(UserRole.ADMIN), userController.getOne);
router.put("/:id", authorize(UserRole.ADMIN), userController.update);
router.delete("/:id", authorize(UserRole.ADMIN), userController.delete);
router.patch("/:id/role", authorize(UserRole.ADMIN), userController.updateRole);

export default router;
