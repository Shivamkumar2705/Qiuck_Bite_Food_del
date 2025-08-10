import React, { useContext, useState } from 'react';
import './Auth.css';
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { url } from '../../assets/assets';

const Eye = ({open}) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="currentColor" strokeWidth="2" />
    {open ? <circle cx="12" cy="12" r="3" fill="currentColor" /> : <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2"/>}
  </svg>
);

const Login = () => {
  const { setToken } = useContext(StoreContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/user/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        toast.success('Logged in');
        navigate('/');
      } else {
        toast.error(res.data.message || 'Login failed');
      }
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div className='auth-page'>
      <h2>Login</h2>
      <form onSubmit={submit} className='auth-form'>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <div className='password-field'>
          <input
            type={show ? 'text' : 'password'}
            placeholder='Password'
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />
          <button
            type='button'
            className='eye'
            onClick={()=>setShow(s=>!s)}
            aria-label='Toggle password'
          >
            <Eye open={show}/>
          </button>
        </div>
        <button type='submit'>Login</button>
        <div className='auth-links'>
          <Link to='/forgot'>Forgot password?</Link>
          <Link to='/signup'>Create account</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
