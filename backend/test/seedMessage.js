import "dotenv/config";
import connectDB from "../config/db.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const seedMessage = async () => {
  try {
    await connectDB();

    const conversation = await Conversation.findById(
      "6aaad86603da3ebadd85680d"
    );

    if (!conversation) {
      console.log("Conversation not found");
      process.exit(1);
    }

    const message = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: "Hello RahulGPT!",
    });

    console.log("Message created successfully");
    console.log({
      id: message._id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
    });

    process.exit(0);
  } catch (error) {
    console.error("Message seed error:", error.message);
    process.exit(1);
  }
};

seedMessage();