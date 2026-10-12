import express from "express";
import {
  registerUser,
  loginUser,
  testLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/test-login", testLogin);

export default router;