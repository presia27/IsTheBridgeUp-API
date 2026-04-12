import rateLimit from 'express-rate-limit';

// Rate Limiting
export const limiter = rateLimit({
  limit: 3,                         // Max number of requests...
  windowMs: 500,                    // ...per windowMS (time in milliseconds)
  message: 'Rate limit exceeded.'   // Message sent when the limit is reached
});
