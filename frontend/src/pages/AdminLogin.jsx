import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if(email === 'admin@medconnect.com' && password === 'admin123') {
      localStorage.setItem('userEmail', 'admin@medconnect.com');
      navigate('/admin-dashboard');
    } else {
      alert("Invalid Admin Credentials. Access Denied.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--surface)', padding: '20px', position: 'relative' }}>
      {/* Back Button */}
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <Link to="/" className="btn btn-ghost" style={{ background: 'var(--white)' }}>
          ← Back to Network
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '3.5rem 3rem', width: '100%', maxWidth: '420px', border: '1.5px solid var(--border)' }}>
        <div style={{ marginBottom: '1rem', fontSize: '2.5rem', textAlign: 'center' }}>🔒</div>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2.2rem', color: 'var(--ink)', textAlign: 'center' }} className="serif-text">System Administrator</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2.5rem' }}>Access root control & provider credentialing</p>
        
        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Admin Email</label>
            <input 
              type="email" 
              placeholder="admin@medconnect.com" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Passcode</label>
            <input 
              type="password" 
              placeholder="Enter passcode" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          
          <button type="submit" className="glow-button" style={{ marginTop: '0.8rem', width: '100%', background: 'var(--ink)', boxShadow: '0 4px 14px rgba(11,18,32,0.15)' }}>Authorize Override</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
