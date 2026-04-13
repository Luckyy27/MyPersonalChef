const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    // ✅ CLEAN CONNECT (no old options)
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected ✅");

  } catch (error) {
    console.error("Database connection failed ❌", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;