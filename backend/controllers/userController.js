import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import { mailSender } from "../utils/mailSender.js";

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// LOGIN (no OTP)
export const loginUser = async (req,res) => {
  const {email, password} = req.body;
  try{
    const user = await userModel.findOne({email});
    if(!user) return res.json({success:false,message:"User not found"});
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.json({success:false,message:"Invalid credentials"});
    const token = createToken(user._id);
    res.json({success:true,token});
  } catch(err){
    console.error(err);
    res.json({success:false,message:"Error"});
  }
};

// === SIGNUP: send OTP (step 1)
export const registerSendOtp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) return res.json({ success: false, message: "Missing details" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password should be at least 8 characters" });

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // try to send first, then save OTP only if mail succeeds
    try {
      await mailSender(
        email,
        "Quick Bite Signup OTP",
        `<p>Your signup OTP is <b>${code}</b>. It expires in 5 minutes.</p>`
      );
      console.log('[MAILER] signup OTP sent to', email);
    } catch (mailErr) {
      console.error('[MAILER] signup send error:', mailErr?.response || mailErr?.message || mailErr);
      return res.json({ success: false, message: "Mailer error: " + (mailErr?.response || mailErr?.message || 'unknown') });
    }

    await otpModel.create({ email, code, purpose: 'signup' });
    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Could not send OTP" });
  }
};

// SIGNUP with OTP: step 2 (verify & create)
export const registerVerify = async (req,res) => {
  const { name, email, password, code } = req.body;
  try{
    if(!name || !email || !password || !code) return res.json({success:false,message:"Missing details"});
    const otp = await otpModel.findOne({ email, code, purpose: 'signup' });
    if(!otp) return res.json({success:false,message:"Invalid or expired OTP"});

    let exists = await userModel.findOne({ email });
    if(exists) return res.json({success:false,message:"User already exists"});

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await userModel.create({ name, email, password: hashed });

    await otpModel.deleteMany({ email, purpose: 'signup' });
    const token = createToken(user._id);
    res.json({success:true,token});
  } catch(err){
    console.error(err);
    res.json({success:false,message:"Signup failed"});
  }
};

// FORGOT PASSWORD: send OTP
export const sendForgotOtp = async (req,res) => {
  const { email } = req.body;
  try{
    const user = await userModel.findOne({ email });
    if(!user) return res.json({success:false,message:"User not found"});
    const code = Math.floor(100000 + Math.random()*900000).toString();
    await otpModel.create({ email, code, purpose: 'forgot' });
    await mailSender(email, "Quick Bite Password Reset OTP", `<p>Your reset OTP is <b>${code}</b>. It expires in 5 minutes.</p>`);
    res.json({success:true,message:"OTP sent to email"});
  } catch(err){
    console.error(err);
    res.json({success:false,message:"Could not send OTP"});
  }
};

// FORGOT PASSWORD: reset
export const resetPassword = async (req,res) => {
  const { email, code, newPassword } = req.body;
  try{
    if(!newPassword || newPassword.length < 8) return res.json({success:false,message:"Weak password"});
    const entry = await otpModel.findOne({ email, code, purpose: 'forgot' });
    if(!entry) return res.json({success:false,message:"Invalid or expired OTP"});
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await userModel.updateOne({ email }, { $set: { password: hashed } });
    await otpModel.deleteMany({ email, purpose: 'forgot' });
    res.json({success:true,message:"Password updated"});
  } catch(err){
    console.error(err);
    res.json({success:false,message:"Reset failed"});
  }
};
