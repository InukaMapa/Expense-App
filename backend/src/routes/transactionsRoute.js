import express from "express";
import { createTransaction,
        getTransactionsByUserId,
        deleteTransaction,
        getSummaryByUserId
 } from "../controllers/transactionsController.js";



const router = express.Router();

// Get transactions by user
router.get("/:userId", getTransactionsByUserId);

// Add transaction
router.post("/", createTransaction);

// Delete transaction
router.delete("/:id", deleteTransaction);

// Summary route
router.get("/summary/:userId", getSummaryByUserId);


export default router;

