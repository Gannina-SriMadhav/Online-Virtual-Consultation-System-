import React, { useState, useEffect, useRef } from 'react';
import { getAllUsers, approveUser, deleteUser, updateUserProfile } from '../api';
import toast from 'react-hot-toast';

const TRANSLATIONS = {
  en: {
    welcome: "Welcome",
    settings: "Settings",
    logout: "Logout",
    totalPatients: "Total Patients",
    activeDoctors: "Active Doctors",
    activePharmacists: "Active Pharmacists",
    pendingApprovals: "Pending Approvals",
    pendingApprovalQueue: "Pending Approval Queue",
    verifiedMedicalProviders: "Verified Medical Providers",
    registeredPatients: "Registered Patients",
    noProviders: "No providers in this category.",
    noPatients: "No patients currently registered.",
    providerNameRole: "Provider Name / Role",
    credentials: "Credentials",
    status: "Status",
    actions: "Actions",
    viewCredentials: "View Credentials",
    verified: "Verified",
    pendingReview: "Pending Review",
    approve: "Approve",
    remove: "Remove",
    patientName: "Patient Name",
    email: "Email",
    age: "Age",
    yearsOld: "years old",
    lic: "Lic:",
    specialty: "Specialty:",
    confirmLogoutTitle: "Confirm Logout",
    confirmLogoutDesc: "Are you sure you want to end your administrative override session?",
    approveProviderTitle: "Approve Provider?",
    approveProviderDesc: "Approve this medical professional? They will instantly gain platform access.",
    confirmDeletionTitle: "Confirm Deletion",
    confirmDeletionDesc: "Permanently delete this user from the system? This action cannot be undone.",
    deleteUser: "Delete User",
    passwordsDoNotMatch: "Passwords do not match!",
    profileUpdated: "Profile updated successfully!",
    profileUpdateFailed: "Failed to update profile details. Verify fields and email uniqueness.",
    loadDetailsFailed: "Failed to load account details.",
    approveSuccess: "User approved!",
    approveFailed: "Approval failed.",
    deleteSuccess: "User deleted.",
    deleteFailed: "Failed to delete user.",
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
    cancelBtn: "Cancel",
    saveChangesBtn: "Save Changes",
    enterNewPassword: "Enter new password",
    confirmNewPassword: "Confirm new password"
  },
  hi: {
    welcome: "स्वागत है",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    totalPatients: "कुल मरीज",
    activeDoctors: "सक्रिय डॉक्टर",
    activePharmacists: "सक्रिय फार्मासिस्ट",
    pendingApprovals: "लंबित अनुमोदन",
    pendingApprovalQueue: "अनुमोदन लंबित कतार",
    verifiedMedicalProviders: "सत्यापित चिकित्सा प्रदाता",
    registeredPatients: "पंजीकृत मरीज",
    noProviders: "इस श्रेणी में कोई प्रदाता नहीं हैं।",
    noPatients: "वर्तमान में कोई मरीज पंजीकृत नहीं है।",
    providerNameRole: "प्रदाता का नाम / भूमिका",
    credentials: "क्रेडेंशियल (योग्यता)",
    status: "स्थिति",
    actions: "कार्रवाई",
    viewCredentials: "योग्यता देखें",
    verified: "सत्यापित",
    pendingReview: "समीक्षा लंबित",
    approve: "स्वीकृत करें",
    remove: "हटाएं",
    patientName: "मरीज का नाम",
    email: "ईमेल",
    age: "उम्र",
    yearsOld: "वर्ष",
    lic: "लाइसेंस:",
    specialty: "विशेषता:",
    confirmLogoutTitle: "लॉगआउट की पुष्टि करें",
    confirmLogoutDesc: "क्या आप वाकई अपना प्रशासनिक ओवरराइड सत्र समाप्त करना चाहते हैं?",
    approveProviderTitle: "प्रदाता स्वीकृत करें?",
    approveProviderDesc: "इस चिकित्सा पेशेवर को स्वीकृत करें? उन्हें तुरंत प्लेटफॉर्म तक पहुंच प्राप्त होगी।",
    confirmDeletionTitle: "हटाने की पुष्टि करें",
    confirmDeletionDesc: "इस उपयोगकर्ता को सिस्टम से स्थायी रूप से हटा दें? इस कार्रवाई को वापस नहीं लिया जा सकता।",
    deleteUser: "उपयोगकर्ता हटाएं",
    passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते!",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
    profileUpdateFailed: "प्रोफ़ाइल विवरण अपडेट करने में विफल। फ़ील्ड और ईमेल विशिष्टता सत्यापित करें।",
    loadDetailsFailed: "खाता विवरण लोड करने में विफल।",
    approveSuccess: "उपयोगकर्ता स्वीकृत!",
    approveFailed: "अनुमोदन विफल रहा।",
    deleteSuccess: "उपयोगकर्ता हटाया गया।",
    deleteFailed: "उपयोगकर्ता को हटाने में विफल।",
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
    cancelBtn: "रद्द करें",
    saveChangesBtn: "परिवर्तन सहेजें",
    enterNewPassword: "नया पासवर्ड दर्ज करें",
    confirmNewPassword: "नए पासवर्ड की पुष्टि करें"
  },
  te: {
    welcome: "స్వాగతం",
    settings: "సెట్టింగులు",
    logout: "లాగౌట్",
    totalPatients: "మొత్తం రోగులు",
    activeDoctors: "యాక్టివ్ డాక్టర్లు",
    activePharmacists: "యాక్టివ్ ఫార్మాసిస్టులు",
    pendingApprovals: "పెండింగ్ అనుమతులు",
    pendingApprovalQueue: "పెండింగ్ అనుమతి క్యూ",
    verifiedMedicalProviders: "ధృవీకరించబడిన వైద్య ప్రదాతలు",
    registeredPatients: "నమోదైన రోగులు",
    noProviders: "ఈ విభాగంలో ప్రదాతలు ఎవరూ లేరు.",
    noPatients: "రోగులు ఎవరూ ప్రస్తుతం నమోదు కాలేదు.",
    providerNameRole: "ప్రదాత పేరు / పాత్ర",
    credentials: "రుజువులు (Credentials)",
    status: "స్థితి",
    actions: "చర్యలు",
    viewCredentials: "రుజువులను చూడండి",
    verified: "ధృవీకరించబడింది",
    pendingReview: "రివ్యూ పెండింగ్‌లో ఉంది",
    approve: "ఆమోదించు",
    remove: "తొలగించు",
    patientName: "రోగి పేరు",
    email: "ఈమెయిల్",
    age: "వయస్సు",
    yearsOld: "సంవత్సరాలు",
    lic: "లైసెన్స్:",
    specialty: "స్పెషాలిటీ:",
    confirmLogoutTitle: "లాగౌట్ నిర్ధారించండి",
    confirmLogoutDesc: "మీరు మీ అడ్మినిస్ట్రేటివ్ ఓవర్‌రైడ్ సెషన్‌ను ముగించాలనుకుంటున్నారా?",
    approveProviderTitle: "ప్రొవైడర్‌ను ఆమోదించాలా?",
    approveProviderDesc: "ఈ వైద్య నిపుణుడిని ఆమోదించాలా? వారు తక్షణమే ప్లాట్‌ఫారమ్ యాక్సెస్ పొందుతారు.",
    confirmDeletionTitle: "తొలగింపును నిర్ధారించండి",
    confirmDeletionDesc: "ఈ వినియోగదారుని సిస్టమ్ నుండి శాశ్వతంగా తొలగించాలా? ఈ చర్యను తిరిగి మార్చలేము.",
    deleteUser: "వినియోగదారుని తొలగించు",
    passwordsDoNotMatch: "పాసవర్డ్‌లు సరిపోలడం లేదు!",
    profileUpdated: "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!",
    profileUpdateFailed: "ప్రొఫైల్ వివరాలను నవీకరించడంలో విఫలమైంది. ఫీల్డ్‌లు మరియు ఇమెయిల్ ప్రత్యేకతను ధృవీకరించండి.",
    loadDetailsFailed: "ఖాతా వివరాలను లోడ్ చేయడంలో విఫలమైంది.",
    approveSuccess: "వినియోగదారు ఆమోదించబడ్డారు!",
    approveFailed: "ఆమోదం విఫలమైంది.",
    deleteSuccess: "వినియోగదారు తొలగించబడ్డారు.",
    deleteFailed: "వినియోగదారుని తొలగించడంలో విఫలమైంది.",
    accountSettings: "ఖాతా సెట్టింగులు",
    fullNameInput: "పూర్తి పేరు",
    emailInput: "ఈమెయిల్ చిరునామా",
    ageInput: "వయస్సు (సంవత్సరాలు)",
    phoneInput: "ఫోన్ నంబర్",
    passwordInput: "పాసవర్డ్",
    passwordInputHint: "(మార్చకుండా ఉంచడానికి ఖాళీగా వదిలేయండి)",
    confirmPasswordInput: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    editDetailsBtn: "వివరాలను సవరించు",
    closeBtn: "మూసివేయి",
    cancelBtn: "రద్దు చేయి",
    saveChangesBtn: "మార్పులను సేవ్ చేయి",
    enterNewPassword: "కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి",
    confirmNewPassword: "కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి"
  }
};

const AdminDashboard = () => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');
  const t = TRANSLATIONS[currentLang];

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('lang', lang);
  };

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
      const updated = await updateUserProfile(adminId, payload);
      toast.success(t.profileUpdated);
      localStorage.setItem('userEmail', updated.email);
      loadUsers();
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

  const handleApprove = (id) => {
    triggerConfirm(
      t.approveProviderTitle,
      t.approveProviderDesc,
      t.approve,
      async () => {
        try {
          await approveUser(id);
          toast.success(t.approveSuccess);
          loadUsers();
        } catch(err) { toast.error(t.approveFailed); }
      }
    );
  };

  const handleRemove = (id) => {
    triggerConfirm(
      t.confirmDeletionTitle,
      t.confirmDeletionDesc,
      t.deleteUser,
      async () => {
        try {
          await deleteUser(id);
          toast.success(t.deleteSuccess);
          loadUsers();
        } catch(err) { toast.error(t.deleteFailed); }
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
           <p style={{ color: 'var(--ink-muted)', padding: '2rem', textAlign: 'center' }}>{t.noProviders}</p>
        ) : (
           <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                 <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>{t.providerNameRole}</th>
                 <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>{t.credentials}</th>
                 <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>{t.status}</th>
                 <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>{t.actions}</th>
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
                      <div>{t.lic} {u.licenseNumber || 'None Provided'}</div>
                      {u.specialist && <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{t.specialty} {u.specialist}</div>}
                      <button onClick={() => handleViewCert(u.certificateData || u.certificatePath)} style={{ background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--ink-soft)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', marginTop: '6px', cursor: 'pointer', fontWeight: '500' }}>{t.viewCredentials}</button>
                   </td>
                   <td style={{ padding: '18px 20px' }}>
                      {u.isApproved ? (
                         <span style={{ color: 'var(--mint)', background: 'var(--mint-pale)', padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600' }}>{t.verified}</span>
                      ) : (
                         <span style={{ color: 'var(--coral)', background: '#ffedd5', padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '600' }}>{t.pendingReview}</span>
                      )}
                   </td>
                   <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!u.isApproved && (
                          <button onClick={() => handleApprove(u.id)} className="glow-button" style={{ background: 'var(--mint)', boxShadow: '0 4px 12px rgba(16,185,129,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>{t.approve}</button>
                        )}
                        <button onClick={() => handleRemove(u.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1.5px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>{t.remove}</button>
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
            <h1 className="serif-text" style={{ fontSize: '3rem', color: 'var(--ink)', marginBottom: '0.5rem', marginTop: 0 }}>{t.welcome}, {adminName || 'System Administrator'}!</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.1rem', margin: 0 }}>
              Admin Portal • Oversee clinicians, manage accounts, and verify medical licenses.
            </p>
          </div>
          {/* Header Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
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
               {t.logout}
            </button>
          </div>
        </div>

        {/* Live dynamic metrics bar */}
        <div className="stats-grid">
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.totalPatients}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{patients.length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--mint)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.activeDoctors}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{verifiedProviders.filter(u => u.role === 'DOCTOR').length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--violet)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.activePharmacists}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{verifiedProviders.filter(u => u.role === 'PHARMACIST').length}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--coral)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.pendingApprovals}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{pendingProviders.length}</div>
          </div>
        </div>
        
        <ProviderTable title={t.pendingApprovalQueue} dataset={pendingProviders} isPending={true} />
        <ProviderTable title={t.verifiedMedicalProviders} dataset={verifiedProviders} isPending={false} />

        <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)' }}>
          <h3 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--ink)' }}>{t.registeredPatients} ({patients.length})</h3>
          <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflowX: 'auto', background: 'var(--white)' }}>
            {patients.length === 0 ? (
               <p style={{ color: 'var(--ink-muted)', padding: '2rem', textAlign: 'center' }}>{t.noPatients}</p>
            ) : (
               <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                 <thead>
                   <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                     <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>{t.patientName}</th>
                     <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>{t.email}</th>
                     <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px' }}>{t.age}</th>
                     <th style={{ padding: '16px 20px', color: 'var(--ink-soft)', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>{t.actions}</th>
                   </tr>
                 </thead>
                 <tbody>
                    {patients.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '18px 20px', color: 'var(--ink)', fontWeight: '600', fontSize: '15px' }}>{u.name} <span style={{ color: 'var(--ink-muted)', fontWeight: '400', fontSize: '12px' }}>#{u.id}</span> <span style={{ color: 'var(--coral)', fontSize: '13px', marginLeft: '6px' }}>★ {u.rating?.toFixed(1) || '5.0'}</span></td>
                       <td style={{ padding: '18px 20px', color: 'var(--ink-soft)', fontSize: '14px' }}>{u.email}</td>
                       <td style={{ padding: '18px 20px', color: 'var(--ink)', fontSize: '14px' }}>{u.age || 'N/A'} {t.yearsOld}</td>
                       <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                          <button onClick={() => handleRemove(u.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1.5px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>{t.remove}</button>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.passwordInput} {isEditingSettings && t.passwordInputHint}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    disabled={!isEditingSettings} 
                    value={settingsData.password} 
                    onChange={e => setSettingsData({...settingsData, password: e.target.value})} 
                    placeholder={isEditingSettings ? t.enterNewPassword : "••••••••"} 
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
                    placeholder={isEditingSettings ? t.confirmNewPassword : "••••••••"} 
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

export default AdminDashboard;
