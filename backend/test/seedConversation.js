import "dotenv/config";
import connectDB from "../config/db.js";
import Conversation from "../models/Conversation.js";

const seedConversation = async () => {
  try {
    await connectDB();

    const conversation = await Conversation.create({
      userId: "6aaad6a27a5b43c4ed86267e",
      title: "My First Chat",
    });

    console.log("Conversation created successfully");
    console.log({
      id: conversation._id,
      userId: conversation.userId,
      title: conversation.title,
    });

    process.exit(0);
  } catch (error) {
    console.error("Conversation seed error:", error.message);
    process.exit(1);
  }
};

seedConversation();