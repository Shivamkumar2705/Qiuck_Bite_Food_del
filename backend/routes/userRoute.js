import express from 'express';
import {
  loginUser,
  registerSendOtp,
  registerVerify,
  sendForgotOtp,
  resetPassword
} from '../controllers/userController.js';
// During testing you can remove otpLimiter from these two lines if you like
// import { otpLimiter } from '../middleware/rateLimit.js';

const userRouter = express.Router();

// Login (no OTP)
userRouter.post('/login', loginUser);

// Signup with OTP
// userRouter.post('/register/send-otp', otpLimiter, registerSendOtp);
userRouter.post('/register/send-otp', registerSendOtp);
userRouter.post('/register/verify', registerVerify);

// Forgot password with OTP
// userRouter.post('/forgot/send-otp', otpLimiter, sendForgotOtp);
userRouter.post('/forgot/send-otp', sendForgotOtp);
userRouter.post('/forgot/reset', resetPassword);

export default userRouter;
