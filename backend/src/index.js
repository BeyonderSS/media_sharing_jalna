import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import { connectDB } from "./config/database.js";
import appLogger from "./utils/appLogger.js";
import { asciiLogger } from "./utils/asciiLogger.js";
import apiRoutes from "./routes/index.js";

const startServer = async () => {
  // Load environment variables from .env file
  dotenv.config();


  // Display the ASCII banner
  await asciiLogger();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // --- Middlewares ---
  app.use(cors());
  // Increase body size limits for large file uploads (2GB)
  app.use(express.json({ limit: '2gb' }));
  app.use(express.urlencoded({ limit: '2gb', extended: true }));

  // --- API Documentation ---
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // --- API Routes ---
  app.use("/api", apiRoutes);

  // --- Root Endpoint ---
  app.get("/", (req, res) => {
    res.json({ message: `Welcome to the media_sharing_jalna API! ✨` });
  });

  // --- Global Error Handler ---
  app.use((err, req, res, next) => {
    appLogger.error('Unhandled Error', 'SERVER', err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      },
    });
  });

  // --- Connect DB and Start Server ---
  try {
    await connectDB();
    app.listen(PORT, () => {
      appLogger.info(`Server listening on http://localhost:${PORT}`, 'SERVER');
      appLogger.info(`API documentation available at http://localhost:${PORT}/api-docs`, 'SERVER');
    });
  } catch (err) {
    appLogger.error("Failed to start server", 'SERVER', err);
    process.exit(1);
  }
};

startServer();