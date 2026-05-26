import React, { useState, useEffect, useRef } from 'react';
import { getAllUsers, approveUser, deleteUser, updateUserProfile } from '../api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [adminName, setAdminName] = useState('System Administrator');

  // Settings Panel State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({
    name: '',
    email: '',
    age: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    specialist: '',
    licenseNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {}
  });

  const showSettingsModalRef = useRef(false);
  useEffect(() => {
    showSettingsModalRef.current = showSettingsModal;
  }, [showSettingsModal]);

  useEffect(() => {
    loadUsers();
    const interval = setInterval(() => {
      if (!showSettingsModalRef.current) {
        loadUsers();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data || []);

    const myEmail = localStorage.getItem('userEmail');
    const me = (data || []).find(u => u.email === myEmail);
    if (me) {
      setAdminId(me.id);
      setAdminName(me.name);
    }
  };

  const handleOpenSettings = async () => {
    try {
      const users = await getAllUsers();
      const myEmail = localStorage.getItem('userEmail');
      const me = (users || []).find(u => u.email === myEmail);
      if (me) {
        setSettingsData({
          name: me.name,
          email: me.email,
          age: me.age || '',
          phoneNumber: me.phoneNumber || '',
          password: '',
          confirmPassword: '',
          specialist: me.specialist || '',
          licenseNumber: me.licenseNumber || ''
        });
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsEditingSettings(false);
        setShowSettingsModal(true);
      }
    } catch (err) {
      toast.error("Failed to load account details.");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isEditingSettings) return;
    if (settingsData.password) {
      if (settingsData.password !== settingsData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
    }
    try {
      const payload = {
        name: settingsData.name,
        email: settingsData.email,
        age: settingsData.age ? parseInt(settingsData.age) : null,
        phoneNumber: settingsData.phoneNumber,
        password: settingsData.password || null,
        specialist: settingsData.specialist || null,
        licenseNumber: settingsData.licenseNumber || null
      };
      const updated = await updateUserProfile(adminId, payload);
      toast.success("Profile updated successfully!");
      localStorage.setItem('userEmail', updated.email);
      loadUsers();
      setShowSettingsModal(false);
      setIsEditingSettings(false);
    } catch (err) {
      toast.error("Failed to update profile details. Verify fields and email uniqueness.");
    }
  };

  const triggerConfirm = (title, message, confirmText, onConfirmAction) => {
    setConfirmModal({
      show: true,
      title,
      message,
      confirmText,
      onConfirm: () => {
        onConfirmAction();
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleApprove = (id) => {
    triggerConfirm(
      "Approve Provider?",
      "Approve this medical professional? They will instantly gain platform access.",
      "Approve",
      async () => {
        try {
          await approveUser(id);
          toast.success("User approved!");
          loadUsers();
        } catch(err) { toast.error("Approval failed."); }
      }
    );
  };

  const handleRemove = (id) => {
    triggerConfirm(
      "Confirm Deletion",
      "Permanently delete this user from the system? This action cannot be undone.",
      "Delete User",
      async () => {
        try {
          await deleteUser(id);
          toast.success("User deleted.");
          loadUsers();
        } catch(err) { toast.error("Failed to delete user."); }
      }
    );
  };

  const handleLogout = () => {
    triggerConfirm(
      "Confirm Logout",
      "Are you sure you want to end your administrative override session?",
      "Logout",
      () => {
        localStorage.removeItem('userEmail');
        window.location.href = '/';
      }
    );
  };

  const handleViewCert = (data) => {
    if (data && data.startsWith('data:')) {
      const win = window.open();
      win.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    } else {
      const certUrl = (data && data.includes('http')) ? data : 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=1000';
      window.open(certUrl, '_blank', 'width=800,height=900');
    }
  };

  const pendingProviders = users.filter(u => !u.isApproved && (u.role === 'DOCTOR' || u.role === 'PHARMACIST'));
  const verifiedProviders = users.filter(u => u.isApproved && (u.role === 'DOCTOR' || u.role === 'PHARMACIST'));
  const patients = users.filter(u => u.role === 'PATIENT');

  const ProviderTable = ({ title, dataset, isPending = false }) => (
    <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--white)' }}>
      <h3 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: isPending ? 'var(--coral)' : 'var(--mint)' }}>{title} ({dataset.length})</h3>
      <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflowX: 'auto', background: 'var(--white)' }}>
        {dataset.length === 0 ? (
           <p style={{ color: 'var(--ink-muted)', padding: '2rem', textAlign: 'center' }}>No providers in this category.</p>
        ) : (
           <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                 <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>Provider Name / Role</th>
                 <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>Credentials</th>
                 <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>Status</th>
                 <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Actions</th>
               </tr>
             </thead>
             <tbody>
               {dataset.map(u => (
                 <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '18px 20px' }}>
                       <div style={{ color: 'var(--ink)', fontWeight: '600', fontSize: '15px' }}>{u.name} <span style={{ color: 'var(--ink-muted)', fontWeight: '400', fontSize: '12px' }}>#{u.id}</span> <span style={{ color: 'var(--coral)', fontSize: '13px', marginLeft: '6px' }}>★ {u.rating?.toFixed(1) || '5.0'}</span></div>
                       <div style={{ color: 'var(--violet)', fontSize: '13px', marginTop: '4px', fontWeight: '600' }}>{u.role}</div>
                    </td>
                   <td style={{ padding: '18px 20px', color: 'var(--ink-soft)', fontSize: '14px' }}>
                      <div>Lic: {u.licenseNumber || 'None Provided'}</div>
                      {u.specialist && <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>Specialty: {u.specialist}</div>}
                      <button onClick={() => handleViewCert(u.certificateData || u.certificatePath)} style={{ background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--ink-soft)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', marginTop: '6px', cursor: 'pointer', fontWeight: '500' }}>View Credentials</button>
                   </td>
                   <td style={{ padding: '18px 20px' }}>
                      {u.isApproved ? (
                         <span style={{ color: 'var(--mint)', background: 'var(--mint-pale)', padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600' }}>Verified</span>
                      ) : (
                         <span style={{ color: 'var(--coral)', background: '#ffedd5', padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600' }}>Pending Review</span>
                      )}
                   </td>
                   <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!u.isApproved && (
                          <button onClick={() => handleApprove(u.id)} className="glow-button" style={{ background: 'var(--mint)', boxShadow: '0 4px 12px rgba(16,185,129,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Approve</button>
                        )}
                        <button onClick={() => handleRemove(u.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1.5px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Remove</button>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', width: '100%', padding: '40px 20px', position: 'relative' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '1rem', paddingBottom: '4rem' }}>
        
        {/* Responsive Header Wrapper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '2.5rem' }}>
          <div>
            <h1 className="serif-text" style={{ fontSize: '3rem', color: 'var(--ink)', marginBottom: '0.5rem', marginTop: 0 }}>Welcome, System Administrator!</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.1rem', margin: 0 }}>
              Admin Portal • Oversee clinicians, manage accounts, and verify medical licenses.
            </p>
          </div>
          {/* Header Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button onClick={handleOpenSettings} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               ⚙️ Settings
            </button>
            <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--coral)', display: 'flex', alignItems: 'center', gap: '8px' }}>
               Logout
            </button>
          </div>
        </div>

        {/* Live dynamic metrics bar */}
        <div className="stats-grid">
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Patients</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{patients.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--mint)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Doctors</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{verifiedProviders.filter(u => u.role === 'DOCTOR').length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--violet)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Pharmacists</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{verifiedProviders.filter(u => u.role === 'PHARMACIST').length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--coral)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Approvals</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{pendingProviders.length}</div>
          </div>
        </div>
        
        <ProviderTable title="Pending Approval Queue" dataset={pendingProviders} isPending={true} />
        <ProviderTable title="Verified Medical Providers" dataset={verifiedProviders} isPending={false} />

        <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)' }}>
          <h3 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--ink)' }}>Registered Patients ({patients.length})</h3>
          <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflowX: 'auto', background: 'var(--white)' }}>
            {patients.length === 0 ? (
               <p style={{ color: 'var(--ink-muted)', padding: '2rem', textAlign: 'center' }}>No patients currently registered.</p>
            ) : (
               <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                 <thead>
                   <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                     <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>Patient Name</th>
                     <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>Email</th>
                     <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>Age</th>
                     <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                    {patients.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '18px 20px', color: 'var(--ink)', fontWeight: '600', fontSize: '15px' }}>{u.name} <span style={{ color: 'var(--ink-muted)', fontWeight: '400', fontSize: '12px' }}>#{u.id}</span> <span style={{ color: 'var(--coral)', fontSize: '13px', marginLeft: '6px' }}>★ {u.rating?.toFixed(1) || '5.0'}</span></td>
                       <td style={{ padding: '18px 20px', color: 'var(--ink-soft)', fontSize: '14px' }}>{u.email}</td>
                       <td style={{ padding: '18px 20px', color: 'var(--ink)', fontSize: '14px' }}>{u.age || 'N/A'} years old</td>
                       <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                          <button onClick={() => handleRemove(u.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1.5px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Remove</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            )}
          </div>
        </div>

      </div>

      {/* Reusable Confirmation Modal */}
      {confirmModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="glass-card" style={{ padding: '2.5rem', width: '90%', maxWidth: '420px', textAlign: 'center', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--coral)' }}>⚠️</div>
            <h3 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '0.8rem', color: 'var(--ink)' }}>{confirmModal.title}</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="glow-button" style={{ flex: 1, background: 'var(--coral)', boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }} onClick={confirmModal.onConfirm}>{confirmModal.confirmText}</button>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>Account Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            
            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Full Name</label>
                <input type="text" required disabled={!isEditingSettings} value={settingsData.name} onChange={e => setSettingsData({...settingsData, name: e.target.value})} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Email Address</label>
                <input type="email" required disabled={!isEditingSettings} value={settingsData.email} onChange={e => setSettingsData({...settingsData, email: e.target.value})} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Age (Years)</label>
                <input type="number" required disabled={!isEditingSettings} value={settingsData.age} onChange={e => setSettingsData({...settingsData, age: e.target.value})} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Phone Number</label>
                <input type="text" disabled={!isEditingSettings} value={settingsData.phoneNumber} onChange={e => setSettingsData({...settingsData, phoneNumber: e.target.value})} style={{ width: '100%' }} placeholder="Enter phone number" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Password {isEditingSettings && '(Leave blank to keep unchanged)'}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    disabled={!isEditingSettings} 
                    value={settingsData.password} 
                    onChange={e => setSettingsData({...settingsData, password: e.target.value})} 
                    placeholder={isEditingSettings ? "Enter new password" : "••••••••"} 
                    style={{ width: '100%', paddingRight: '45px' }} 
                  />
                  {isEditingSettings && (
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--ink-muted)', outline: 'none' }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Confirm Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    disabled={!isEditingSettings} 
                    value={settingsData.confirmPassword || ''} 
                    onChange={e => setSettingsData({...settingsData, confirmPassword: e.target.value})} 
                    placeholder={isEditingSettings ? "Confirm new password" : "••••••••"} 
                    style={{ width: '100%', paddingRight: '45px' }} 
                  />
                  {isEditingSettings && (
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--ink-muted)', outline: 'none' }}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                {!isEditingSettings ? (
                  <>
                    <button type="button" onClick={() => setIsEditingSettings(true)} className="glow-button" style={{ flex: 1 }}>Edit details</button>
                    <button type="button" onClick={() => setShowSettingsModal(false)} className="btn-ghost" style={{ flex: 1 }}>Close</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={handleSaveSettings} className="glow-button" style={{ flex: 1, background: 'var(--mint)', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}>Save Changes</button>
                    <button type="button" onClick={() => { setIsEditingSettings(false); }} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
