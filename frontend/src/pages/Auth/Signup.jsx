import React, { useContext, useState } from 'react';
import './Auth.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { url } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';

const Eye = ({open}) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="currentColor" strokeWidth="2" />
    {open ? <circle cx="12" cy="12" r="3" fill="currentColor" /> : <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2"/>}
  </svg>
);

const Signup = () => {
  const { setToken } = useContext(StoreContext);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post(`${url}/api/user/register/send-otp`, { name, email, password });
      console.log("res", res.data);
      if(res.data.success){ toast.success('OTP sent'); setStep(2); }
      else toast.error(res.data.message || 'Failed to send OTP');
    }catch{ toast.error('Error'); }
  };

  const verify = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post(`${url}/api/user/register/verify`, { name, email, password, code });
      if(res.data.success){
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        toast.success('Account created');
        navigate('/');
      } else toast.error(res.data.message || 'Invalid OTP');
    }catch{ toast.error('Error'); }
  };

  return (
    <div className='auth-page'>
      <h2>Sign Up</h2>
      {step===1 ? (
        <form onSubmit={sendOtp} className='auth-form'>
          <input placeholder='Name' value={name} onChange={(e)=>setName(e.target.value)} required />
          <input type='email' placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <div className='password-field'>
            <input type={show ? 'text' : 'password'} placeholder='Password (min 8 chars)' value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <button type='button' className='eye' onClick={()=>setShow(s=>!s)} aria-label='Toggle password'>
              <Eye open={show}/>
            </button>
          </div>
          <button type='submit'>Send OTP</button>
          <div className='auth-links'>
            <Link to='/login'>Already have an account? Login</Link>
          </div>
        </form>
      ) : (
        <form onSubmit={verify} className='auth-form'>
          <p>Enter the OTP sent to <b>{email}</b></p>
          <input placeholder='6-digit OTP' value={code} onChange={(e)=>setCode(e.target.value)} required />
          <button type='submit'>Verify & Create Account</button>
          <button type='button' onClick={()=>setStep(1)}>Back</button>
        </form>
      )}
    </div>
  );
};

export default Signup;