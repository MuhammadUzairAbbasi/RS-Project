import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import UserRoutes from "./routes/UserRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173" ||
      "http://localhost:5174",
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Endpoints
app.use("/api/user", UserRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
