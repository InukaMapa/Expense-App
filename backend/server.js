import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("It's Working");
});

console.log("my port:",process.env.PORT);

app.listen(5001, () => {    
  console.log("Server is running on port 5001");
});