const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // ✅ Ensure environment variable exists
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    // ✅ Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected ✅");

  } catch (error) {
    console.error("Database connection failed ❌", error.message);

    // 🔥 Stop server if DB fails
    process.exit(1);
  }
};

module.exports = connectDB;