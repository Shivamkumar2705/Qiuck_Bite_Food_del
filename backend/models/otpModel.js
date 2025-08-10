import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  email:   { type: String, required: true, index: true },
  code:    { type: String, required: true },
  purpose: { type: String, enum: ['signup', 'forgot'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete in 5 min
});

export default mongoose.models.otp || mongoose.model('otp', OTPSchema);
