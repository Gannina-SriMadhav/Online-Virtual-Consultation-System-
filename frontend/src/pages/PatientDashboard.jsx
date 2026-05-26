import React, { useState, useEffect, useRef } from 'react';
import { getPatientAppointments, getPatientRecords, createAppointment, getAllUsers, getAllPrescriptions, cancelAppointment, updateUserProfile, getDoctorConsultations } from '../api';
import toast from 'react-hot-toast';
import VideoConsultation from '../components/VideoConsultation';
import { Video, XCircle, Calendar, FileText, Pill, LogOut } from 'lucide-react';

const TIME_SLOTS = [
  { label: '08:00 AM (Emergency Case)', time: '08:00' },
  { label: '10:00 AM', time: '10:00' },
  { label: '10:30 AM', time: '10:30' },
  { label: '11:00 AM', time: '11:00' },
  { label: '11:30 AM', time: '11:30' },
  { label: '12:00 PM', time: '12:00' },
  { label: '12:30 PM', time: '12:30' },
  { label: '02:00 PM', time: '14:00' },
  { label: '02:30 PM', time: '14:30' },
  { label: '03:00 PM', time: '15:00' },
  { label: '03:30 PM', time: '15:30' },
  { label: '04:00 PM', time: '16:00' },
  { label: '04:30 PM', time: '16:30' },
  { label: '05:00 PM', time: '17:00' },
  { label: '05:30 PM', time: '17:30' },
  { label: '06:00 PM', time: '18:00' }
];

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [scripts, setScripts] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  
  const [bookData, setBookData] = useState({ doctorId: '', date: '' });
  const [bookDate, setBookDate] = useState('');
  const [bookSlot, setBookSlot] = useState('');
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [patientAge, setPatientAge] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  
  const [inCall, setInCall] = useState(false);
  const [activeAppt, setActiveAppt] = useState(null);

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
    loadData();
    const interval = setInterval(() => {
      if (!showSettingsModalRef.current) {
        loadData();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      const updated = await updateUserProfile(patientId, payload);
      toast.success("Profile updated successfully!");
      localStorage.setItem('userEmail', updated.email);
      loadData();
      setShowSettingsModal(false);
      setIsEditingSettings(false);
    } catch (err) {
      toast.error("Failed to update profile details. Verify fields and email uniqueness.");
    }
  };

  const loadData = async () => {
    const users = await getAllUsers();
    const myEmail = localStorage.getItem('userEmail');
    const me = (users || []).find(u => u.email === myEmail);
    const myId = me ? me.id : null;
    
    if(me) {
       setPatientName(me.name);
       setPatientId(myId);
       setPatientAge(me.age || 'N/A');
       setPatientEmail(me.email);
       setPatientPhone(me.phoneNumber || 'N/A');
    }

    if (!myId) return;

    const appts = await getPatientAppointments(myId);
    const recs = await getPatientRecords(myId);
    const allScripts = await getAllPrescriptions();

    setAppointments(appts || []);
    setRecords(recs || []);
    setScripts((allScripts || []).filter(s => s.appointment?.patient?.id === myId));
    setDoctors((users || []).filter(u => u.role === 'DOCTOR'));
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

  const loadDoctorAppointments = async (docId) => {
    if (!docId) {
      setDoctorAppointments([]);
      return;
    }
    try {
      const appts = await getDoctorConsultations(docId);
      setDoctorAppointments(appts || []);
    } catch (err) {
      console.error("Failed to load doctor appointments", err);
      setDoctorAppointments([]);
    }
  };

  useEffect(() => {
    if (bookData.doctorId) {
      loadDoctorAppointments(bookData.doctorId);
    } else {
      setDoctorAppointments([]);
    }
  }, [bookData.doctorId]);

  const isSlotBooked = (slotTime) => {
    if (!bookDate || !doctorAppointments.length) return false;
    return doctorAppointments.some(appt => {
      if (appt.status === 'CANCELLED') return false;
      const apptDateObj = new Date(appt.appointmentDate);
      const yyyy = apptDateObj.getFullYear();
      const mm = String(apptDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(apptDateObj.getDate()).padStart(2, '0');
      const apptLocalDateStr = `${yyyy}-${mm}-${dd}`;
      
      const hours = String(apptDateObj.getHours()).padStart(2, '0');
      const minutes = String(apptDateObj.getMinutes()).padStart(2, '0');
      const apptLocalTimeStr = `${hours}:${minutes}`;
      
      return apptLocalDateStr === bookDate && apptLocalTimeStr === slotTime;
    });
  };

  const handleOpenBookingModal = () => {
    setBookData({ doctorId: '', date: '' });
    setBookDate('');
    setBookSlot('');
    setDoctorAppointments([]);
    setShowModal(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookDate || !bookSlot) {
      toast.error("Please select both a date and a time slot.");
      return;
    }
    try {
      const localDateTimeStr = `${bookDate}T${bookSlot}`;
      const localDate = new Date(localDateTimeStr);
      await createAppointment({
        patient: { id: patientId },
        doctor: { id: bookData.doctorId },
        appointmentDate: localDate.toISOString(),
        status: 'CONFIRMED'
      });
      setShowModal(false);
      setBookData({ doctorId: '', date: '' });
      setBookDate('');
      setBookSlot('');
      loadData();
      toast.success("Appointment Successfully Booked!");
    } catch (err) {
      toast.error("Booking failed. Make sure DB is running and a Doctor exists.");
    }
  };

  const handleCancel = (id) => {
    triggerConfirm(
      "Cancel Appointment?",
      "Are you sure you want to cancel this virtual consultation appointment permanently? This action cannot be undone.",
      "Cancel Appointment",
      async () => {
        try {
          const ok = await cancelAppointment(id);
          if(ok) {
             toast.success("Appointment Canceled!");
             loadData();
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
      "Are you sure you want to end your clinical patient session?",
      "Logout",
      () => {
        localStorage.removeItem('userEmail');
        window.location.href = '/';
      }
    );
  };

  const startCall = (apptId) => {
    setActiveAppt(apptId);
    setInCall(true);
  };

  if (inCall) {
    const activeApptObj = appointments.find(a => a.id === activeAppt);
    const activeDoctorId = activeApptObj?.doctor?.id;
    return <VideoConsultation appointmentId={activeAppt} patientId={patientId} doctorId={activeDoctorId} isDoctor={false} onClose={() => { setInCall(false); loadData(); }} />;
  }

  // Calculate stats
  const scheduledCallsCount = appointments.filter(a => a.status !== 'COMPLETED').length;
  const pendingScriptsCount = scripts.filter(s => !s.isFulfilled).length;

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', width: '100%', padding: '40px 20px', position: 'relative' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '1rem' }}>
        
        {/* Responsive Header Wrapper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '2.5rem' }}>
          <div>
            <h1 className="serif-text" style={{ fontSize: '3rem', color: 'var(--ink)', marginBottom: '0.5rem', marginTop: 0 }}>Welcome, {patientName || 'Patient'}!</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.1rem', margin: 0 }}>
              Patient Portal • Oversee prescriptions, schedule new clinical consultations, and manage records securely.
            </p>
          </div>
          {/* Header Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button onClick={handleOpenSettings} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               ⚙️ Settings
            </button>
            <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--coral)', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Live dynamic stats bar */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scheduled Calls</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{scheduledCallsCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--coral)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Prescriptions</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{pendingScriptsCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--violet)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medical Reports</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{records.length}</div>
          </div>
        </div>

        {/* Two-column Dashboard grid */}
        <div className="dashboard-grid">
          
          {/* Main workspace - Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Quick action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--sky)' }}>Schedule</h3>
                 <button className="glow-button" style={{ width: '100%', padding: '8px 16px', fontSize: '13px' }} onClick={handleOpenBookingModal}>Book Call</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--coral)' }}>Medication</h3>
                 <button className="glow-button" onClick={() => setShowScriptsModal(true)} style={{ background: 'transparent', border: '1.5px solid var(--coral)', color: 'var(--coral)', boxShadow: 'none', width: '100%', padding: '8px 16px', fontSize: '13px' }}>View Scripts</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--violet)' }}>History</h3>
                 <button className="glow-button" onClick={() => setShowRecordsModal(true)} style={{ background: 'transparent', border: '1.5px solid var(--violet)', color: 'var(--violet)', boxShadow: 'none', width: '100%', padding: '8px 16px', fontSize: '13px' }}>View Records</button>
              </div>
            </div>

            {/* Upcoming Appointments List */}
            <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)' }}>
              <h3 className="serif-text" style={{ marginBottom: '1.5rem', color: 'var(--ink)', fontSize: '1.8rem' }}>Upcoming Appointments</h3>
              {appointments.filter(a => a.status !== 'COMPLETED').length === 0 ? (
                 <p style={{ color: 'var(--ink-muted)', padding: '2rem', textAlign: 'center' }}>You have no upcoming virtual appointments scheduled.</p>
              ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {appointments.filter(a => a.status !== 'COMPLETED').map(appt => (
                    <div key={appt.id} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: '600' }}>Dr. {appt.doctor?.name || 'Specialist'}</h4>
                        <p style={{ color: 'var(--ink-muted)', fontSize: '13px', marginTop: '4px' }}>{appt.doctor?.specialist || 'General Medicine'} • {new Date(appt.appointmentDate).toLocaleString()}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <span style={{ fontSize: '13px', marginRight: '10px', color: 'var(--sky)', fontWeight: '600' }}>{appt.status}</span>
                         <button className="glow-button pulse-button" onClick={() => startCall(appt.id)} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Video size={16} /> Join Call
                         </button>
                         <button onClick={() => handleCancel(appt.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Cancel Appointment">
                           <XCircle size={18} />
                         </button>
                      </div>
                    </div>
                  ))}
                 </div>
              )}
            </div>

          </div>

          {/* Vitals & Profile Panel - Right Column (Matches landing visual design) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Patient Profile info card */}
            <div className="glass-card" style={{ padding: '2.2rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sky), var(--violet))', color: 'white', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 'bold', fontSize: '16px', justifyContent: 'center' }}>
                  PT
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '15px' }}>{patientName || 'Medical Patient'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--mint)', fontWeight: '600' }}>● Online</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Registered Email</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{patientEmail || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Account ID</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>#{patientId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Age / Triage Log</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{patientAge} years old</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Phone Number</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{patientPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Vitals display widget removed because we are doing live sessions */}

          </div>

        </div>
      </div>

      {/* Scripts Modal */}
      {showScriptsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>My Prescriptions</h2>
              <button onClick={() => setShowScriptsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            {scripts.length === 0 ? (
               <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>No active prescriptions found.</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {scripts.map(rx => (
                   <div key={rx.id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: rx.isFulfilled ? '5px solid var(--mint)' : '5px solid var(--coral)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <h4 style={{ color: 'var(--ink)', fontWeight: '600' }}>Prescription #RX-{rx.id}</h4>
                       <span style={{ color: rx.isFulfilled ? 'var(--mint)' : 'var(--coral)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                         {rx.isFulfilled ? 'Dispensed' : 'Pending Pharmacy'}
                       </span>
                     </div>
                     <p style={{ color: 'var(--ink-muted)', fontSize: '13px', margin: '4px 0 12px' }}>Issued by Dr. {rx.appointment?.doctor?.name || 'Practitioner'}</p>
                     <div style={{ background: 'var(--white)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                       <p style={{ color: 'var(--ink)', fontWeight: '600' }}>💊 {rx.medicationDetails}</p>
                       <p style={{ color: 'var(--ink-soft)', fontSize: '13px', marginTop: '4px' }}>{rx.instructions}</p>
                     </div>
                     {!rx.isFulfilled && (
                       <div style={{ marginTop: '0.8rem', padding: '10px 14px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: 'var(--sky)', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                         <span>🔑 Handover Legit Code:</span>
                         <span style={{ fontFamily: 'monospace', letterSpacing: '0.5px', background: 'var(--white)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '14px', color: 'var(--ink)' }}>{rx.verificationCode || 'Generating...'}</span>
                         <span style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: 'normal' }}>(Share with Pharmacist only)</span>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      )}

      {/* Records Modal */}
      {showRecordsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>Medical Records</h2>
              <button onClick={() => setShowRecordsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            {records.length === 0 ? (
               <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>No medical records on file.</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {records.map(rec => (
                   <div key={rec.id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '5px solid var(--violet)' }}>
                     <p style={{ color: 'var(--ink-muted)', fontSize: '13px', marginBottom: '8px' }}>{new Date(rec.recordDate).toLocaleString()} • Attending Dr. {rec.doctor?.name || 'Specialist'}</p>
                     <h4 style={{ color: 'var(--ink)', marginBottom: '6px', fontWeight: '600' }}>Diagnosis: {rec.diagnosis}</h4>
                     <div style={{ background: 'var(--white)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                       <p style={{ color: 'var(--ink-soft)', fontSize: '13px' }}><strong>Treatment Plan:</strong> {rec.treatmentPlan}</p>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '500px', background: 'var(--white)' }}>
            <h2 className="serif-text" style={{ marginBottom: '1.5rem', fontSize: '2.2rem', color: 'var(--ink)' }}>Schedule Appointment</h2>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Select Doctor</label>
                <select required value={bookData.doctorId} onChange={e => setBookData({...bookData, doctorId: e.target.value})} style={{ width: '100%' }}>
                  <option value="" disabled>Select Doctor</option>
                  {[...doctors].sort((a, b) => (b.rating || 0) - (a.rating || 0)).map(d => (
                     <option key={d.id} value={d.id}>
                       Dr. {d.name} ({d.specialist || 'General Medicine'}) — ★ {(d.rating || 5.0).toFixed(1)} ({d.ratingCount || 1} ratings)
                     </option>
                  ))}
                  {doctors.length === 0 && <option value="2">Demo Doctor (ID 2)</option>}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Select Date</label>
                <input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)} style={{ width: '100%' }} min={new Date().toISOString().split('T')[0]} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Select Time Slot</label>
                <select required value={bookSlot} onChange={e => setBookSlot(e.target.value)} style={{ width: '100%' }} disabled={!bookDate || !bookData.doctorId}>
                  <option value="" disabled>{!bookData.doctorId ? 'Please select a doctor first' : (!bookDate ? 'Please select a date first' : 'Select Time Slot')}</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.time} value={slot.time} disabled={isSlotBooked(slot.time)}>
                      {slot.label} {isSlotBooked(slot.time) ? ' (Booked)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1 }}>Confirm Booking</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
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

export default PatientDashboard;
