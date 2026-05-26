import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../api';

const TRANSLATIONS = {
  en: {
    backToHome: "← Back to Home",
    welcomeBack: "Welcome Back",
    loginSubtitle: "Log in to access your clinical dashboard",
    emailOrPhone: "Email Address or Mobile Number",
    emailOrPhonePlaceholder: "Enter email or mobile number",
    password: "Password",
    passwordPlaceholder: "Enter password",
    signIn: "Sign In",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign up",
    loginSuccess: "Successfully logged in!",
    invalidToken: "Invalid token format received.",
    invalidCredentials: "Invalid credentials! Please try again or create an account.",
    restrictedPortal: "Restricted Portal"
  },
  hi: {
    backToHome: "← होम पर वापस जाएं",
    welcomeBack: "वापसी पर स्वागत है",
    loginSubtitle: "अपने नैदानिक डैशबोर्ड तक पहुँचने के लिए लॉग इन करें",
    emailOrPhone: "ईमेल पता या मोबाइल नंबर",
    emailOrPhonePlaceholder: "ईमेल या मोबाइल नंबर दर्ज करें",
    password: "पासवर्ड",
    passwordPlaceholder: "पासवर्ड दर्ज करें",
    signIn: "साइन इन करें",
    dontHaveAccount: "खाता नहीं है?",
    signUp: "साइन अप करें",
    loginSuccess: "सफलतापूर्वक लॉग इन किया गया!",
    invalidToken: "अमान्य टोकन प्रारूप प्राप्त हुआ।",
    invalidCredentials: "अमान्य क्रेडेंशियल! कृपया पुनः प्रयास करें या खाता बनाएं।",
    restrictedPortal: "प्रतिबंधित पोर्टल"
  },
  te: {
    backToHome: "← హోమ్‌కి తిరిగి వెళ్లు",
    welcomeBack: "మళ్లీ స్వాగతం",
    loginSubtitle: "మీ క్లినికల్ డాష్‌బోర్డ్‌ను యాక్సెస్ చేయడానికి లాగిన్ చేయండి",
    emailOrPhone: "ఈమెయిల్ చిరునామా లేదా మొబైల్ సంఖ్య",
    emailOrPhonePlaceholder: "ఈమెయిల్ లేదా మొబైల్ సంఖ్యను నమోదు చేయండి",
    password: "పాస్‌వర్డ్",
    passwordPlaceholder: "పాస్‌వర్డ్‌ను నమోదు చేయండి",
    signIn: "సైన్ ఇన్ చేయి",
    dontHaveAccount: "ఖాతా లేదా?",
    signUp: "సైన్ అప్ చేయి",
    loginSuccess: "విజయవంతంగా లాగిన్ అయ్యారు!",
    invalidToken: "చెల్లని టోకెన్ ఫార్మాట్ స్వీకరించబడింది.",
    invalidCredentials: "చెల్లని ఆధారాలు! దయచేసి మళ్లీ ప్రయత్నంచండి లేదా ఖాతాను సృష్టించండి.",
    restrictedPortal: "పరిమిత పోర్టల్"
  }
};

const Login = () => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');
  const t = TRANSLATIONS[currentLang];

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('lang', lang);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await loginUser(email, password);
      if(token) {
         const authRoleMatch = token.match(/-role-([a-zA-Z]+)$/);
         if (authRoleMatch && authRoleMatch[1]) {
             const actualRole = authRoleMatch[1].toLowerCase();
             // Extract actual email from the token, since user might have typed their phone number
             const emailMatch = token.match(/^mock-jwt-token-for-(.+)-role-[a-zA-Z]+$/);
             const actualEmail = emailMatch ? emailMatch[1] : email;
             localStorage.setItem('userEmail', actualEmail);
             toast.success(t.loginSuccess);
             navigate(`/${actualRole}-dashboard`);
         } else {
             toast.error(t.invalidToken);
         }
      }
    } catch (err) {
      toast.error(err.message || t.invalidCredentials);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--surface)', padding: '20px', position: 'relative' }}>
      {/* Back Button */}
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

      <div className="glass-card" style={{ padding: '3.5rem 3rem', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2.2rem', color: 'var(--ink)', textAlign: 'center' }} className="serif-text">{t.welcomeBack}</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2.5rem' }}>{t.loginSubtitle}</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.emailOrPhone}</label>
            <input 
              type="text" 
              placeholder={t.emailOrPhonePlaceholder} 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.password}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder={t.passwordPlaceholder} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          
          <button type="submit" className="glow-button" style={{ marginTop: '0.8rem', width: '100%' }}>{t.signIn}</button>
        </form>
        <p style={{ marginTop: '2.5rem', fontSize: '14px', color: 'var(--ink-muted)', textAlign: 'center' }}>
          {t.dontHaveAccount} <Link to="/register" style={{ color: 'var(--sky)', fontWeight: '600', textDecoration: 'none' }}>{t.signUp}</Link>
        </p>
      </div>

      {/* Restricted admin backdoor access link */}
      <Link to="/admin" style={{ position: 'absolute', bottom: '15px', right: '15px', color: 'var(--ink-muted)', opacity: 0.15, textDecoration: 'none', fontSize: '0.8rem', cursor: 'pointer', zIndex: 1000 }}>
        {t.restrictedPortal}
      </Link>
    </div>
  );
};

export default Login;
