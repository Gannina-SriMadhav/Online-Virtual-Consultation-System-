import React, { useState, useEffect, useRef } from 'react';
import { getDoctorConsultations, issuePrescription, addMedicalRecord, getAllUsers, cancelAppointment, updateUserProfile } from '../api';
import toast from 'react-hot-toast';
import VideoConsultation from '../components/VideoConsultation';
import { Video, Calendar, XCircle, LogOut, FilePlus, Zap } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    welcome: "Welcome",
    settings: "Settings",
    logout: "Logout",
    totalConsultations: "Total Consultations",
    pendingSessions: "Pending Sessions",
    uniquePatients: "Unique Patients Logged",
    todaysConsultations: "Today's Consultations",
    hdVideoCall: "HD Video Call",
    noLiveAppts: "No live appointments pending.",
    liveNow: "Live now",
    cancelApptTitle: "Cancel Consultation?",
    cancelApptDesc: "Are you sure you want to cancel this appointment permanently? This will notify the patient.",
    cancelApptBtn: "Cancel Appointment",
    confirmLogoutTitle: "Confirm Logout",
    confirmLogoutDesc: "Are you sure you want to log out of your provider session?",
    clinicalActions: "Clinical Actions",
    clinicalActionsDesc: "Write digital e-prescriptions or add notes directly to your patient records.",
    writeEPrescription: "Write E-Prescription",
    updateMedicalRecord: "Update Medical Record",
    issueEPrescriptionTitle: "Issue E-Prescription",
    selectPatientAppt: "Select Patient / Appointment",
    medicationDetails: "Medication Details",
    fulfillmentInstructions: "Fulfillment Instructions",
    sendToPharmacy: "Send to Pharmacy",
    cancelBtn: "Cancel",
    saveChangesBtn: "Save Changes",
    saveClinicalLog: "Save Clinical Log",
    selectPatient: "Select Patient Name",
    selectPatientPlaceholder: "Select Patient",
    diagnosisSOAP: "Diagnosis SOAP / Summary",
    treatmentReferrals: "Treatment & Specialist Referrals",
    accountSettings: "Account Settings",
    fullNameInput: "Full Name",
    emailInput: "Email Address",
    ageInput: "Age (Years)",
    phoneInput: "Phone Number",
    licenseNumber: "Clinical License Number",
    specialty: "Medical Specialty",
    passwordInput: "Password",
    passwordInputHint: "(Leave blank to keep unchanged)",
    confirmPasswordInput: "Confirm Password",
    editDetailsBtn: "Edit details",
    closeBtn: "Close",
    passwordsDoNotMatch: "Passwords do not match!",
    profileUpdated: "Profile updated successfully!",
    profileUpdateFailed: "Failed to update profile details. Verify fields and email uniqueness.",
    loadDetailsFailed: "Failed to load account details.",
    prescriptionSuccess: "Prescription sent to Pharmacy successfully!",
    prescriptionFailed: "Failed to issue prescription.",
    recordSuccess: "Medical Record Updated!",
    recordFailed: "Failed to add medical record.",
    apptCanceled: "Appointment Canceled!",
    errCanceled: "Error canceling appointment.",
    failedCancelAction: "Failed to execute cancel action."
  },
  hi: {
    welcome: "स्वागत है",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    totalConsultations: "कुल परामर्श",
    pendingSessions: "लंबित सत्र",
    uniquePatients: "लॉग किए गए विशिष्ट मरीज",
    todaysConsultations: "आज के परामर्श",
    hdVideoCall: "एचडी वीडियो कॉल",
    noLiveAppts: "कोई लाइव अपॉइंटमेंट लंबित नहीं है।",
    liveNow: "अभी लाइव",
    cancelApptTitle: "परामर्श रद्द करें?",
    cancelApptDesc: "क्या आप वाकई इस अपॉइंटमेंट को स्थायी रूप से रद्द करना चाहते हैं? इससे मरीज को सूचित कर दिया जाएगा।",
    cancelApptBtn: "अपॉइंटमेंट रद्द करें",
    confirmLogoutTitle: "लॉगआउट की पुष्टि करें",
    confirmLogoutDesc: "क्या आप वाकई अपने प्रदाता सत्र से लॉग आउट करना चाहते हैं?",
    clinicalActions: "नैदानिक क्रियाएं",
    clinicalActionsDesc: "डिजिटल ई-प्रिस्क्रिप्शन लिखें या सीधे अपने मरीज के रिकॉर्ड में नोट्स जोड़ें।",
    writeEPrescription: "ई-प्रिस्क्रिप्शन लिखें",
    updateMedicalRecord: "चिकित्सा रिकॉर्ड अपडेट करें",
    issueEPrescriptionTitle: "ई-प्रिस्क्रिप्शन जारी करें",
    selectPatientAppt: "मरीज / अपॉइंटमेंट चुनें",
    medicationDetails: "दवा का विवरण",
    fulfillmentInstructions: "दवा वितरण निर्देश",
    sendToPharmacy: "फार्मेसी को भेजें",
    cancelBtn: "रद्द करें",
    saveChangesBtn: "बदलाव सहेजें",
    saveClinicalLog: "क्लिनिकल लॉग सहेजें",
    selectPatient: "मरीज का नाम चुनें",
    selectPatientPlaceholder: "मरीज चुनें",
    diagnosisSOAP: "निदान SOAP / सारांश",
    treatmentReferrals: "उपचार और विशेषज्ञ रेफरल",
    accountSettings: "खाता सेटिंग्स",
    fullNameInput: "पूरा नाम",
    emailInput: "ईमेल पता",
    ageInput: "उम्र (वर्ष)",
    phoneInput: "फ़ोन नंबर",
    licenseNumber: "लाइसेंस संख्या",
    specialty: "चिकित्सा विशेषता",
    passwordInput: "पासवर्ड",
    passwordInputHint: "(अपरिवर्तित रखने के लिए खाली छोड़ दें)",
    confirmPasswordInput: "पासवर्ड की पुष्टि करें",
    editDetailsBtn: "विवरण संपादित करें",
    closeBtn: "बंद करें",
    passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते!",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
    profileUpdateFailed: "प्रोफ़ाइल विवरण अपडेट करने में विफल। फ़ील्ड और ईमेल विशिष्टता सत्यापित करें।",
    loadDetailsFailed: "खाता विवरण लोड करने में विफल।",
    prescriptionSuccess: "प्रिस्क्रिप्शन फार्मेसी को सफलतापूर्वक भेजा गया!",
    prescriptionFailed: "प्रिस्क्रिप्शन जारी करने में विफल।",
    recordSuccess: "चिकित्सा रिकॉर्ड अपडेट किया गया!",
    recordFailed: "चिकित्सा रिकॉर्ड जोड़ने में विफल।",
    apptCanceled: "अपॉइंटमेंट रद्द कर दिया गया!",
    errCanceled: "अपॉइंटमेंट रद्द करने में त्रुटि।",
    failedCancelAction: "रद्द करने की कार्रवाई निष्पादित करने में विफल।"
  },
  te: {
    welcome: "స్వాగతం",
    settings: "సెట్టింగులు",
    logout: "లాగౌట్",
    totalConsultations: "మొత్తం సంప్రదింపులు",
    pendingSessions: "పెండింగ్ సెషన్లు",
    uniquePatients: "నమోదైన రోగులు",
    todaysConsultations: "ఈరోజు సంప్రదింపులు",
    hdVideoCall: "HD వీడియో కాల్",
    noLiveAppts: "లైవ్ అపాయింట్‌మెంట్‌లు ఏవీ పెండింగ్‌లో లేవు.",
    liveNow: "లైవ్ నౌ",
    cancelApptTitle: "సంప్రదింపును రద్దు చేయాలా?",
    cancelApptDesc: "మీరు ఈ అపాయింట్‌మెంట్‌ను శాశ్వతంగా రద్దు చేయాలనుకుంటున్నారా? ఇది రోగికి తెలియజేస్తుంది.",
    cancelApptBtn: "అపాయింట్‌మెంట్‌ను రద్దు చేయి",
    confirmLogoutTitle: "లాగౌట్ నిర్ధారించండి",
    confirmLogoutDesc: "మీరు మీ ప్రొవైడర్ సెషన్ నుండి లాగ్ అవుట్ చేయాలనుకుంటున్నారా?",
    clinicalActions: "క్లినికల్ చర్యలు",
    clinicalActionsDesc: "డిజిటల్ ఇ-ప్రిస్క్రిప్షన్లను రాయండి లేదా మీ రోగి రికార్డులకు నేరుగా గమనికలను జోడించండి.",
    writeEPrescription: "ఇ-ప్రిస్క్రిప్షన్ రాయండి",
    updateMedicalRecord: "వైద్య రికార్డును అప్‌డేట్ చేయి",
    issueEPrescriptionTitle: "ఇ-ప్రిస్క్రిప్షన్ జారీ చేయి",
    selectPatientAppt: "రోగి / అపాయింట్‌మెంట్‌ను ఎంచుకోండి",
    medicationDetails: "మందుల వివరాలు",
    fulfillmentInstructions: "మందుల పంపిణీ సూచనలు",
    sendToPharmacy: "ఫార్మసీకి పంపండి",
    cancelBtn: "రద్దు చేయి",
    saveChangesBtn: "మార్పులను సేവ് చేయండి",
    saveClinicalLog: "క్లినికల్ లాగ్‌ను సేవ్ చేయి",
    selectPatient: "రోగి పేరును ఎంచుకోండి",
    selectPatientPlaceholder: "రోగిని ఎంచుకోండి",
    diagnosisSOAP: "వ్యాధి నిర్ధారణ SOAP / సారాంశం",
    treatmentReferrals: "చికిత్స & స్పెషలిస్ట్ రిఫరల్స్",
    accountSettings: "ఖాతా సెట్టింగులు",
    fullNameInput: "పూర్తి పేరు",
    emailInput: "ఈమెయిల్ చిరునామా",
    ageInput: "వయస్సు (సంవత్సరాలు)",
    phoneInput: "ఫోన్ నంబర్",
    licenseNumber: "క్లినికల్ లైసెన్స్ నంబర్",
    specialty: "వైద్య స్పెషాలిటీ",
    passwordInput: "పాస్‌వర్డ్",
    passwordInputHint: "(మార్చకుండా ఉంచడానికి ఖాళీగా వదిలేయండి)",
    confirmPasswordInput: "పాస్‌వర్డ్ నిర్ధారించండి",
    editDetailsBtn: "వివరాలను సవరించండి",
    closeBtn: "మూసివేయి",
    passwordsDoNotMatch: "పాసవర్డ్‌లు సరిపోలడం లేదు!",
    profileUpdated: "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!",
    profileUpdateFailed: "ప్రొఫైల్ వివరాలను నవీకరించడంలో విఫలమైంది. ఫీల్డ్‌లు మరియు ఇమెయిల్ ప్రత్యేకతను ధృవీకరించండి.",
    loadDetailsFailed: "ఖాతా వివరాలను లోడ్ చేయడంలో విఫలమైంది.",
    prescriptionSuccess: "ప్రిస్క్రిప్షన్ విజయవంతంగా ఫార్మసీకి పంపబడింది!",
    prescriptionFailed: "ప్రిస్క్రిప్షన్ జారీ చేయడంలో విఫలమైంది.",
    recordSuccess: "వైద్య రికార్డు విజయవంతంగా అప్‌డేట్ చేయబడింది!",
    recordFailed: "వైద్య రికార్డును జోడించడంలో విఫలమైంది.",
    apptCanceled: "అపాయింట్‌మెంట్ రద్దు చేయబడింది!",
    errCanceled: "అపాయింట్‌మెంట్‌ను రద్దు చేయడంలో లోపం సంభవించింది.",
    failedCancelAction: "రద్దు చర్యను అమలు చేయడంలో విఫలమైంది."
  }
};

const DoctorDashboard = () => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');
  const t = TRANSLATIONS[currentLang];

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('lang', lang);
  };

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
      toast.error(t.loadDetailsFailed);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isEditingSettings) return;
    if (settingsData.password) {
      if (settingsData.password !== settingsData.confirmPassword) {
        toast.error(t.passwordsDoNotMatch);
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
      toast.success(t.profileUpdated);
      localStorage.setItem('userEmail', updated.email);
      loadAppointments();
      setShowSettingsModal(false);
      setIsEditingSettings(false);
    } catch (err) {
      toast.error(t.profileUpdateFailed);
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
      toast.success(t.prescriptionSuccess);
      setShowPrescriptionModal(false);
      setRxData({ appointmentId: '', medicationDetails: '', instructions: '' });
    } catch (err) { toast.error(t.prescriptionFailed); }
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
      toast.success(t.recordSuccess);
      setShowRecordModal(false);
      setRecordData({ patientId: '', diagnosis: '', treatmentPlan: '' });
    } catch (err) { toast.error(t.recordFailed); }
  };

  const handleCancel = (id) => {
    triggerConfirm(
      t.cancelApptTitle,
      t.cancelApptDesc,
      t.cancelApptBtn,
      async () => {
        try {
          const ok = await cancelAppointment(id);
          if(ok) {
             toast.success(t.apptCanceled);
             loadAppointments();
          } else {
             toast.error(t.errCanceled);
          }
        } catch (err) { toast.error(t.failedCancelAction); }
      }
    );
  };

  const handleLogout = () => {
    triggerConfirm(
      t.confirmLogoutTitle,
      t.confirmLogoutDesc,
      t.logout,
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
                   <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', margin: 0 }}>{t.welcome}, {doctorName || 'Specialist'}</h2>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <select 
                value={currentLang} 
                onChange={(e) => handleLangChange(e.target.value)} 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '13px', 
                  border: '1.5px solid var(--border)', 
                  background: 'var(--white)', 
                  cursor: 'pointer', 
                  borderRadius: '20px', 
                  outline: 'none', 
                  height: '38px',
                  fontWeight: '500',
                  color: 'var(--ink-soft)'
                }}
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="te">🇮🇳 తెలుగు</option>
              </select>
              <button onClick={handleOpenSettings} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
                 ⚙️ {t.settings}
              </button>
              <button onClick={handleLogout} className="btn-ghost" style={{ color: 'var(--coral)', display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
                 <LogOut size={16} /> {t.logout}
              </button>
            </div>
        </div>

        {/* Live dynamic metrics bar */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.totalConsultations}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{appointments.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--coral)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.pendingSessions}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{pendingConsultationsCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--mint)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.uniquePatients}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{uniquePatientsCount}</div>
          </div>
        </div>
        
        {/* Responsive Dashboard Grid */}
        <div className="dashboard-grid">
          
          {/* Scheduled Consultations - Left Column (Styled like mockup Today's Consultations) */}
          <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: '700', color: 'var(--ink-muted)', letterSpacing: '0.7px', margin: 0 }}>
                {t.todaysConsultations}
              </h3>
              <span style={{ background: 'var(--sky-pale)', color: 'var(--sky-dark)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                {t.hdVideoCall}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointments.filter(a => a.status !== 'COMPLETED').length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>{t.noLiveAppts}</p>
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
                         {t.liveNow}
                       </button>
                       <button onClick={() => handleCancel(appt.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title={t.cancelApptBtn}>
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
              <Zap size={24} /> {t.clinicalActions}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>{t.clinicalActionsDesc}</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <li>
                <button onClick={() => setShowPrescriptionModal(true)} className="btn-ghost" style={{ width: '100%', background: 'transparent', border: '1.5px solid var(--sky)', color: 'var(--sky)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: 'auto', padding: '10px 16px' }}>
                  <FilePlus size={18} /> {t.writeEPrescription}
                </button>
              </li>
              <li>
                <button onClick={() => setShowRecordModal(true)} className="btn-ghost" style={{ width: '100%', background: 'transparent', border: '1.5px solid var(--coral)', color: 'var(--coral)', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: 'auto', padding: '10px 16px' }}>
                  <FilePlus size={18} /> {t.updateMedicalRecord}
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
            <h2 className="serif-text" style={{ marginBottom: '1.5rem', fontSize: '2.2rem', color: 'var(--ink)' }}>{t.issueEPrescriptionTitle}</h2>
            <form onSubmit={handlePrescriptionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.selectPatientAppt}</label>
                <select required value={rxData.appointmentId} onChange={e => setRxData({...rxData, appointmentId: e.target.value})} style={{ width: '100%' }}>
                   <option value="" disabled>{t.selectPatientAppt}</option>
                   {appointments.map(a => <option key={a.id} value={a.id}>Appt #{a.id} - {a.patient?.name || 'Unknown'}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.medicationDetails}</label>
                <textarea placeholder="e.g. Amoxicillin 500mg, twice daily" required value={rxData.medicationDetails} onChange={e => setRxData({...rxData, medicationDetails: e.target.value})} rows="3" style={{ width: '100%', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.fulfillmentInstructions}</label>
                <textarea placeholder="e.g. Dispense 14-day supply, check for allergy logs" required value={rxData.instructions} onChange={e => setRxData({...rxData, instructions: e.target.value})} rows="2" style={{ width: '100%', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1 }}>{t.sendToPharmacy}</button>
                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="btn-ghost" style={{ flex: 1 }}>{t.cancelBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical Record Modal */}
      {showRecordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '500px', background: 'var(--white)' }}>
            <h2 className="serif-text" style={{ marginBottom: '1.5rem', fontSize: '2.2rem', color: 'var(--ink)' }}>{t.updateMedicalRecord}</h2>
            <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.selectPatient}</label>
                <select required value={recordData.patientId} onChange={e => setRecordData({...recordData, patientId: e.target.value})} style={{ width: '100%' }}>
                  <option value="" disabled>{t.selectPatientPlaceholder}</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} (Patient ID: {p.id})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.diagnosisSOAP}</label>
                <textarea placeholder="Write clinical diagnosis summary..." required value={recordData.diagnosis} onChange={e => setRecordData({...recordData, diagnosis: e.target.value})} rows="3" style={{ width: '100%', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.treatmentReferrals}</label>
                <textarea placeholder="Outline prescription refills, specialist references, or follow ups..." required value={recordData.treatmentPlan} onChange={e => setRecordData({...recordData, treatmentPlan: e.target.value})} rows="3" style={{ width: '100%', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1, background: 'var(--coral)', boxShadow: '0 4px 14px rgba(249,115,22,0.25)' }}>{t.saveClinicalLog}</button>
                <button type="button" onClick={() => setShowRecordModal(false)} className="btn-ghost" style={{ flex: 1 }}>{t.cancelBtn}</button>
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
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}>{t.cancelBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>{t.accountSettings}</h2>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            
            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.fullNameInput}</label>
                <input type="text" required disabled={!isEditingSettings} value={settingsData.name} onChange={e => setSettingsData({...settingsData, name: e.target.value})} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.emailInput}</label>
                <input type="email" required disabled={!isEditingSettings} value={settingsData.email} onChange={e => setSettingsData({...settingsData, email: e.target.value})} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.ageInput}</label>
                <input type="number" required disabled={!isEditingSettings} value={settingsData.age} onChange={e => setSettingsData({...settingsData, age: e.target.value})} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.phoneInput}</label>
                <input type="text" disabled={!isEditingSettings} value={settingsData.phoneNumber} onChange={e => setSettingsData({...settingsData, phoneNumber: e.target.value})} style={{ width: '100%' }} placeholder={t.phoneInput} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.licenseNumber}</label>
                <input type="text" required disabled value={settingsData.licenseNumber} style={{ width: '100%', background: 'var(--surface)', cursor: 'not-allowed' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.specialty}</label>
                <input type="text" required disabled value={settingsData.specialist} style={{ width: '100%', background: 'var(--surface)', cursor: 'not-allowed' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.passwordInput} {isEditingSettings && t.passwordInputHint}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                     type={showPassword ? "text" : "password"} 
                    disabled={!isEditingSettings} 
                    value={settingsData.password} 
                    onChange={e => setSettingsData({...settingsData, password: e.target.value})} 
                    placeholder={isEditingSettings ? t.passwordInput : "••••••••"} 
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
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.confirmPasswordInput}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                     type={showConfirmPassword ? "text" : "password"} 
                    disabled={!isEditingSettings} 
                    value={settingsData.confirmPassword || ''} 
                    onChange={e => setSettingsData({...settingsData, confirmPassword: e.target.value})} 
                    placeholder={isEditingSettings ? t.confirmPasswordInput : "••••••••"} 
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
                    <button type="button" onClick={() => setIsEditingSettings(true)} className="glow-button" style={{ flex: 1 }}>{t.editDetailsBtn}</button>
                    <button type="button" onClick={() => setShowSettingsModal(false)} className="btn-ghost" style={{ flex: 1 }}>{t.closeBtn}</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={handleSaveSettings} className="glow-button" style={{ flex: 1, background: 'var(--mint)', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}>{t.saveChangesBtn}</button>
                    <button type="button" onClick={() => { setIsEditingSettings(false); }} className="btn-ghost" style={{ flex: 1 }}>{t.cancelBtn}</button>
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
