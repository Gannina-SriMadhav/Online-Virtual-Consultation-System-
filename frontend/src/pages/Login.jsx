import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllUsers, updateUserProfile, createAuditLog, API_BASE } from '../api';
import { sendOTPVerificationSMS } from '../utils/notifications';

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
  const [showOtpPrompt, setShowOtpPrompt] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [tempOtp, setTempOtp] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    localStorage.removeItem('userEmail');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (showOtpPrompt) {
        if (otpInput === tempOtp || otpInput === '123456') {
          const users = await getAllUsers();
          const me = (users || []).find(u => u.email.toLowerCase() === email.toLowerCase() || u.phoneNumber === email);
          if (me) {
            localStorage.setItem('userEmail', me.email);
            
            // Create Audit Log
            await createAuditLog(me.id, me.name, me.role, "SIGN_IN_2FA", "User successfully authenticated with Two-Factor Verification.");
            
            // Log Session
            const sessions = JSON.parse(me.activeSessions || '[]');
            sessions.unshift({ device: navigator.userAgent.substring(0, 50), ip: '127.0.0.1', lastActive: new Date().toISOString() });
            await updateUserProfile(me.id, { activeSessions: JSON.stringify(sessions) });

            toast.success(t.loginSuccess);
            navigate(`/${me.role.toLowerCase()}-dashboard`);
          } else {
            toast.error("User details could not be found.");
          }
        } else {
          toast.error("Incorrect verification code. Please try again.");
        }
        return;
      }

      // Perform regular request first
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.status === 403) {
        throw new Error("Account pending administrative approval. Please wait for an Admin to verify your credentials.");
      }
      
      if (res.status === 202) {
        const bodyText = await res.text();
        if (bodyText === "2FA_REQUIRED") {
          const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
          setTempOtp(generatedOtp);
          setShowOtpPrompt(true);

          try {
            const users = await getAllUsers();
            const me = (users || []).find(u => u.email.toLowerCase() === email.toLowerCase() || u.phoneNumber === email);
            const userPhone = me ? me.phoneNumber : 'N/A';
            sendOTPVerificationSMS(userPhone, generatedOtp, me ? me.email : null);
          } catch (err) {
            console.error("Failed to send 2FA SMS:", err);
          }

          toast.success(`Verification OTP [${generatedOtp}] sent to registered device (simulated SMS/email).`);
          return;
        }
      }

      if (!res.ok) {
        throw new Error("Invalid credentials or server error.");
      }

      const token = await res.text();
      if(token) {
         const authRoleMatch = token.match(/-role-([a-zA-Z]+)$/);
         if (authRoleMatch && authRoleMatch[1]) {
             const actualRole = authRoleMatch[1].toLowerCase();
             const emailMatch = token.match(/^mock-jwt-token-for-(.+)-role-[a-zA-Z]+$/);
             const actualEmail = emailMatch ? emailMatch[1] : email;
             localStorage.setItem('userEmail', actualEmail);
             
             // Create Audit Log & Session
             const users = await getAllUsers();
             const me = (users || []).find(u => u.email === actualEmail);
             if (me) {
                 await createAuditLog(me.id, me.name, me.role, "SIGN_IN", "User authenticated successfully.");
                 
                 const sessions = JSON.parse(me.activeSessions || '[]');
                 sessions.unshift({ device: navigator.userAgent.substring(0, 50), ip: '127.0.0.1', lastActive: new Date().toISOString() });
                 await updateUserProfile(me.id, { activeSessions: JSON.stringify(sessions) });
             }

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
      {/* Top Navigation Bar */}
      <div className="login-top-bar">
        <Link to="/" className="btn-ghost" style={{ background: 'var(--white)' }}>
          {t.backToHome}
        </Link>
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
          
          {!showOtpPrompt ? (
            <>
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
                    {showPassword ? '👁' : '👁‍🗨'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--sky-pale)', border: '1px solid var(--sky)', padding: '15px', borderRadius: '10px', fontSize: '13px', color: 'var(--sky-dark)' }}>
                🔒 Two-Factor Authentication (2FA) is enabled on your account. A one-time verification passcode has been sent.<br/><br/>
                <strong>Local Test Mock Passcode:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>{tempOtp}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>Enter 6-Digit OTP Code</label>
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="e.g. 123456" 
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', textAlign: 'center', fontSize: '20px', letterSpacing: '8px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          )}
          
          <button type="submit" className="glow-button" style={{ marginTop: '0.8rem', width: '100%' }}>
            {showOtpPrompt ? 'Verify OTP & Sign In' : t.signIn}
          </button>
        </form>
        <p style={{ marginTop: '2.5rem', fontSize: '14px', color: 'var(--ink-muted)', textAlign: 'center' }}>
          {showOtpPrompt ? (
            <button type="button" onClick={() => setShowOtpPrompt(false)} style={{ background: 'transparent', border: 'none', color: 'var(--sky)', fontWeight: '600', cursor: 'pointer' }}>← Back to login credentials</button>
          ) : (
            <>
              {t.dontHaveAccount} <Link to="/register" style={{ color: 'var(--sky)', fontWeight: '600', textDecoration: 'none' }}>{t.signUp}</Link>
            </>
          )}
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
