import express from "express";
import {
  getMe,
  testMe,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.get("/test-me", testMe);

export default router;