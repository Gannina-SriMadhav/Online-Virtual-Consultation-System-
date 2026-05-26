import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TRANSLATIONS = {
  en: {
    backToNetwork: "← Back to Network",
    sysAdmin: "System Administrator",
    sysAdminSubtitle: "Access root control & provider credentialing",
    adminEmail: "Admin Email",
    passcode: "Passcode",
    enterPasscode: "Enter passcode",
    authorizeOverride: "Authorize Override",
    invalidAdmin: "Invalid Admin Credentials. Access Denied."
  },
  hi: {
    backToNetwork: "← नेटवर्क पर वापस जाएं",
    sysAdmin: "सिस्टम व्यवस्थापक (Admin)",
    sysAdminSubtitle: "रूट नियंत्रण और प्रदाता क्रेडेंशियल एक्सेस करें",
    adminEmail: "एडमिन ईमेल",
    passcode: "पासकोड",
    enterPasscode: "पासकोड दर्ज करें",
    authorizeOverride: "प्राधिकरण ओवरराइड",
    invalidAdmin: "अमान्य एडमिन क्रेडेंशियल। प्रवेश वर्जित।"
  },
  te: {
    backToNetwork: "← నెట్‌వర్క్‌కి తిరిగి వెళ్లు",
    sysAdmin: "సిస్టమ్ అడ్మినిస్ట్రేటర్",
    sysAdminSubtitle: "రూట్ కంట్రోల్ & ప్రొవైడర్ క్రెడెన్షియలింగ్‌ను యాక్సెస్ చేయండి",
    adminEmail: "అడ్మిన్ ఈమెయిల్",
    passcode: "పాస్‌కోడ్",
    enterPasscode: "పాస్‌కోడ్‌ను నమోదు చేయండి",
    authorizeOverride: "అధికారాన్ని ఓవర్‌రైడ్ చేయి",
    invalidAdmin: "చెల్లని అడ్మిన్ ఆధారాలు. యాక్సెస్ నిరాకరించబడింది."
  }
};

const AdminLogin = () => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');
  const t = TRANSLATIONS[currentLang];

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('lang', lang);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if(email === 'admin@medconnect.com' && password === 'admin123') {
      localStorage.setItem('userEmail', 'admin@medconnect.com');
      navigate('/admin-dashboard');
    } else {
      alert(t.invalidAdmin);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--surface)', padding: '20px', position: 'relative' }}>
      {/* Back Button */}
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <Link to="/" className="btn btn-ghost" style={{ background: 'var(--white)' }}>
          {t.backToNetwork}
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

      <div className="glass-card" style={{ padding: '3.5rem 3rem', width: '100%', maxWidth: '420px', border: '1.5px solid var(--border)' }}>
        <div style={{ marginBottom: '1rem', fontSize: '2.5rem', textAlign: 'center' }}>🔒</div>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2.2rem', color: 'var(--ink)', textAlign: 'center' }} className="serif-text">{t.sysAdmin}</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2.5rem' }}>{t.sysAdminSubtitle}</p>
        
        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.adminEmail}</label>
            <input 
              type="email" 
              placeholder="admin@medconnect.com" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.passcode}</label>
            <input 
              type="password" 
              placeholder={t.enterPasscode} 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          
          <button type="submit" className="glow-button" style={{ marginTop: '0.8rem', width: '100%', background: 'var(--ink)', boxShadow: '0 4px 14px rgba(11,18,32,0.15)' }}>{t.authorizeOverride}</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
