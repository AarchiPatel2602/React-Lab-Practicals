const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const logger = require("./middleware/logger");
const validateJson = require("./middleware/validateJson");
const errorHandler = require("./middleware/errorHandler");

const taskRoutes = require("./routes/tasks");
const authRoutes = require("./routes/auth");

const app = express();

// Connect MongoDB
connectDB();

// CORS
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware
app.use(express.json());

app.use(logger);

app.use(validateJson);

// Routes
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route Not Found"
    });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});