import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE } from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', role: 'PATIENT', 
    age: '', specialist: '', licenseNumber: '', certificateData: '', phoneNumber: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
       toast.error("Passwords do not match!");
       return;
    }
    
    try {
      const payload = { ...formData };
      
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        const errMsg = await res.text();
        toast.error(errMsg || 'Registration failed. Email or mobile number might be already in use.');
      }
    } catch (err) {
      toast.error('Error connecting to backend database. Make sure Spring Boot is running!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--surface)', padding: '40px 20px', position: 'relative' }}>
      
      {/* Back to Home Button */}
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <Link to="/" className="btn btn-ghost" style={{ background: 'var(--white)' }}>
          ← Back to Home
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '500px', margin: '40px auto' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2.2rem', textAlign: 'center', color: 'var(--ink)' }} className="serif-text">Create Account</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2rem' }}>Join MediLink's healthcare network</p>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>I want to register as a:</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{ width: '100%' }}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="PHARMACIST">Pharmacist</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Full Name</label>
              <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Age</label>
              <input type="number" placeholder="Age" required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Email Address</label>
            <input type="email" placeholder="user@gmail.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Mobile Number</label>
            <input 
              type="text" 
              placeholder="Enter mobile number" 
              required 
              value={formData.phoneNumber} 
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
              style={{ width: '100%' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Create Password" 
                required 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Confirm Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                required 
                value={formData.confirmPassword} 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                style={{ width: '100%', paddingRight: '45px' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--ink-muted)', outline: 'none' }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Dynamic Doctor Fields */}
          {formData.role === 'DOCTOR' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem', padding: '1.2rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Specialist Area</label>
                <input type="text" placeholder="e.g. Cardiology" required value={formData.specialist} onChange={(e) => setFormData({...formData, specialist: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Medical License Number</label>
                <input type="text" placeholder="License Number" required value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Upload Doctor Certificate (PDF/Image)</label>
                <input type="file" required onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({...formData, certificateData: reader.result});
                    reader.readAsDataURL(file);
                  }
                }} style={{ border: 'none', padding: '0', background: 'transparent' }} />
              </div>
            </div>
          )}

          {/* Dynamic Pharmacist Fields */}
          {formData.role === 'PHARMACIST' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.5rem', padding: '1.2rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Pharmacy License Number</label>
                <input type="text" placeholder="License Number" required value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Upload Pharmacist Certificate</label>
                <input type="file" required onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({...formData, certificateData: reader.result});
                    reader.readAsDataURL(file);
                  }
                }} style={{ border: 'none', padding: '0', background: 'transparent' }} />
              </div>
            </div>
          )}
          
          <button type="submit" className="glow-button" style={{ marginTop: '1rem', width: '100%' }}>Complete Registration</button>
        </form>
        <p style={{ marginTop: '2rem', fontSize: '14px', color: 'var(--ink-muted)', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--sky)', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
