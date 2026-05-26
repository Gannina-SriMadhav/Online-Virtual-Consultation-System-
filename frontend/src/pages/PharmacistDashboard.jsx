import React, { useState, useEffect, useRef } from 'react';
import { getAllPrescriptions, getAllUsers, fulfillPrescription, updateUserProfile, verifyPrescriptionCode } from '../api';
import toast from 'react-hot-toast';
import { LogOut, Key, CheckCircle, Search, Lock, FileText, Check } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    welcome: "Welcome",
    settings: "Settings",
    logout: "Logout",
    incomingQueue: "Incoming Queue",
    dispensedScripts: "Dispensed Scripts",
    totalLogs: "Total Logs",
    legitVerification: "Legit Handover Verification",
    legitVerificationDesc: "Enter the Handover Verification Code generated in the Patient's dashboard to securely decrypt the prescription, retrieve the patient's name, and dispense the medications.",
    enterLegitCodePlaceholder: "Enter legit code (e.g. ML-A39B)",
    verifyLegitCodeBtn: "Verify Legit Code",
    verifying: "Verifying...",
    verifiedLegitPrescription: "Verified Legit Prescription",
    dispenseToPatient: "Dispense To (Patient)",
    prescribingDoctor: "Prescribing Doctor",
    medicationDetails: "Medication Details",
    instructions: "Instructions:",
    dispenseHandoverBtn: "Dispense & Handover Medicines",
    clearBtn: "Clear",
    noPrescriptionDecrypted: "No prescription currently decrypted.",
    noPrescriptionDecryptedDesc: "Verify a legit Handover Code above to unlock patient details.",
    pendingHandovers: "Pending Handovers",
    pendingLegitCodeTag: "PENDING LEGIT CODE",
    detailsEncrypted: "Details Encrypted",
    registeredEmail: "Registered Email",
    accountId: "Account ID",
    pharmacyLicense: "Pharmacy License",
    age: "Age",
    yearsOld: "years old",
    phoneNum: "Phone Number",
    dispensedArchive: "Dispensed Archive",
    noPrescriptionsDispensedYet: "No prescriptions dispensed yet.",
    dispensedTag: "Dispensed",
    codeUsed: "Code Used:",
    dispenseConfirmTitle: "Dispense & Handover?",
    dispenseConfirmDesc: "Confirm handout of medications to Patient ",
    confirmLogoutTitle: "Confirm Logout",
    confirmLogoutDesc: "Are you sure you want to end your pharmacy session?",
    passwordsDoNotMatch: "Passwords do not match!",
    profileUpdated: "Profile updated successfully!",
    profileUpdateFailed: "Failed to update profile details. Verify fields and email uniqueness.",
    loadDetailsFailed: "Failed to load account details.",
    enterVerificationCodeError: "Please enter a verification code.",
    alreadyDispensedError: "This prescription has already been dispensed.",
    retrievedSuccess: "Legit Handover Code Verified! Prescription retrieved.",
    invalidCodeError: "Invalid verification code or prescription already dispensed.",
    dispenseSuccess: "Prescription successfully dispensed!",
    dispenseFailed: "Failed to dispense prescription.",
    accountSettings: "Account Settings",
    fullNameInput: "Full Name",
    emailInput: "Email Address",
    ageInput: "Age (Years)",
    phoneInput: "Phone Number",
    passwordInput: "Password",
    passwordInputHint: "(Leave blank to keep unchanged)",
    confirmPasswordInput: "Confirm Password",
    editDetailsBtn: "Edit details",
    closeBtn: "Close",
    cancelBtn: "Cancel"
  },
  hi: {
    welcome: "स्वागत है",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    incomingQueue: "आगमन कतार (Incoming Queue)",
    dispensedScripts: "दवा दी गई पर्चे",
    totalLogs: "कुल लॉग",
    legitVerification: "वैध हैंडओवर सत्यापन",
    legitVerificationDesc: "नुस्खे को सुरक्षित रूप से डिक्रिप्ट करने, मरीज का नाम प्राप्त करने और दवाएं वितरित करने के लिए मरीज के डैशबोर्ड में उत्पन्न हैंडओवर सत्यापन कोड दर्ज करें।",
    enterLegitCodePlaceholder: "वैध कोड दर्ज करें (जैसे: ML-A39B)",
    verifyLegitCodeBtn: "वैध कोड सत्यापित करें",
    verifying: "सत्यापित किया जा रहा है...",
    verifiedLegitPrescription: "सत्यापित वैध नुस्खा",
    dispenseToPatient: "दवा वितरण (मरीज)",
    prescribingDoctor: "पर्चे लिखने वाले डॉक्टर",
    medicationDetails: "दवा का विवरण",
    instructions: "निर्देश:",
    dispenseHandoverBtn: "दवाएं वितरित करें और सौंपें",
    clearBtn: "साफ़ करें",
    noPrescriptionDecrypted: "वर्तमान में कोई नुस्खा डिक्रिप्ट नहीं किया गया है।",
    noPrescriptionDecryptedDesc: "मरीज के विवरण को अनलॉक करने के लिए ऊपर एक वैध हैंडओवर कोड सत्यापित करें।",
    pendingHandovers: "लंबित हैंडओवर",
    pendingLegitCodeTag: "लंबित वैध कोड",
    detailsEncrypted: "विवरण एन्क्रिप्टेड है",
    registeredEmail: "पंजीकृत ईमेल",
    accountId: "खाता आईडी",
    pharmacyLicense: "फार्मेसी लाइसेंस",
    age: "उम्र",
    yearsOld: "वर्ष",
    phoneNum: "फ़ोन नंबर",
    dispensedArchive: "वितरित पुरालेख (Archive)",
    noPrescriptionsDispensedYet: "अभी तक कोई नुस्खा वितरित नहीं किया गया है।",
    dispensedTag: "दवा दी गई",
    codeUsed: "प्रयुक्त कोड:",
    dispenseConfirmTitle: "वितरित करें और सौंपें?",
    dispenseConfirmDesc: "मरीज को दवाओं के वितरण की पुष्टि करें ",
    confirmLogoutTitle: "लॉगआउट की पुष्टि करें",
    confirmLogoutDesc: "क्या आप वाकई अपना फार्मेसी सत्र समाप्त करना चाहते हैं?",
    passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते!",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
    profileUpdateFailed: "प्रोफ़ाइल विवरण अपडेट करने में विफल। फ़ील्ड और ईमेल विशिष्टता सत्यापित करें।",
    loadDetailsFailed: "खाता विवरण लोड करने में विफल।",
    enterVerificationCodeError: "कृपया सत्यापन कोड दर्ज करें।",
    alreadyDispensedError: "यह नुस्खा पहले ही वितरित किया जा चुका है।",
    retrievedSuccess: "वैध हैंडओवर कोड सत्यापित! पर्चा प्राप्त किया गया।",
    invalidCodeError: "अमान्य सत्यापन कोड या नुस्खा पहले ही वितरित किया जा चुका है।",
    dispenseSuccess: "नुस्खा सफलतापूर्वक वितरित किया गया!",
    dispenseFailed: "नुस्खा वितरित करने में विफल।",
    accountSettings: "खाता सेटिंग्स",
    fullNameInput: "पूरा नाम",
    emailInput: "ईमेल पता",
    ageInput: "उम्र (वर्ष)",
    phoneInput: "फ़ोन नंबर",
    passwordInput: "पासवर्ड",
    passwordInputHint: "(अपरिवर्तित रखने के लिए खाली छोड़ दें)",
    confirmPasswordInput: "पासवर्ड की पुष्टि करें",
    editDetailsBtn: "विवरण संपादित करें",
    closeBtn: "बंद करें",
    cancelBtn: "रद्द करें"
  },
  te: {
    welcome: "స్వాగతం",
    settings: "సెట్టింగులు",
    logout: "లాగౌట్",
    incomingQueue: "ఇన్‌కమింగ్ క్యూ",
    dispensedScripts: "పంపిణీ చేసిన ప్రిస్క్రిప్షన్లు",
    totalLogs: "మొత్తం లాగ్‌లు",
    legitVerification: "లెజిట్ హ్యాండోవర్ ధృవీకరణ",
    legitVerificationDesc: "ప్రిస్క్రిప్షన్‌ను సురక్షితంగా డీక్రిప్ట్ చేయడానికి, రోగి పేరును తిరిగి పొందడానికి మరియు మందులను పంపిణీ చేయడానికి రోగి యొక్క డాష్‌బోర్డ్‌లో రూపొందించబడిన హ్యాండోవర్ వెరిఫికేషన్ కోడ్‌ను నమోదు చేయండి.",
    enterLegitCodePlaceholder: "లెజిట్ కోడ్‌ను నమోదు చేయండి (ఉదా. ML-A39B)",
    verifyLegitCodeBtn: "లెజిట్ కోడ్ ధృవీకరించు",
    verifying: "ధృవీకరిస్తున్నారు...",
    verifiedLegitPrescription: "ధృవీకరించబడిన లెజిట్ ప్రిస్క్రిప్షన్",
    dispenseToPatient: "రోగికి పంపిణీ చేయి",
    prescribingDoctor: "ప్రిస్క్రిప్షన్ ఇచ్చిన వైద్యుడు",
    medicationDetails: "మందుల వివరాలు",
    instructions: "సూచనలు:",
    dispenseHandoverBtn: "మందులను పంపిణీ చేయి & హ్యాండోవర్ చేయి",
    clearBtn: "క్లియర్",
    noPrescriptionDecrypted: "ప్రస్తుతం ఏ ప్రిస్క్రిప్షన్ డీక్రిప్ట్ చేయబడలేదు.",
    noPrescriptionDecryptedDesc: "రోగి వివరాలను అన్‌లాక్ చేయడానికి పైన ఉన్న లెజిట్ హ్యాండోవర్ కోడ్‌ను ధృవీకరించండి.",
    pendingHandovers: "పెండింగ్ హ్యాండోవర్లు",
    pendingLegitCodeTag: "పెండింగ్ లెజిట్ కోడ్",
    detailsEncrypted: "వివరాలు ఎన్‌క్రిప్ట్ చేయబడ్డాయి",
    registeredEmail: "నమోదిత ఈమెయిల్",
    accountId: "ఖాతా ఐడీ",
    pharmacyLicense: "ఫార్మసీ లైసెన్స్",
    age: "వయస్సు",
    yearsOld: "సంవత్సరాలు",
    phoneNum: "ఫోన్ నంబర్",
    dispensedArchive: "పంపిణీ చేసిన ఆర్కైవ్",
    noPrescriptionsDispensedYet: "ఇంతవరకు ప్రిస్క్రిప్షన్లు ఏవీ పంపిణీ చేయబడలేదు.",
    dispensedTag: "పంపిణీ చేయబడింది",
    codeUsed: "ఉపయోగించిన కోడ్:",
    dispenseConfirmTitle: "పంపిణీ చేయాలా & హ్యాండోవర్ చేయాలా?",
    dispenseConfirmDesc: "రోగికి మందులు ఇవ్వడానికి నిర్ధారించండి ",
    confirmLogoutTitle: "లాగౌట్ నిర్ధారించండి",
    confirmLogoutDesc: "మీరు మీ ఫార్మసీ సెషన్‌ను ముగించాలనుకుంటున్నారా?",
    passwordsDoNotMatch: "పాసవర్డ్‌లు సరిపోలడం లేదు!",
    profileUpdated: "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!",
    profileUpdateFailed: "ప్రొఫైల్ వివరాలను నవీకరించడంలో విఫలమైంది. ఫీల్డ్‌లు మరియు ఇమెయిల్ ప్రత్యేకతను ధృవీకరించండి.",
    loadDetailsFailed: "ఖాతా వివరాలను లోడ్ చేయడంలో విఫలమైంది.",
    enterVerificationCodeError: "దయచేసి ధృవీకరణ కోడ్‌ను నమోదు చేయండి.",
    alreadyDispensedError: "ఈ ప్రిస్క్రిప్షన్ ఇప్పటికే పంపిణీ చేయబడింది.",
    retrievedSuccess: "లెజిట్ హ్యాండోవర్ కోడ్ ధృవీకరించబడింది! ప్రిస్క్రిప్షన్ లోడ్ చేయబడింది.",
    invalidCodeError: "చెల్లని ధృవీకరణ కోడ్ లేదా ప్రిస్క్రిప్షన్ ఇప్పటికే పంపిణీ చేయబడింది.",
    dispenseSuccess: "ప్రిస్క్రిప్షన్ విజయవంతంగా పంపిణీ చేయబడింది!",
    dispenseFailed: "ప్రిస్క్రిప్షన్ పంపిణీ చేయడంలో విఫలమైంది.",
    accountSettings: "ఖాతా సెట్టింగులు",
    fullNameInput: "పూర్తి పేరు",
    emailInput: "ఈమెయిల్ చిరునామా",
    ageInput: "వయస్సు (సంవత్సరాలు)",
    phoneInput: "ఫోన్ నంబర్",
    passwordInput: "పాస్‌వర్డ్",
    passwordInputHint: "(మార్చకుండా ఉంచడానికి ఖాళీగా వదిలేయండి)",
    confirmPasswordInput: "పాస్‌వర్డ్ నిర్ధారించండి",
    editDetailsBtn: "వివరాలను సవరించండి",
    closeBtn: "మూసివేయి",
    cancelBtn: "రద్దు చేయి"
  }
};

const PharmacistDashboard = () => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');
  const t = TRANSLATIONS[currentLang];

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('lang', lang);
  };

  const [prescriptions, setPrescriptions] = useState([]);
  const [pharmacistName, setPharmacistName] = useState('Pharmacist');
  const [pharmacistId, setPharmacistId] = useState(null);
  const [pharmacistAge, setPharmacistAge] = useState('N/A');
  const [pharmacistEmail, setPharmacistEmail] = useState('');
  const [pharmacistPhone, setPharmacistPhone] = useState('N/A');
  const [pharmacistLicense, setPharmacistLicense] = useState('N/A');

  // Legit code verification state
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [verifiedScript, setVerifiedScript] = useState(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

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

  const loadData = async () => {
    const rx = await getAllPrescriptions();
    setPrescriptions(rx || []);
    
    const users = await getAllUsers();
    const myEmail = localStorage.getItem('userEmail');
    const me = (users || []).find(u => u.email === myEmail);
    if(me) {
      setPharmacistName(me.name);
      setPharmacistId(me.id);
      setPharmacistAge(me.age || 'N/A');
      setPharmacistEmail(me.email);
      setPharmacistPhone(me.phoneNumber || 'N/A');
      setPharmacistLicense(me.licenseNumber || 'N/A');
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
      const updated = await updateUserProfile(pharmacistId, payload);
      toast.success(t.profileUpdated);
      localStorage.setItem('userEmail', updated.email);
      loadData();
      setShowSettingsModal(false);
      setIsEditingSettings(false);
    } catch (err) {
      toast.error(t.profileUpdateFailed);
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

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCodeInput.trim()) {
      toast.error(t.enterVerificationCodeError);
      return;
    }
    setIsVerifyingCode(true);
    try {
      const rx = await verifyPrescriptionCode(verificationCodeInput.trim().toUpperCase());
      if (rx) {
        if (rx.isFulfilled) {
          toast.error(t.alreadyDispensedError);
          setVerifiedScript(null);
        } else {
          setVerifiedScript(rx);
          toast.success(t.retrievedSuccess);
        }
      }
    } catch (err) {
      toast.error(t.invalidCodeError);
      setVerifiedScript(null);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleFulfillVerified = async () => {
    if (!verifiedScript) return;
    triggerConfirm(
      t.dispenseConfirmTitle,
      `${t.dispenseConfirmDesc}${verifiedScript.appointment?.patient?.name || 'N/A'} (ID: #${verifiedScript.appointment?.patient?.id || 'N/A'})?`,
      t.dispenseHandoverBtn,
      async () => {
        try {
          await fulfillPrescription(verifiedScript.id);
          toast.success(`${t.dispenseSuccess} #RX-${verifiedScript.id}`);
          setVerifiedScript(null);
          setVerificationCodeInput('');
          loadData();
        } catch (err) {
          toast.error(t.dispenseFailed);
        }
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

  const pendingRx = prescriptions.filter(p => !p.isFulfilled);
  const archivedRx = prescriptions.filter(p => p.isFulfilled);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', width: '100%', padding: '40px 20px', position: 'relative' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '1rem', paddingBottom: '4rem' }}>
        
        {/* Responsive Header Wrapper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '2.5rem' }}>
          <div>
            <h1 className="serif-text" style={{ fontSize: '3rem', color: 'var(--ink)', marginBottom: '0.5rem', marginTop: 0 }}>{t.welcome}, {pharmacistName}!</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.1rem', margin: 0 }}>
              Pharmacy Portal • Verify legit handover codes, dispense medications, and review logs.
            </p>
          </div>
          {/* Header Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

        {/* Live dynamic stats bar */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.incomingQueue}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{pendingRx.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--mint)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.dispensedScripts}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{archivedRx.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--violet)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.totalLogs}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{prescriptions.length}</div>
          </div>
        </div>
        
        {/* Side-by-side Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Left Column (2fr) - Verification Box & Active list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Card 1: Legit Code Verification Panel */}
            <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)' }}>
              <h3 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--sky)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={22} /> {t.legitVerification}
              </h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {t.legitVerificationDesc}
              </p>
              
              <form onSubmit={handleVerifyCode} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                <input 
                  type="text" 
                  placeholder={t.enterLegitCodePlaceholder}
                  value={verificationCodeInput}
                  onChange={e => setVerificationCodeInput(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', fontSize: '15px', fontFamily: 'monospace', letterSpacing: '0.5px' }}
                />
                <button type="submit" className="glow-button" disabled={isVerifyingCode} style={{ padding: '12px 24px', fontSize: '14px', background: 'var(--sky)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isVerifyingCode ? t.verifying : t.verifyLegitCodeBtn}
                </button>
              </form>

              {/* Verified Script Result Display */}
              {verifiedScript ? (
                <div style={{ background: 'rgba(34, 197, 94, 0.04)', padding: '2rem', borderRadius: '12px', border: '1.5px solid #22c55e', borderLeft: '8px solid #22c55e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(34,197,94,0.15)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontWeight: 'bold' }}>
                      <CheckCircle size={20} /> {t.verifiedLegitPrescription}
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 'bold', background: '#22c55e', color: 'white', padding: '3px 10px', borderRadius: '4px' }}>
                      {verifiedScript.verificationCode}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{t.dispenseToPatient}</span>
                      <strong style={{ color: 'var(--ink)', fontSize: '16px' }}>{verifiedScript.appointment?.patient?.name || 'Unknown Patient'}</strong>
                      <span style={{ color: 'var(--ink-muted)', fontSize: '12px' }}> (ID: #{verifiedScript.appointment?.patient?.id || 'N/A'})</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--ink-muted)', display: 'block', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{t.prescribingDoctor}</span>
                      <strong style={{ color: 'var(--ink)', fontSize: '15px' }}>Dr. {verifiedScript.appointment?.doctor?.name || 'Unknown Doctor'}</strong>
                      <span style={{ color: 'var(--ink-muted)', fontSize: '12px' }}> (ID: #{verifiedScript.appointment?.doctor?.id || 'N/A'})</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <div style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{t.medicationDetails}</div>
                    <p style={{ color: 'var(--ink)', fontSize: '16px', fontWeight: '600', margin: 0 }}>💊 {verifiedScript.medicationDetails}</p>
                    <p style={{ color: 'var(--coral)', fontSize: '13.5px', marginTop: '6px', fontWeight: '500', margin: '6px 0 0' }}>{t.instructions} {verifiedScript.instructions}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="glow-button" onClick={handleFulfillVerified} style={{ flex: 1, background: 'var(--mint)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
                      {t.dispenseHandoverBtn}
                    </button>
                    <button className="btn-ghost" onClick={() => setVerifiedScript(null)} style={{ padding: '12px 18px', border: '1px solid var(--border)', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>
                      {t.clearBtn}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)', color: 'var(--ink-muted)' }}>
                  <Lock size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>{t.noPrescriptionDecrypted}</p>
                  <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>{t.noPrescriptionDecryptedDesc}</p>
                </div>
              )}
            </div>

            {/* Card 2: Encrypted / Pending Handover Queue */}
            <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)' }}>
              <h3 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--ink)' }}>
                {t.pendingHandovers} ({pendingRx.length})
              </h3>
              
              {pendingRx.length === 0 ? (
                 <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>All prescription queues have been verified and dispensed.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingRx.map(rx => (
                    <div key={rx.id} style={{ background: 'var(--surface)', padding: '1.2rem', borderRadius: '10px', border: '1px solid var(--border)', borderLeft: '5px solid var(--coral)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ color: 'var(--ink)', fontWeight: '600', margin: 0 }}>Prescription #RX-{rx.id}</h4>
                          <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{t.pendingLegitCodeTag}</span>
                        </div>
                        <p style={{ color: 'var(--ink-soft)', fontSize: '12.5px', marginTop: '4px', margin: '4px 0 0' }}>
                          Patient ID: <strong>#{rx.appointment?.patient?.id || 'N/A'}</strong> | Doctor: Dr. {rx.appointment?.doctor?.name || 'Specialist'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-muted)', fontSize: '12px' }}>
                        <Lock size={12} />
                        <span>{t.detailsEncrypted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1fr) - Profile card & Dispensed Archive */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Pharmacist Profile info card */}
            <div className="glass-card" style={{ padding: '2.2rem', background: 'var(--white)', borderTop: '4px solid var(--violet)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sky), var(--violet))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                  PH
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '15px' }}>{pharmacistName || 'Pharmacy Professional'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--mint)', fontWeight: '600' }}>● Online</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.registeredEmail}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{pharmacistEmail || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.accountId}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>#{pharmacistId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.pharmacyLicense}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{pharmacistLicense || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.age}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{pharmacistAge} {t.yearsOld}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.phoneNum}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{pharmacistPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Dispensed Archive Card (Fulfill history) */}
            <div className="glass-card" style={{ padding: '2rem', background: 'var(--white)', opacity: 0.9 }}>
              <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '1.25rem', color: 'var(--mint)' }}>
                {t.dispensedArchive} ({archivedRx.length})
              </h3>
              
              {archivedRx.length === 0 ? (
                 <p style={{ color: 'var(--ink-muted)', textAlign: 'center', fontSize: '13px', padding: '1rem 0' }}>{t.noPrescriptionsDispensedYet}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto' }}>
                  {archivedRx.map(rx => (
                    <div key={rx.id} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', borderLeft: '4px solid var(--mint)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                         <span style={{ color: 'var(--ink)', fontWeight: '600', fontSize: '13px' }}>#RX-{rx.id}</span>
                         <span style={{ color: 'var(--mint)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>✓ {t.dispensedTag}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink)', marginBottom: '4px' }}>
                        {t.dispenseToPatient}: <strong>{rx.appointment?.patient?.name || 'Unknown Patient'}</strong>
                        <span style={{ color: 'var(--ink-muted)' }}> (ID: #{rx.appointment?.patient?.id || 'N/A'})</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sky)', fontFamily: 'monospace', marginBottom: '6px' }}>
                        {t.codeUsed} {rx.verificationCode || 'LEGIT-CODE'}
                      </div>
                      <p style={{ color: 'var(--ink-soft)', fontSize: '12.5px', fontWeight: '500', margin: 0 }}>{rx.medicationDetails}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

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
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.pharmacyLicense}</label>
                <input type="text" required disabled value={settingsData.licenseNumber} style={{ width: '100%', background: 'var(--surface)', cursor: 'not-allowed' }} />
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
                      {showPassword ? '👁' : '👁‍🗨'}
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
                      {showConfirmPassword ? '👁' : '👁‍🗨'}
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

export default PharmacistDashboard;
