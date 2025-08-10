import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing in .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { });
    console.log("DB Connected");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
}