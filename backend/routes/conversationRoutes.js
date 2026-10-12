
import express from "express";

import {
  createConversation,
  getConversations,
  deleteConversation,
  togglePinConversation,
  testGetConversations,
} from "../controllers/conversationController.js";

const router = express.Router();

// Create new conversation
router.post("/", createConversation);

// Get all conversations
router.get("/", getConversations);

// Delete conversation
router.delete("/:conversationId", deleteConversation);

// Pin / Unpin conversation
router.patch("/:conversationId/pin", togglePinConversation);

// Temporary test route
router.get("/test-get", testGetConversations);

export default router;