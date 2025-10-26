import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

async function initDB() {
    try {
        // Test database connection
        await sql`SELECT 1`;
        console.log("Database connection successful");
        
        // Create transactions table
        await sql`CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;
        console.log("Database initialized successfully");
    } catch (err) {
        console.error("Error initializing DB:", err);
        console.error("Please check your DATABASE_URL in .env file");
        process.exit(1);
    }
}

initDB();

app.get("/", (req, res) => {
  res.send("It's Working");
});

initDB().then (() => {    
    app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
});
});