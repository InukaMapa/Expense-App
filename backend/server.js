import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import apiLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

// Allow Express to correctly detect real IPs behind proxies
app.set("trust proxy", 1);

// Rate limiter (applied only to /api routes)
app.use("/api", apiLimiter);

// Body parser
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Initialize database
async function initDB() {
    try {
        await sql`SELECT 1`;
        console.log("Database connection successful");

        await sql`
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        );`;

        console.log("Database initialized successfully");
    } catch (err) {
        console.error("Error initializing DB:", err);
        process.exit(1);
    }
}

initDB();

// Test route
app.get("/", (req, res) => {
    res.send("It's Working");
});

// Get transactions by user
app.get("/api/transactions/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await sql`
            SELECT * FROM transactions 
            WHERE user_id = ${userId} 
            ORDER BY created_at DESC;
        `;
        res.status(200).json(transactions);
    } catch (error) {
        console.log("Error getting transactions:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Add transaction
app.post("/api/transactions", async (req, res) => {
    try {
        const { title, amount, category, user_id } = req.body;

        if (!title || !user_id || !category || amount === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await sql`
            INSERT INTO transactions (user_id, title, amount, category)
            VALUES (${user_id}, ${title}, ${amount}, ${category})
            RETURNING *;
        `;

        res.status(201).json(result[0]);
    } catch (error) {
        console.log("Error processing request:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Delete transaction
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ message: "Invalid transaction ID" });
        }

        const deleted = await sql`
            DELETE FROM transactions 
            WHERE id = ${id} 
            RETURNING *;
        `;

        if (deleted.length === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.log("Error deleting transaction:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Summary route
app.get("/api/transactions/summary/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const balance = await sql`
            SELECT COALESCE(SUM(amount), 0) AS balance 
            FROM transactions 
            WHERE user_id = ${userId};
        `;

        const income = await sql`
            SELECT COALESCE(SUM(amount), 0) AS income 
            FROM transactions 
            WHERE user_id = ${userId} AND amount > 0;
        `;

        const expenses = await sql`
            SELECT COALESCE(SUM(amount), 0) AS expenses 
            FROM transactions 
            WHERE user_id = ${userId} AND amount < 0;
        `;

        res.status(200).json({
            balance: balance[0].balance,
            income: income[0].income,
            expenses: expenses[0].expenses
        });

    } catch (error) {
        console.log("Error getting summary:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server running on PORT:", PORT);
    });
});
