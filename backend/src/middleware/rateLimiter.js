import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // set limit (change as needed)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, try again later." }
});

export default apiLimiter;
