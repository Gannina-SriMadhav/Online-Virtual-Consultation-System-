import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE } from '../api';

const TRANSLATIONS = {
  en: {
    backToHome: "← Back to Home",
    createAccount: "Create Account",
    registerSubtitle: "Join MedConnect's healthcare network",
    registerAsLabel: "I want to register as a:",
    patientOption: "Patient",
    doctorOption: "Doctor",
    pharmacistOption: "Pharmacist",
    fullName: "Full Name",
    age: "Age",
    emailAddress: "Email Address",
    mobileNumber: "Mobile Number",
    mobileNumberPlaceholder: "Enter mobile number",
    password: "Password",
    createPasswordPlaceholder: "Create Password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm Password",
    specialistArea: "Specialist Area",
    specialistPlaceholder: "e.g. Cardiology",
    medicalLicenseNumber: "Medical License Number",
    licenseNumberPlaceholder: "License Number",
    uploadDoctorCertificate: "Upload Doctor Certificate (PDF/Image)",
    pharmacyLicenseNumber: "Pharmacy License Number",
    uploadPharmacistCertificate: "Upload Pharmacist Certificate",
    completeRegistration: "Complete Registration",
    alreadyHaveAccount: "Already have an account?",
    loginLink: "Log In",
    passwordsDoNotMatch: "Passwords do not match!",
    registrationSuccess: "Registration successful! Please login.",
    registrationFailed: "Registration failed. Email or mobile number might be already in use.",
    backendError: "Error connecting to backend database. Make sure Spring Boot is running!"
  },
  hi: {
    backToHome: "← होम पर वापस जाएं",
    createAccount: "खाता बनाएं",
    registerSubtitle: "मेडकनेक्ट के स्वास्थ्य नेटवर्क में शामिल हों",
    registerAsLabel: "मैं इस रूप में पंजीकरण करना चाहता हूँ:",
    patientOption: "मरीज",
    doctorOption: "डॉक्टर",
    pharmacistOption: "फार्मासिस्ट",
    fullName: "पूरा नाम",
    age: "उम्र",
    emailAddress: "ईमेल पता",
    mobileNumber: "मोबाइल नंबर",
    mobileNumberPlaceholder: "मोबाइल नंबर दर्ज करें",
    password: "पासवर्ड",
    createPasswordPlaceholder: "पासवर्ड बनाएं",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "पासवर्ड की पुष्टि करें",
    specialistArea: "विशेषज्ञता क्षेत्र",
    specialistPlaceholder: "जैसे: कार्डियोलॉजी",
    medicalLicenseNumber: "चिकित्सा लाइसेंस संख्या",
    licenseNumberPlaceholder: "लाइसेंस संख्या",
    uploadDoctorCertificate: "डॉक्टर प्रमाणपत्र अपलोड करें (PDF/छवि)",
    pharmacyLicenseNumber: "फार्मेसी लाइसेंस संख्या",
    uploadPharmacistCertificate: "फार्मासिस्ट प्रमाणपत्र अपलोड करें",
    completeRegistration: "पंजीकरण पूरा करें",
    alreadyHaveAccount: "पहले से ही एक खाता है?",
    loginLink: "लॉग इन करें",
    passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते!",
    registrationSuccess: "पंजीकरण सफल! कृपया लॉगिन करें।",
    registrationFailed: "पंजीकरण विफल रहा। ईमेल या मोबाइल नंबर पहले से उपयोग में हो सकता है।",
    backendError: "बैकएंड डेटाबेस से कनेक्ट करने में त्रुटि। सुनिश्चित करें कि स्प्रिंग बूट चल रहा है!"
  },
  te: {
    backToHome: "← హోమ్‌కి తిరిగి వెళ్లు",
    createAccount: "ఖాతాను సృష్టించండి",
    registerSubtitle: "మెడ్‌కనెక్ట్ యొక్క ఆరోగ్య సంరక్షణ నెట్‌వర్క్‌లో చేరండి",
    registerAsLabel: "నేను ఇలా నమోదు చేసుకోవాలనుకుంటున్నాను:",
    patientOption: "రోగి",
    doctorOption: "వైద్యుడు",
    pharmacistOption: "ఫార్మాసిస్ట్",
    fullName: "పూర్తి పేరు",
    age: "వయస్సు",
    emailAddress: "ఈమెయిల్ చిరునామా",
    mobileNumber: "మొబైల్ సంఖ్య",
    mobileNumberPlaceholder: "మొబైల్ సంఖ్యను నమోదు చేయండి",
    password: "పాస్‌వర్డ్",
    createPasswordPlaceholder: "పాస్‌వర్డ్‌ను సృష్టించండి",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    confirmPasswordPlaceholder: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    specialistArea: "స్పెషలిస్ట్ ఏరియా",
    specialistPlaceholder: "ఉదా: కార్డియాలజీ",
    medicalLicenseNumber: "మెడికల్ లైసెన్స్ సంఖ్య",
    licenseNumberPlaceholder: "లైసెన్స్ సంఖ్య",
    uploadDoctorCertificate: "వైద్యుని సర్టిఫికేట్ అప్‌లోడ్ చేయి (PDF/చిత్రం)",
    pharmacyLicenseNumber: "ఫార్మసీ లైసెన్స్ సంఖ్య",
    uploadPharmacistCertificate: "ఫార్మాసిస్ట్ సర్టిఫికేట్ అప్‌లోడ్ చేయి",
    completeRegistration: "నమోదును పూర్తి చేయి",
    alreadyHaveAccount: "ఇప్పటికే ఖాతా ఉందా?",
    loginLink: "లాగిన్ చేయి",
    passwordsDoNotMatch: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు!",
    registrationSuccess: "నమోదు విజయవంతమైంది! దయచేసి లాగిన్ అవ్వండి.",
    registrationFailed: "నమోదు విఫలమైంది. ఈమెయిల్ లేదా మొబైల్ సంఖ్య ఇప్పటికే ఉపయోగంలో ఉండవచ్చు.",
    backendError: "బ్యాకెండ్ డేటాబేస్కు కనెక్ట్ చేయడంలో లోపం. స్ప్రింగ్ బూట్ రన్ అవుతోందని నిర్ధారించుకోండి!"
  }
};

const Register = () => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');
  const t = TRANSLATIONS[currentLang];

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('lang', lang);
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', role: 'PATIENT', 
    age: '', specialist: '', licenseNumber: '', certificateData: '', phoneNumber: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    localStorage.removeItem('userEmail');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
       toast.error(t.passwordsDoNotMatch);
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
        toast.success(t.registrationSuccess);
        navigate('/login');
      } else {
        const errMsg = await res.text();
        toast.error(errMsg || t.registrationFailed);
      }
    } catch (err) {
      console.error(err);
      toast.error(t.backendError);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--surface)', padding: '40px 20px', position: 'relative' }}>
      
      {/* Back to Home Button */}
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <Link to="/" className="btn btn-ghost" style={{ background: 'var(--white)' }}>
          {t.backToHome}
        </Link>
      </div>

      {/* Language Selector */}
      <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
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
      </div>

      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '500px', margin: '40px auto' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2.2rem', textAlign: 'center', color: 'var(--ink)' }} className="serif-text">{t.createAccount}</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2rem' }}>{t.registerSubtitle}</p>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.registerAsLabel}</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={{ width: '100%' }}
            >
              <option value="PATIENT">{t.patientOption}</option>
              <option value="DOCTOR">{t.doctorOption}</option>
              <option value="PHARMACIST">{t.pharmacistOption}</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.fullName}</label>
              <input type="text" placeholder={t.fullName} required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.age}</label>
              <input type="number" placeholder={t.age} required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.emailAddress}</label>
            <input type="email" placeholder="user@gmail.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.mobileNumber}</label>
            <input 
              type="text" 
              placeholder={t.mobileNumberPlaceholder} 
              required 
              value={formData.phoneNumber} 
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
              style={{ width: '100%' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.password}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder={t.createPasswordPlaceholder} 
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
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.confirmPassword}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder={t.confirmPasswordPlaceholder} 
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
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.specialistArea}</label>
                <input type="text" placeholder={t.specialistPlaceholder} required value={formData.specialist} onChange={(e) => setFormData({...formData, specialist: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.medicalLicenseNumber}</label>
                <input type="text" placeholder={t.licenseNumberPlaceholder} required value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.uploadDoctorCertificate}</label>
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
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.pharmacyLicenseNumber}</label>
                <input type="text" placeholder={t.licenseNumberPlaceholder} required value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.uploadPharmacistCertificate}</label>
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
          
          <button type="submit" className="glow-button" style={{ marginTop: '1rem', width: '100%' }}>{t.completeRegistration}</button>
        </form>
        <p style={{ marginTop: '2rem', fontSize: '14px', color: 'var(--ink-muted)', textAlign: 'center' }}>
          {t.alreadyHaveAccount} <Link to="/login" style={{ color: 'var(--sky)', fontWeight: '600', textDecoration: 'none' }}>{t.loginLink}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
