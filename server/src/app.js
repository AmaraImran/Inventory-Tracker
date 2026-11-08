import express from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/Product.js";
import saleRoutes from "./routes/sales.js";
import statsRoutes from "./routes/stats.js";
const app = express();
app.use((req, _res, next) => {
  const u = new URL(req.url, "http://x");
  const p = u.searchParams.get("p");
  if (p !== null) {
    u.searchParams.delete("p");
    req.url = "/" + p + u.search; // restore the real path and keep other query params
  }
  next();
});
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/stats", statsRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

export default app;