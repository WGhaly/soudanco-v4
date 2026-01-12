import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routes
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";
import ordersRouter from "./routes/orders";
import profileRouter from "./routes/profile";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "pong", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/profile", profileRouter);

  return app;
}
