import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoutes";
import movieRoutes from "./routes/movieRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import path from "path";

export const prisma = new PrismaClient();
const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://localhost:3001"], // Add your client URLs here
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["set-cookie"],
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/content", movieRoutes);
app.use("/api/categories", categoryRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Daveflix Server running on port ${PORT}`);
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: "Something went wrong!",
    });
  }
);

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

export default app;
