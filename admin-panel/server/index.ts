import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import customersRoutes from "./routes/customers";
import productsRoutes from "./routes/products";
import priceListsRoutes from "./routes/price-lists";
import ordersRoutes from "./routes/orders";
import paymentsRoutes from "./routes/payments";
import discountsRoutes from "./routes/discounts";
import supervisorsRoutes from "./routes/supervisors";
import statsRoutes from "./routes/stats";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:8080', 'http://localhost:5173'],
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Auth routes
  app.use("/api/auth", authRoutes);

  // API routes
  app.use("/api/customers", customersRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/price-lists", priceListsRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/discounts", discountsRoutes);
  app.use("/api/supervisors", supervisorsRoutes);
  app.use("/api/stats", statsRoutes);

  // Example route (can be removed later)
  app.get("/api/demo", handleDemo);

  return app;
}
