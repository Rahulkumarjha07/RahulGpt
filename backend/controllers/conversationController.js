
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Temporary development user ID
const DEV_USER_ID = "6aaad6a27a5b43c4ed86267e";

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create({
      userId: DEV_USER_ID,
      title: "New Chat",
    });

    res.status(201).json({
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: DEV_USER_ID,
    }).sort({
      isPinned: -1,
      updatedAt: -1,
    });

    res.status(200).json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete a conversation and its messages
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    await Message.deleteMany({
      conversationId: conversation._id,
    });

    await Conversation.deleteOne({
      _id: conversation._id,
    });

    res.status(200).json({
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Pin or unpin a conversation
export const togglePinConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    conversation.isPinned = !conversation.isPinned;
    await conversation.save();

    res.status(200).json({
      message: conversation.isPinned
        ? "Conversation pinned successfully"
        : "Conversation unpinned successfully",
      conversation,
    });
  } catch (error) {
    console.error("Toggle pin conversation error:", error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Temporary test route
export const testGetConversations = async (req, res) => {
  return getConversations(req, res);
};
