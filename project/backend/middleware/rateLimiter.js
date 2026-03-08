import rateLimit from "express-rate-limit";

export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: "Too many AI requests created from this IP, please try again after 15 minutes"
});
