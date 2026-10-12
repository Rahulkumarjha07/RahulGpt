
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { generateGeminiResponse } from "../services/geminiService.js";

const DEV_USER_ID = "6aaad6a27a5b43c4ed86267e";

// =========================================
// GET ALL MESSAGES
// =========================================

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Check that the conversation exists
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: DEV_USER_ID,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // Retrieve messages in chronological order
    const messages = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =========================================
// SEND MESSAGE
// =========================================

export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    // Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: DEV_USER_ID,
    });

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const trimmedMessage = message.trim();

    // Save user's message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: trimmedMessage,
    });

    // Set title from the first message
    if (conversation.title === "New Chat") {
      conversation.title = trimmedMessage.slice(0, 40);
    }

    // Generate AI response
    const aiResponse = await generateGeminiResponse(
      trimmedMessage
    );

    // Save assistant's response
    const assistantMessage = await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: aiResponse,
    });

    // Update conversation timestamp and title
    conversation.updatedAt = new Date();
    await conversation.save();

    return res.status(200).json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);

    return res.status(500).json({
      message: "Failed to send message",
    });
  }
};

// =========================================
// TEMPORARY TEST: SEND MESSAGE
// =========================================

export const testSendMessage = async (req, res) => {
  req.params.conversationId = "6aaad86603da3ebadd85680d";

  req.body = {
    message: "What is JavaScript? Explain in one sentence.",
  };

  return sendMessage(req, res);
};

// =========================================
// TEMPORARY TEST: GET MESSAGES
// =========================================

export const testGetMessages = async (req, res) => {
  req.params.conversationId = "6aaad86603da3ebadd85680d";

  return getMessages(req, res);
};
