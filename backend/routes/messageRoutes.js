
import express from "express";

import {
  getMessages,
  sendMessage,
  testSendMessage,
  testGetMessages,
} from "../controllers/messageController.js";

const router = express.Router();

// Get messages
router.get("/:conversationId", getMessages);

// Send message
router.post("/:conversationId", sendMessage);

// Temporary test routes
router.get("/test-send", testSendMessage);
router.get("/test-get", testGetMessages);

export default router;
