import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import testUser from "./testData.js";

const seedUser = async () => {
  try {
    await connectDB();

    const existingUser = await User.findOne({
      email: testUser.email,
    });

    if (existingUser) {
      console.log("Test user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      testUser.password,
      10
    );

    const user = await User.create({
      name: testUser.name,
      email: testUser.email,
      password: hashedPassword,
    });

    console.log("Test user created successfully");
    console.log({
      id: user._id,
      name: user.name,
      email: user.email,
    });

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedUser();