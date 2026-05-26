import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../api';
import toast from 'react-hot-toast';
import './LandingPage.css';

const getAIResponse = (userMessage) => {
  const msg = userMessage.toLowerCase().trim();
  
  // Support, contact, updates, email, help or feedback
  if (msg.includes('support') || msg.includes('contact') || msg.includes('update') || msg.includes('issue') || 
      msg.includes('bug') || msg.includes('feedback') || msg.includes('problem') || msg.includes('email') || 
      msg.includes('developer') || msg.includes('madhav') || msg.includes('customer') || msg.includes('help')) {
    return "If you need any support, want to suggest updates to the website, or report any issues, please reach out directly to Madhav at:\n\n✉️ madhav.gannina21@gmail.com\n\nWe will get back to you as soon as possible!";
  }
  
  // Booking & Appointments (matches "how to take an appointment", "book doctor", etc.)
  if (msg.includes('appoint') || msg.includes('book') || msg.includes('session') || msg.includes('schedule') || 
      msg.includes('take') || msg.includes('consultation') || msg.includes('consult') || msg.includes('time') || 
      msg.includes('slot') || msg.includes('meet') || msg.includes('video') || msg.includes('call') || msg.includes('chat')) {
    return "📅 Booking & Appointments Guide\n\n1. Sign in to your Patient dashboard (or register a Patient account if you do not have one).\n2. Browse the available verified doctors by specialty, rating, and next slot.\n3. Select a doctor and schedule your consultation slot.\n4. At the scheduled time, join the consultation room directly from your dashboard to connect via secure video or chat.\n5. During the live call, you can view your uploaded reports and documents, and your doctor can analyze them in real-time.";
  }
  
  // Login
  if (msg.includes('login') || msg.includes('log in') || msg.includes('signin') || msg.includes('sign in') || 
      msg.includes('log-in') || msg.includes('sign-in')) {
    return "🔑 Logging In\n\n• You can log in to MediLink by clicking 'Log in' at the top right of the page.\n• Authenticate using either your registered Email Address OR your Mobile Number along with your password.";
  }
  
  // Registration, creating account, sign up, joining (handling typos like registrartion, registraion, regestration, regester, etc.)
  if (msg.includes('reg') || msg.includes('signup') || msg.includes('sign up') || msg.includes('join') || 
      msg.includes('create') || msg.includes('account') || msg.includes('how we do') || msg.includes('sign-up')) {
    return "To register or create an account, click the 'Get started free' button at the top right of the landing page. You can register under one of three roles:\n\n• Patient: Requires name, email, password, and a unique mobile number.\n• Doctor: Requires license details, medical specialty, and a qualification certificate.\n• Pharmacist: Requires license details and pharmacy details.\n\nNote: Clinicians (Doctors & Pharmacists) must be verified by the administrator before accessing their dashboards.";
  }
  
  // Billing & Payments
  if (msg.includes('price') || msg.includes('cost') || msg.includes('free') || msg.includes('stripe') || 
      msg.includes('pay') || msg.includes('billing') || msg.includes('invoice')) {
    return "💳 Payments & Billing\n\n• Consultations are billed securely.\n• We integrate Stripe for seamless payment processing, invoice generation, and billing logs directly in your dashboard.";
  }
  
  // Doctor/Specialist/License/Clinician
  if (msg.includes('doctor') || msg.includes('doc') || msg.includes('dr') || msg.includes('specialist') || 
      msg.includes('license') || msg.includes('clinician')) {
    return "🩺 Doctor Portals & Registration\n\n• Registration: Doctors must provide their Name, Email, Unique Mobile Number, Specialty, License Number, and a copy of their qualification certificate.\n• Approval: Admin must approve the doctor's credentials before they can host consults.\n• Settings: Once registered, critical credentials (Specialty & License Number) are locked as read-only to prevent unauthorized changes.";
  }
  
  // Patient/Reports/Blood/Documents
  if (msg.includes('patient') || msg.includes('report') || msg.includes('blood') || msg.includes('document') || 
      msg.includes('share') || msg.includes('record') || msg.includes('file')) {
    return "🧑‍⚕️ Patient Portal & Report Sharing\n\n• Profile: Patients can register with a unique email or mobile number, and log in with either.\n• Live Sessions: During a live video consult, patients have a direct panel to upload/view their blood reports, lab scans, or other files.\n• Doctor View: The doctor can view, review, and analyze these shared documents in real-time during the consultation to provide a diagnosis.";
  }
  
  // Pharmacist/Prescription/Codes/Legit
  if (msg.includes('pharmacist') || msg.includes('pharmacy') || msg.includes('prescription') || msg.includes('code') || 
      msg.includes('legit') || msg.includes('handover') || msg.includes('dispense') || msg.includes('ml-')) {
    return "💊 Legit Prescription Handover Codes\n\n• Security Lock: In the Pharmacist Dashboard, pending prescriptions do not display patient names or drug details (they are locked to prevent data leaks).\n• Generation: When a doctor issues a prescription, a secure code (e.g., ML-4821) is generated.\n• Handover: The patient gets this code on their dashboard. The pharmacist enters it to unlock patient info, see the exact medication, and approve dispensing.";
  }
  
  // Admin/Approvals/Deletions
  if (msg.includes('admin') || msg.includes('delete') || msg.includes('remove') || msg.includes('approve') || msg.includes('deny')) {
    return "⚙️ Admin Dashboard Controls\n\n• Verification: Admin verifies license credentials and certificates to approve clinicians.\n• Clean Removal: Admin can delete users. Our backend has programmatic cascading deletes, meaning deleting a user automatically cleans up their appointments, prescriptions, and medical records securely.";
  }
  
  // Security/HIPAA/Encryption
  if (msg.includes('security') || msg.includes('hipaa') || msg.includes('encrypt') || msg.includes('privacy')) {
    return "🔒 Security & HIPAA Compliance\n\n• E2E Encryption: All video/audio consultation rooms are end-to-end WebRTC encrypted.\n• HIPAA Alignment: Protected Health Information (PHI) is encrypted at rest and in transit.\n• Data Protection: Strict separation of roles prevents unauthorized access to patients' clinical records.";
  }
  
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('guide')) {
    return "Hello! I am your MediLink Guide AI. 🤖 I'm here to help you navigate our virtual healthcare system. What would you like to know? You can ask me about:\n\n• Doctor or Patient registration\n• Booking virtual appointments\n• Legit Handover Codes for prescriptions\n• Patient report sharing during live calls\n• Admin verification and approvals\n• Platform security and HIPAA compliance\n• Support or website updates";
  }
  
  return "I'm not sure I understand that completely. 😅 As your MediLink Guide, I can help you with:\n\n• Booking virtual appointments (scheduling consultations)\n• Doctor/Patient Registration (roles, approvals)\n• Legit Handover Codes (dispensing medicines with ML-XXXX code)\n• Live Call Document Sharing (patient blood reports)\n• Admin Controls (approving credentials, user deletion)\n• Support or Website Updates (email contact)\n\nCould you please rephrase or click one of the quick suggestions?";
};

const LandingPage = () => {
  const [patientsCount, setPatientsCount] = useState(0);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [policyTab, setPolicyTab] = useState(null); // 'privacy' | 'terms' | 'hipaa'

  // Daily Habits Tracker state
  const [water, setWater] = useState(1500);
  const [steps, setSteps] = useState(6000);
  const [activeMins, setActiveMins] = useState(25);

  // AI Guide Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'system',
      text: "Hello! I am your MediLink Guide AI. 🤖 I'm here to help you understand all aspects of the platform. Ask me anything or select a topic below!"
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate AI response delay
    setTimeout(() => {
      const responseText = getAIResponse(text);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'system',
        text: responseText
      }]);
    }, 450);
  };

  const handleResetChat = () => {
    setChatMessages([
      {
        id: 1,
        sender: 'system',
        text: "Hello! I am your MediLink Guide AI. 🤖 I'm here to help you understand all aspects of the platform. Ask me anything or select a topic below!"
      }
    ]);
    toast.success("Chat history cleared.");
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const users = await getAllUsers();
      if (users && Array.isArray(users)) {
        const patients = users.filter(u => u.role === 'PATIENT');
        const approvedDoctors = users.filter(u => u.role === 'DOCTOR' && u.isApproved);
        setPatientsCount(patients.length);
        setDoctorsCount(approvedDoctors.length);
      }
    } catch (e) {
      console.error("Failed to load real-time landing page statistics.", e);
    }
  };

  const waterPct = Math.min(Math.round((water / 3000) * 100), 100);
  const stepsPct = Math.min(Math.round((steps / 10000) * 100), 100);
  const activePct = Math.min(Math.round((activeMins / 45) * 100), 100);
  const overallScore = Math.round((waterPct + stepsPct + activePct) / 3);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', width: '100%' }}>
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <Link to="/" className="logo">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24"><path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4zm1 11h-2v-2h2v2zm0-4h-2V6h2v3z"/></svg>
            </div>
            <span className="logo-text">MediLink</span>
          </Link>
          <div className="nav-links">
            <a href="#roles">Portals</a>
            <a href="#how">How it works</a>
            <a href="#tracker">Habits Tracker</a>
            <a href="#features">Features</a>
          </div>
          <div className="nav-cta">
            <Link to="/login" className="btn btn-ghost">Log in</Link>
            <Link to="/register" className="btn btn-primary">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid"></div>
          <div className="hero-blob1"></div>
          <div className="hero-blob2"></div>
        </div>
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Virtual-first healthcare, now live
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: 1.15, marginBottom: '20px' }}>
              Healthcare that comes <em>to you</em>, anywhere
            </h1>
            <p className="hero-desc">
              Book virtual consultations, receive e-prescriptions, access lab reports, and manage your complete medical journey, all in one secure platform for patients, doctors, pharmacists, and admins.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Book a consultation →</Link>
              <a href="#how" className="btn btn-ghost btn-lg">See how it works</a>
            </div>
            {/* Analytics restructured to Dashboard UI style cards with real time numbers */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2.5rem', width: '100%', maxWidth: '520px' }}>
              <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--white)', borderTop: '4px solid var(--sky)', textAlign: 'left', borderRadius: '12px', boxShadow: 'var(--card-shadow)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Patients</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ink)', marginTop: '0.4rem' }}>{patientsCount}</div>
              </div>
              <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--white)', borderTop: '4px solid var(--mint)', textAlign: 'left', borderRadius: '12px', boxShadow: 'var(--card-shadow)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Licensed Doctors</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ink)', marginTop: '0.4rem' }}>{doctorsCount}</div>
              </div>
              <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--white)', borderTop: '4px solid var(--violet)', textAlign: 'left', borderRadius: '12px', boxShadow: 'var(--card-shadow)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Satisfaction Rate</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ink)', marginTop: '0.4rem' }}>98%</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="hc-header">
                <div className="hc-avatar">DR</div>
                <div className="hc-info">
                  <div className="hc-name">Dr. Priya Sharma</div>
                  <div className="hc-role">Cardiologist · AIIMS Delhi</div>
                </div>
                <div className="hc-badge">● Online</div>
              </div>
              <div className="hc-section">
                <div className="hc-label">Today's consultations</div>
                <div className="hc-appt">
                  <div className="hc-appt-icon" style={{ background: '#fef3c7' }}>🎥</div>
                  <div className="hc-appt-info">
                    <div className="hc-appt-name">Arjun Mehta</div>
                    <div className="hc-appt-time">10:00 AM — Video call</div>
                  </div>
                  <span className="hc-appt-status status-live">Live now</span>
                </div>
                <div className="hc-appt">
                  <div className="hc-appt-icon" style={{ background: '#e0f2fe' }}>💬</div>
                  <div className="hc-appt-info">
                    <div className="hc-appt-name">Sunita Bose</div>
                    <div className="hc-appt-time">11:30 AM — Chat consultation</div>
                  </div>
                  <span className="hc-appt-status status-next">Up next</span>
                </div>
              </div>
              <div className="hc-section" style={{ marginBottom: 0 }}>
                <div className="hc-label">Patient vitals — Arjun Mehta</div>
                <div className="vitals">
                  <div className="vital">
                    <div className="vital-val">124/80</div>
                    <div className="vital-lbl">Blood pressure</div>
                  </div>
                  <div className="vital">
                    <div className="vital-val">96%</div>
                    <div className="vital-lbl">SpO₂</div>
                  </div>
                  <div className="vital">
                    <div className="vital-val">72 bpm</div>
                    <div className="vital-lbl">Heart rate</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="floating-card fc-rx">
              <span className="fc-rx-icon">💊</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>E-Prescription sent</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Amoxicillin 500mg · 7 days</div>
              </div>
            </div>

            <div className="floating-card fc-video">
              <div className="fc-video-circle">
                <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                  <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--ink)' }}>HD Video call</div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '11px' }}>End-to-end encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="section" id="roles">
        <div className="section-inner">
          <div className="section-tag">Role-based portals</div>
          <h2 className="section-title">Built for everyone in healthcare</h2>
          <p className="section-sub">Three powerful, dedicated portals — each designed around the specific needs and workflows of every stakeholder.</p>
          <div className="roles-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="role-card patient">
              <div className="role-icon ri-patient">
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="role-title" style={{ color: '#1e3a8a' }}>Patient Portal</div>
              <ul className="role-features rf-patient">
                <li>Book & manage video/chat appointments</li>
                <li>Receive and download e-prescriptions</li>
                <li>Access lab reports & medical history</li>
                <li>Real-time prescription tracking</li>
                <li>Symptom checker before consultation</li>
                <li>Secure in-app messaging with doctor</li>
                <li>Insurance & billing management</li>
                <li>Medication reminders & refills</li>
              </ul>
            </div>
            <div className="role-card doctor">
              <div className="role-icon ri-doctor">
                <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <div className="role-title" style={{ color: '#14532d' }}>Doctor Portal</div>
              <ul className="role-features rf-doctor">
                <li>HD video consultations with patients</li>
                <li>Issue digital e-prescriptions (signed)</li>
                <li>View complete patient medical history</li>
                <li>Order lab tests & view results</li>
                <li>Set availability & manage schedule</li>
                <li>Digital SOAP notes & clinical records</li>
                <li>Refer patients to specialists</li>
                <li>Earnings dashboard & analytics</li>
              </ul>
            </div>
            <div className="role-card pharmacist">
              <div className="role-icon ri-pharmacist">
                <svg viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
              </div>
              <div className="role-title" style={{ color: '#7c2d12' }}>Pharmacist Portal</div>
              <ul className="role-features rf-pharmacist">
                <li>Receive & verify e-prescriptions</li>
                <li>Manage drug inventory & stock alerts</li>
                <li>Process & track medication orders</li>
                <li>Drug interaction & allergy checking</li>
                <li>Counsel patients on medication use</li>
                <li>Approve refill requests</li>
                <li>dispense & log controlled substances</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <div className="how-inner">
          <div className="section-tag">Patient journey</div>
          <h2 className="section-title">From symptom to prescription in minutes</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6M9 18h6M9 10h6"></path></svg>
              </div>
              <div className="step-title">Register & describe</div>
              <div className="step-desc">Create your account, fill in your health profile, and describe your symptoms using our guided checker.</div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div className="step-title">Choose a doctor</div>
              <div className="step-desc">Browse specialists by speciality, rating, language, and next available slot. Book instantly.</div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
              <div className="step-title">Virtual consultation</div>
              <div className="step-desc">Join an encrypted HD video call. Doctor reviews your history, vitals, and lab results in real-time.</div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
              </div>
              <div className="step-title">Prescription & follow-up</div>
              <div className="step-desc">Receive a signed e-prescription, track your medication, and schedule follow-ups in one tap.</div>
            </div>
          </div>
        </div>
      </section>

      {/* DAILY HEALTHY HABITS TRACKER */}
      <section className="tracker-section" id="tracker" style={{ padding: '80px 5%', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-tag" style={{ textAlign: 'center' }}>Live Demo Simulator</div>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '16px' }}>Track Your Healthy Habits, Live</h2>
          <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 48px', maxWidth: '650px' }}>
            Experience our interactive wellness tracker. Log your water intake, update your steps, and record active exercise minutes to see your daily health score calculate in real-time.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }} className="tracker-grid">
            {/* Interactive Control Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Card 1: Water Tracker */}
              <div className="glass-card" style={{ padding: '24px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ fontSize: '32px', padding: '12px', background: '#e0f2fe', borderRadius: '12px', color: 'var(--sky)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--ink)' }}>Hydration</span>
                    <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{water} / 3000 ml</span>
                  </div>
                  <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${waterPct}%`, background: 'var(--sky)', height: '100%', borderRadius: '4px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => setWater(prev => Math.min(prev + 250, 4000))} 
                  className="btn btn-ghost" 
                  style={{ borderRadius: '10px', padding: '8px 14px', fontSize: '12px', borderColor: 'var(--sky)', color: 'var(--sky)' }}
                >
                  +250ml
                </button>
              </div>

              {/* Card 2: Steps Tracker */}
              <div className="glass-card" style={{ padding: '24px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ fontSize: '32px', padding: '12px', background: '#dcfce7', borderRadius: '12px', color: '#16a34a', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚶</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--ink)' }}>Daily Steps</span>
                    <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{steps} / 10000 steps</span>
                  </div>
                  <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${stepsPct}%`, background: '#22c55e', height: '100%', borderRadius: '4px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => setSteps(prev => Math.min(prev + 1000, 15000))} 
                  className="btn btn-ghost" 
                  style={{ borderRadius: '10px', padding: '8px 14px', fontSize: '12px', borderColor: '#22c55e', color: '#22c55e' }}
                >
                  +1000 steps
                </button>
              </div>

              {/* Card 3: Active Minutes Tracker */}
              <div className="glass-card" style={{ padding: '24px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ fontSize: '32px', padding: '12px', background: '#faf5ff', borderRadius: '12px', color: '#7c3aed', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--ink)' }}>Active Time</span>
                    <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{activeMins} / 45 mins</span>
                  </div>
                  <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${activePct}%`, background: '#a855f7', height: '100%', borderRadius: '4px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveMins(prev => Math.min(prev + 5, 90))} 
                  className="btn btn-ghost" 
                  style={{ borderRadius: '10px', padding: '8px 14px', fontSize: '12px', borderColor: '#a855f7', color: '#a855f7' }}
                >
                  +5 mins
                </button>
              </div>

              {/* Reset simulator */}
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button 
                  onClick={() => { setWater(1500); setSteps(6000); setActiveMins(25); }} 
                  style={{ fontSize: '12px', color: 'var(--ink-muted)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  🔄 Reset simulator stats
                </button>
              </div>

            </div>

            {/* Overall Score Circle Indicator */}
            <div className="glass-card" style={{ padding: '40px', background: 'var(--white)', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
              <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                
                {/* SVG Progress Circle Ring */}
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                  <circle 
                    cx="90" 
                    cy="90" 
                    r="76" 
                    stroke="#f1f5f9" 
                    strokeWidth="12" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="90" 
                    cy="90" 
                    r="76" 
                    stroke="url(#trackerGrad)" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray="477.5"
                    strokeDashoffset={477.5 - (477.5 * overallScore) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                  />
                  <defs>
                    <linearGradient id="trackerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--sky)" />
                      <stop offset="100%" stopColor="var(--violet)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inside Score Text */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--ink)' }}>{overallScore}%</span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Day Progress</span>
                </div>
              </div>

              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--ink)', marginBottom: '8px' }}>
                {overallScore < 50 && "Start moving to hit your goals!"}
                {overallScore >= 50 && overallScore < 80 && "You're doing great! Keep going."}
                {overallScore >= 80 && overallScore < 100 && "Almost there! Incredible effort."}
                {overallScore === 100 && "Perfect Day! Health goals accomplished! 🏆"}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: '1.5' }}>
                {overallScore < 100 ? (
                  `Log more stats. You need ${3000 - water > 0 ? `${3000 - water}ml water` : ''} ${3000 - water > 0 && 10000 - steps > 0 ? 'and' : ''} ${10000 - steps > 0 ? `${10000 - steps} steps` : ''} to meet target guidelines.`
                ) : (
                  "You've fully completed your health habits targets for today! Maintain this streak for optimal physical wellness."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-tag">Platform features</div>
          <h2 class="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Everything healthcare needs, digitized</h2>
          <div className="features-grid">
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div className="feat-title">HIPAA-grade security</div>
              <div className="feat-desc">End-to-end encryption, role-based access control, and complete audit trails for all clinical data.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
              <div className="feat-title">HD video consultations</div>
              <div className="feat-desc">WebRTC-powered video calls with screen sharing, call toggles, and low connectivity adaptation.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="feat-title">Digital e-prescriptions</div>
              <div className="feat-desc">Digitally signed prescriptions with security codes, sent directly to pharmacists in real-time.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M6 3h12M8 3v7.5L3 19a2 2 0 0 0 1.8 3h14.4a2 2 0 0 0 1.8-3l-5-8.5V3M6 14h12"></path></svg>
              </div>
              <div className="feat-title">Lab integration</div>
              <div className="feat-desc">Doctors order tests digitally; results flow back automatically to patient medical histories.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div className="feat-title">Unified medical records</div>
              <div className="feat-desc">Complete longitudinal health records including clinical diagnoses, SOAP notes, and treatment histories.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              </div>
              <div className="feat-title">Payments & billing</div>
              <div className="feat-desc">Stripe-powered payments with invoice generation and billing logs for every consultation.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <div className="feat-title">Smart notifications</div>
              <div className="feat-desc">Automated alerts for appointments, new records, and prescription fulfillments in real-time.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div className="feat-title">AI symptom checker</div>
              <div className="feat-desc">Pre-consultation triage collects symptoms and recommends specialists, speeding up clinical pathways.</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </div>
              <div className="feat-title">Analytics dashboards</div>
              <div className="feat-desc">Rich dashboards for admins, doctors, and pharmacists with consultation volumes and user tracking.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-blob"></div>
        <div className="cta-inner">
          <h2 className="cta-title">Start your virtual consultation today</h2>
          <p className="cta-sub">MediLink is fully open-source, HIPAA compliant, and deployment ready. Create a profile or log in to launch your medical room.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Get started free →</Link>
            <Link to="/login" className="btn btn-outline-white btn-lg">Access Portals</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">MediLink</div>
          <div className="footer-links">
            <a href="#" onClick={(e) => { e.preventDefault(); setPolicyTab('privacy'); }}>Privacy policy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setPolicyTab('terms'); }}>Terms of service</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setPolicyTab('hipaa'); }}>HIPAA Compliance</a>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.success("System Status: Online 🟢 All clinical servers operational."); }}>System status: Online</a>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>© 2026 MedLink with Madhav</div>
        </div>
      </footer>

      {/* Policy Modal Overlay */}
      {policyTab && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="glass-card" style={{ padding: '2.5rem', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--white)', border: '1px solid var(--border)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h3 className="serif-text" style={{ fontSize: '1.8rem', margin: 0, color: 'var(--ink)' }}>
                {policyTab === 'privacy' && 'Privacy Policy'}
                {policyTab === 'terms' && 'Terms of Service'}
                {policyTab === 'hipaa' && 'HIPAA Compliance'}
              </h3>
              <button onClick={() => setPolicyTab(null)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>

            <div style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {policyTab === 'terms' && (
                <>
                  <p>Welcome to MediLink. By using our platform, you agree to these Terms of Service. Please review our operating guidelines below:</p>
                  
                  <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                    <h4 style={{ color: '#15803d', margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold' }}>✅ WHAT TO DO (Best Practices)</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Provide genuine and accurate age, name, and contact details during registration.</li>
                      <li>Upload only valid medical records, blood reports, or prescription histories.</li>
                      <li>Maintain professional conduct with all consulting medical practitioners.</li>
                      <li>Use secure, private devices when engaging in live video room consultations.</li>
                    </ul>
                  </div>

                  <div style={{ background: '#fef2f2', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                    <h4 style={{ color: '#b91c1c', margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold' }}>❌ WHAT NOT TO DO (Prohibited Actions)</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Do not upload fake clinical certificates, license numbers, or fabricated medical documents.</li>
                      <li>Do not use the platform for immediate life-threatening medical emergencies (contact emergency services directly).</li>
                      <li>Do not share login credentials or attempt to access other user dashboards.</li>
                      <li>Do not engage in harassment or recording of virtual consultation sessions without explicit consent.</li>
                    </ul>
                  </div>
                </>
              )}

              {policyTab === 'privacy' && (
                <>
                  <p>Your privacy is our utmost priority. MediLink implements industry-standard protocols to secure your data.</p>
                  <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                    <h4 style={{ color: '#15803d', margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold' }}>✅ WHAT TO DO</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Ensure your registered email address and mobile number are kept up to date for secure recovery.</li>
                      <li>Enable camera and microphone permissions solely within our official consultation room.</li>
                      <li>Review the credentials and ratings of providers before booking sessions.</li>
                    </ul>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                    <h4 style={{ color: '#b91c1c', margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold' }}>❌ WHAT NOT TO DO</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Do not store or share sensitive personal medical data in unencrypted chat messages.</li>
                      <li>Do not allow unauthorized individuals to view your dashboard or live call screens.</li>
                    </ul>
                  </div>
                </>
              )}

              {policyTab === 'hipaa' && (
                <>
                  <p>MediLink is designed to align with the Health Insurance Portability and Accountability Act (HIPAA) requirements:</p>
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px' }}>
                    <li><strong>Protected Health Information (PHI):</strong> All patient records, blood reports, and e-prescriptions are encrypted at rest and in transit.</li>
                    <li><strong>Consultation Security:</strong> Video and audio streams utilize secure Peer-to-peer protocols with fallback relays.</li>
                    <li><strong>Access Control:</strong> Administrative controls enforce role-based authorization to prevent unauthorized disclosure.</li>
                  </ul>
                </>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setPolicyTab(null)} style={{ padding: '8px 20px', fontSize: '14px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* AI GUIDE CHAT WIDGET */}
      <div className="ai-guide-container">
        {!isChatOpen ? (
          <button 
            className="ai-guide-bubble" 
            onClick={() => setIsChatOpen(true)}
            title="Open MediLink AI Guide"
          >
            💬
          </button>
        ) : (
          <div className="ai-guide-window">
            <div className="ai-guide-header">
              <div className="ai-guide-header-avatar">🤖</div>
              <div className="ai-guide-header-info">
                <div className="ai-guide-header-title">MediLink Guide AI</div>
                <div className="ai-guide-header-status">Online Guide</div>
              </div>
              <button 
                className="ai-guide-header-reset" 
                onClick={handleResetChat}
                title="Reset Chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  cursor: 'pointer',
                  opacity: 0.8,
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                🔄
              </button>
              <button 
                className="ai-guide-header-close" 
                onClick={() => setIsChatOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="ai-guide-messages">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`ai-message ${msg.sender}`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="ai-guide-suggestions">
              <button 
                className="ai-suggestion-chip" 
                onClick={() => handleSendMessage("How do patients share reports?")}
              >
                🧑‍⚕️ Report Sharing
              </button>
              <button 
                className="ai-suggestion-chip" 
                onClick={() => handleSendMessage("What is a Legit Verification Code?")}
              >
                💊 Legit Prescriptions
              </button>
              <button 
                className="ai-suggestion-chip" 
                onClick={() => handleSendMessage("How to register as a doctor?")}
              >
                🩺 Doctor Verification
              </button>
              <button 
                className="ai-suggestion-chip" 
                onClick={() => handleSendMessage("Is MediLink HIPAA compliant?")}
              >
                🔒 HIPAA & Security
              </button>
            </div>

            <div className="ai-guide-input-area">
              <input 
                type="text" 
                className="ai-guide-input" 
                placeholder="Ask the guide..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <button className="ai-guide-send" onClick={() => handleSendMessage()}>
                ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
