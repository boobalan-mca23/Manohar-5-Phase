import React, { useState } from 'react';
import {REACT_APP_BACKEND_SERVER_URL} from '../../config/index'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import CircularProgress from '@mui/material/CircularProgress';
import './Login.css';
 
export default function JewelryLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
     try {
      const res = await fetch(`${REACT_APP_BACKEND_SERVER_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName : username, password  }),
      });
 
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        setLoading(false);
        return;
      }
 
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.userInfo));
      localStorage.setItem("username", username);  
      localStorage.setItem("userRole", data.userInfo.role);
      // localStorage.setItem("userAccess", JSON.stringify(data.user.access[0]));
 
      const role = data.userInfo.role?.toLowerCase();
      toast.success("Login successful");
 
      if (role === "admin" || role === "superadmin") navigate("/admin");
      else navigate("/home");
    } catch (err) {
      toast.error("Server error");
    }
  };
 
    // console.log('Login attempt:', { username, password });
    // toas(`Welcome back, ${username}!`);
  // };
 
  return (
    <div className="login-container">
      <div className="background-overlay"></div>
      
      <div className="login-card">
        <div className="logo-section">
          <div className="diamond-icon">💎</div>
          <h1 className="brand-name">MANOHAR JEWELS</h1>
          <p className="tagline">Timeless Elegance</p>
        </div>
 
        <div className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon"><FaUser /></span>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
 
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><RiLockPasswordFill /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
 
          {/* <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div> */}
 
          <button type="button" className="login-button" onClick={handleSubmit} disabled={loading}>
            {loading ?
 
            // Login Loader...
          <>
             <div className='loader'>
                <span>Signing In...</span>
                <CircularProgress size="1.5rem" color='white'/>
             </div>
          </>
           :
            <span>Sign in</span>}
            <span className="button-shine"></span>
          </button>
        </div>
 
        {/* <div className="signup-section">
          <p>Don't have an account? <a href="#" className="signup-link">Create Account</a></p>
        </div> */}
 
        <div className="decorative-elements">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">✨</div>
          {/* <div className="sparkle sparkle-3">✨</div> */}
        </div>
      </div>
    </div>
  );
}
