
import React, { useState } from 'react';
import './Auth.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';

const Eye = ({open}) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="currentColor" strokeWidth="2" />
    {open ? <circle cx="12" cy="12" r="3" fill="currentColor" /> : <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2"/>}
  </svg>
);

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showN, setShowN] = useState(false);
  const [showC, setShowC] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/user/forgot/send-otp`, { email });
      if (res.data.success) { toast.success('OTP sent'); setStep(2); }
      else toast.error(res.data.message || 'Failed to send OTP');
    } catch (err) {
      toast.error('Error sending OTP');
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return toast.error('Passwords do not match');
    try {
      const res = await axios.post(`${url}/api/user/forgot/reset`, { email, code, newPassword });
      if (res.data.success) { toast.success('Password updated'); navigate('/login'); }
      else toast.error(res.data.message || 'Reset failed');
    } catch (err) {
      toast.error('Error resetting password');
    }
  };

  return (
    <div className='auth-page'>
      <h2>Forgot Password</h2>
      {step===1 ? (
        <form onSubmit={sendOtp} className='auth-form'>
          <input type='email' placeholder='Your email' value={email} onChange={e=>setEmail(e.target.value)} required />
          <button type='submit'>Send OTP</button>
          <div className='auth-links'><Link to='/login'>Back to login</Link></div>
        </form>
      ) : (
        <form onSubmit={reset} className='auth-form'>
          <p>Enter OTP sent to <b>{email}</b></p>
          <input placeholder='6-digit OTP' value={code} onChange={e=>setCode(e.target.value)} required />
          <div className='password-field'>
            <input type={showN ? 'text' : 'password'} placeholder='New password' value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
            <button type='button' className='eye' onClick={()=>setShowN(s=>!s)} aria-label='Toggle password'><Eye open={showN}/></button>
          </div>
          <div className='password-field'>
            <input type={showC ? 'text' : 'password'} placeholder='Confirm password' value={confirm} onChange={e=>setConfirm(e.target.value)} required />
            <button type='button' className='eye' onClick={()=>setShowC(s=>!s)} aria-label='Toggle password'><Eye open={showC}/></button>
          </div>
          <button type='submit'>Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
