import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await loginUser(email, password);
      if(token) {
         const authRoleMatch = token.match(/-role-([a-zA-Z]+)$/);
         if (authRoleMatch && authRoleMatch[1]) {
             const actualRole = authRoleMatch[1].toLowerCase();
             // Extract actual email from the token, since user might have typed their phone number
             const emailMatch = token.match(/^mock-jwt-token-for-(.+)-role-[a-zA-Z]+$/);
             const actualEmail = emailMatch ? emailMatch[1] : email;
             localStorage.setItem('userEmail', actualEmail);
             toast.success('Successfully logged in!');
             navigate(`/${actualRole}-dashboard`);
         } else {
             toast.error('Invalid token format received.');
         }
      }
    } catch (err) {
      toast.error(err.message || 'Invalid credentials! Please try again or create an account.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--surface)', padding: '20px', position: 'relative' }}>
      {/* Back Button */}
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <Link to="/" className="btn btn-ghost" style={{ background: 'var(--white)' }}>
          ← Back to Home
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '3.5rem 3rem', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2.2rem', color: 'var(--ink)', textAlign: 'center' }} className="serif-text">Welcome Back</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2.5rem' }}>Log in to access your clinical dashboard</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Email Address or Mobile Number</label>
            <input 
              type="text" 
              placeholder="Enter email or mobile number" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingRight: '45px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--ink-muted)', outline: 'none' }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <button type="submit" className="glow-button" style={{ marginTop: '0.8rem', width: '100%' }}>Sign In</button>
        </form>
        <p style={{ marginTop: '2.5rem', fontSize: '14px', color: 'var(--ink-muted)', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--sky)', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>

      {/* Restricted admin backdoor access link */}
      <Link to="/admin" style={{ position: 'absolute', bottom: '15px', right: '15px', color: 'var(--ink-muted)', opacity: 0.15, textDecoration: 'none', fontSize: '0.8rem', cursor: 'pointer', zIndex: 1000 }}>
        Restricted Portal
      </Link>
    </div>
  );
};

export default Login;
