import React, { useState, useEffect, useRef } from 'react';
import { getDoctorConsultations, issuePrescription, addMedicalRecord, getAllUsers, cancelAppointment, updateUserProfile } from '../api';
import toast from 'react-hot-toast';
import VideoConsultation from '../components/VideoConsultation';
import { Video, Calendar, XCircle, LogOut, FilePlus, Zap } from 'lucide-react';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [inCall, setInCall] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  const [activePatientId, setActivePatientId] = useState(null);
  
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  
  const [rxData, setRxData] = useState({ appointmentId: '', medicationDetails: '', instructions: '' });
  const [recordData, setRecordData] = useState({ patientId: '', diagnosis: '', treatmentPlan: '' });

  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [specialist, setSpecialist] = useState('');
  const [rating, setRating] = useState(5.0);
  const [patients, setPatients] = useState([]);

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
    loadAppointments();
    const interval = setInterval(() => {
      if (!showSettingsModalRef.current) {
        loadAppointments();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAppointments = async () => {
    const users = await getAllUsers();
    const myEmail = localStorage.getItem('userEmail');
    const me = (users || []).find(u => u.email === myEmail);
    const myId = me ? me.id : null;

    if (me) {
      setDoctorName(me.name);
      setDoctorId(myId);
      setSpecialist(me.specialist || 'General Medicine');
      setRating(me.rating || 5.0);
    }
    
    if (!myId) return;

    const data = await getDoctorConsultations(myId);
    setAppointments(data || []);
    setPatients((users || []).filter(u => u.role === 'PATIENT'));
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
      const updated = await updateUserProfile(doctorId, payload);
      toast.success("Profile updated successfully!");
      localStorage.setItem('userEmail', updated.email);
      loadAppointments();
      setShowSettingsModal(false);
      setIsEditingSettings(false);
    } catch (err) {
      toast.error("Failed to update profile details. Verify fields and email uniqueness.");
    }
  };

  const startCall = (apptId, patientId) => {
    setActivePatient(apptId);
    setActivePatientId(patientId);
    setInCall(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      await issuePrescription({
        appointment: { id: rxData.appointmentId },
        medicationDetails: rxData.medicationDetails,
        instructions: rxData.instructions,
        issuedAt: new Date().toISOString()
      });
      toast.success('Prescription sent to Pharmacy successfully!');
      setShowPrescriptionModal(false);
      setRxData({ appointmentId: '', medicationDetails: '', instructions: '' });
    } catch (err) { toast.error('Failed to issue prescription.'); }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedicalRecord({
        doctor: { id: doctorId },
        patient: { id: recordData.patientId },
        diagnosis: recordData.diagnosis,
        treatmentPlan: recordData.treatmentPlan,
        recordDate: new Date().toISOString()
      });
      toast.success('Medical Record Updated!');
      setShowRecordModal(false);
      setRecordData({ patientId: '', diagnosis: '', treatmentPlan: '' });
    } catch (err) { toast.error('Failed to add medical record.'); }
  };

  const handleCancel = (id) => {
    triggerConfirm(
      "Cancel Consultation?",
      "Are you sure you want to cancel this appointment permanently? This will notify the patient.",
      "Cancel Appointment",
      async () => {
        try {
          const ok = await cancelAppointment(id);
          if(ok) {
             toast.success("Appointment Canceled!");
             loadAppointments();
          } else {
             toast.error("Error canceling appointment.");
          }
        } catch (err) { toast.error("Failed to execute cancel action."); }
      }
    );
  };

  const handleLogout = () => {
    triggerConfirm(
      "Confirm Logout",
      "Are you sure you want to log out of your provider session?",
      "Logout",
      () => {
        localStorage.removeItem('userEmail');
        window.location.href = '/';
      }
    );
  };

  if (inCall) {
    return <VideoConsultation appointmentId={activePatient} patientId={activePatientId} doctorId={doctorId} isDoctor={true} onClose={() => { setInCall(false); loadAppointments(); }} />;
  }

  // Calculate live statistics
  const pendingConsultationsCount = appointments.filter(a => a.status !== 'COMPLETED').length;
  const completedConsultationsCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const uniquePatientsCount = new Set(appointments.map(a => a.patient?.id)).size;

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', width: '100%', padding: '40px 20px', position: 'relative' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '1rem' }}>
        {/* Mockup Style Doctor Profile Header Card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '32px', boxShadow: 'var(--card-shadow)', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sky), var(--violet))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                  DR
                </div>
                <div>
                   <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', margin: 0 }}>Dr. {doctorName || 'Specialist'}</h2>
                   <p style={{ color: 'var(--ink-soft)', fontSize: '14px', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <span>{specialist}</span>
                     <span style={{ color: 'var(--ink-muted)' }}>•</span>
                     <span style={{ color: 'var(--sky)' }}>★ {rating.toFixed(1)}</span>
                     <span style={{ color: 'var(--ink-muted)' }}>•</span>
                     <span style={{ color: 'var(--mint)', fontWeight: '600' }}>● Online</span>
                   </p>
                </div>
            </div>
            {/* Settings & Logout Buttons inside the card flex layout */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleOpenSettings} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 ⚙️ Settings
              </button>
              <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--coral)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <LogOut size={16} /> Logout
              </button>
            </div>
        </div>

        {/* Live dynamic metrics bar */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Consultations</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{appointments.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--coral)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Sessions</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{pendingConsultationsCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--mint)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unique Patients Logged</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{uniquePatientsCount}</div>
          </div>
        </div>
        
        {/* Responsive Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Scheduled Consultations - Left Column (Styled like mockup Today's Consultations) */}
          <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: '700', color: 'var(--ink-muted)', letterSpacing: '0.7px', margin: 0 }}>
                Today's Consultations
              </h3>
              <span style={{ background: 'var(--sky-pale)', color: 'var(--sky-dark)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                HD Video Call
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.filter(a => a.status !== 'COMPLETED').length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>No live appointments pending.</p>
              ) : appointments.filter(a => a.status !== 'COMPLETED').map((appt) => (
                  <div key={appt.id} style={{ background: 'var(--surface)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <div style={{ fontSize: '24px' }}>🎥</div>
                       <div>
                         <h4 style={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: '600', margin: 0 }}>{appt.patient?.name || 'Unknown Patient'}</h4>
                         <p style={{ color: 'var(--ink-soft)', fontSize: '13px', marginTop: '4px' }}>
                           {new Date(appt.appointmentDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} — Video Consultation
                         </p>
                       </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <button className="glow-button pulse-button" onClick={() => startCall(appt.id, appt.patient?.id)} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                         Live now
                       </button>
                       <button onClick={() => handleCancel(appt.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Cancel Appointment">
                         <XCircle size={18} />
                       </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions Panel - Right Column */}
          <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)', height: 'fit-content' }}>
            <h3 className="serif-text" style={{ marginBottom: '1.5rem', color: 'var(--coral)', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={24} /> Clinical Actions
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>Write digital e-prescriptions or add notes directly to your patient records.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <li>
                <button onClick={() => setShowPrescriptionModal(true)} className="btn-ghost" style={{ width: '100%', background: 'transparent', border: '1.5px solid var(--sky)', color: 'var(--sky)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: 'auto', padding: '10px 16px' }}>
                  <FilePlus size={18} /> Write E-Prescription
                </button>
              </li>
              <li>
                <button onClick={() => setShowRecordModal(true)} className="btn-ghost" style={{ width: '100%', background: 'transparent', border: '1.5px solid var(--coral)', color: 'var(--coral)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: 'auto', padding: '10px 16px' }}>
                  <FilePlus size={18} /> Update Medical Record
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '500px', background: 'var(--white)' }}>
            <h2 className="serif-text" style={{ marginBottom: '1.5rem', fontSize: '2.2rem', color: 'var(--ink)' }}>Issue E-Prescription</h2>
            <form onSubmit={handlePrescriptionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Select Patient / Appointment</label>
                <select required value={rxData.appointmentId} onChange={e => setRxData({...rxData, appointmentId: e.target.value})} style={{ width: '100%' }}>
                   <option value="" disabled>Select Appointment ID</option>
                   {appointments.map(a => <option key={a.id} value={a.id}>Appt #{a.id} - {a.patient?.name || 'Unknown'}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Medication Details</label>
                <textarea placeholder="e.g. Amoxicillin 500mg, twice daily" required value={rxData.medicationDetails} onChange={e => setRxData({...rxData, medicationDetails: e.target.value})} rows="3" style={{ width: '100%', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Fulfillment Instructions</label>
                <textarea placeholder="e.g. Dispense 14-day supply, check for allergy logs" required value={rxData.instructions} onChange={e => setRxData({...rxData, instructions: e.target.value})} rows="2" style={{ width: '100%', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1 }}>Send to Pharmacy</button>
                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical Record Modal */}
      {showRecordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '500px', background: 'var(--white)' }}>
            <h2 className="serif-text" style={{ marginBottom: '1.5rem', fontSize: '2.2rem', color: 'var(--ink)' }}>Update Medical Record</h2>
            <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Select Patient Name</label>
                <select required value={recordData.patientId} onChange={e => setRecordData({...recordData, patientId: e.target.value})} style={{ width: '100%' }}>
                  <option value="" disabled>Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} (Patient ID: {p.id})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Diagnosis SOAP / Summary</label>
                <textarea placeholder="Write clinical diagnosis summary..." required value={recordData.diagnosis} onChange={e => setRecordData({...recordData, diagnosis: e.target.value})} rows="3" style={{ width: '100%', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Treatment & Specialist Referrals</label>
                <textarea placeholder="Outline prescription refills, specialist references, or follow ups..." required value={recordData.treatmentPlan} onChange={e => setRecordData({...recordData, treatmentPlan: e.target.value})} rows="3" style={{ width: '100%', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1, background: 'var(--coral)', boxShadow: '0 4px 14px rgba(249,115,22,0.25)' }}>Save Clinical Log</button>
                <button type="button" onClick={() => setShowRecordModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Clinical License Number</label>
                <input type="text" required disabled value={settingsData.licenseNumber} style={{ width: '100%', background: 'var(--surface)', cursor: 'not-allowed' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Medical Specialty</label>
                <input type="text" required disabled value={settingsData.specialist} style={{ width: '100%', background: 'var(--surface)', cursor: 'not-allowed' }} />
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

export default DoctorDashboard;
