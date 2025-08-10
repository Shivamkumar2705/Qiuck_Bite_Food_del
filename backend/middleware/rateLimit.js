// backend/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

// IPv6-safe IP extractor (avoids using req.ip so v7 doesn't complain)
function safeIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  const raw = (Array.isArray(xfwd) ? xfwd[0] : (xfwd || '')).split(',')[0].trim()
            || req.socket?.remoteAddress
            || '';
  // strip IPv4-mapped IPv6 prefix like ::ffff:127.0.0.1
  return String(raw).replace(/^::ffff:/, '');
}

export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Prefer per-email limiting if email exists
    if (req.body && req.body.email) {
      return `otp:${String(req.body.email).toLowerCase()}`;
    }
    // Fallback to IPv6-safe address
    return safeIp(req);
  },
  message: { success: false, message: "Too many OTP requests. Try again later." }
});
