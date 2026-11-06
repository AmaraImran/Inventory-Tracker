import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./lib/db.js";

try {
  await connectDB();
  app.listen(5000, () => console.log("API on http://localhost:5000"));
} catch (error) {
  console.error("Unable to start API because MongoDB connection failed:", error);
  process.exitCode = 1;
}