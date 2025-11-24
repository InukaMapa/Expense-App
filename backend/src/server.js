import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import apiLimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Rate limiter
app.use("/api", apiLimiter);

app.use(express.json());

const PORT = process.env.PORT || 5001;

// Initialize database


// Test route
app.get("/", (req, res) => {
    res.send("It's Working");
});

// Load all transaction routes
app.use("/api/transactions", transactionsRoute);



initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server running on PORT:", PORT);
    });
});
