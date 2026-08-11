import "dotenv/config";
import express from "express";
import cors from "cors";
import tmdbRoutes from "./routes/tmdb.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api", tmdbRoutes);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ ScreenVault server running on http://localhost:${PORT}`);
});
