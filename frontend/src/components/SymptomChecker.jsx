import React, { useState } from 'react';

const SYMPTOM_SPECIALTIES = [
  { keywords: ['cough', 'breath', 'chest', 'asthma', 'wheeze'], specialty: 'Pulmonology', label: 'Pulmonologist' },
  { keywords: ['skin', 'rash', 'acne', 'itching', 'allergy'], specialty: 'Dermatology', label: 'Dermatologist' },
  { keywords: ['bone', 'joint', 'fracture', 'arthritis', 'knee', 'back pain'], specialty: 'Orthopedics', label: 'Orthopedic Specialist' },
  { keywords: ['heart', 'chest pain', 'bp', 'palpitation', 'cardiac'], specialty: 'Cardiology', label: 'Cardiologist' },
  { keywords: ['stress', 'anxiety', 'depression', 'insomnia', 'mood'], specialty: 'Psychiatry', label: 'Psychiatrist' },
  { keywords: ['fever', 'headache', 'cold', 'stomach', 'fatigue'], specialty: 'General Medicine', label: 'General Physician' }
];

const SymptomChecker = ({ onClose, onSelectSpecialty, currentLang = 'en' }) => {
  const [symptomsText, setSymptomsText] = useState('');
  const [duration, setDuration] = useState('1');
  const [severity, setSeverity] = useState('Mild');
  const [result, setResult] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(false);

  const TRANSLATIONS = {
    en: {
      title: "AI Symptom Checker & Specialist Finder",
      desc: "Describe your symptoms to receive potential specialty suggestions. This tool does not provide a medical diagnosis.",
      labelSymptom: "Describe symptoms (e.g. fever, headache, dry cough):",
      labelDuration: "Duration of Symptoms (Days):",
      labelSeverity: "Severity Level:",
      btnCheck: "Analyze Symptoms",
      mild: "Mild",
      moderate: "Moderate",
      severe: "Severe",
      recTitle: "Clinical Assessment Result",
      recText: "Based on symptom analysis, we suggest consulting with a:",
      btnBook: "Book Recommended Specialty",
      btnCancel: "Close"
    },
    hi: {
      title: "एआई लक्षण जांचकर्ता और विशेषज्ञ खोजक",
      desc: "संभावित विशेषताओं के सुझाव प्राप्त करने के लिए अपने लक्षणों का वर्णन करें। यह उपकरण चिकित्सा निदान प्रदान नहीं करता है।",
      labelSymptom: "लक्षणों का वर्णन करें (जैसे बुखार, सिरदर्द, सूखी खांसी):",
      labelDuration: "लक्षणों की अवधि (दिन):",
      labelSeverity: "तीव्रता स्तर:",
      btnCheck: "लक्षणों का विश्लेषण करें",
      mild: "हल्का",
      moderate: "मध्यम",
      severe: "गंभीर",
      recTitle: "नैदानिक मूल्यांकन परिणाम",
      recText: "लक्षण विश्लेषण के आधार पर, हम आपको इस विशेषज्ञ से परामर्श करने का सुझाव देते हैं:",
      btnBook: "अनुशंसित विशेषता बुक करें",
      btnCancel: "बंद करें"
    },
    te: {
      title: "AI లక్షణాల తనిఖీ & నిపుణుల గుర్తింపు",
      desc: "సంభావ్య స్పెషాలిటీ సూచనలను పొందడానికి మీ లక్షణాలను వివరించండి. ఈ సాధనం వైద్య నిర్ధారణను అందించదు.",
      labelSymptom: "లక్షణాలను వివరించండి (ఉదా. జ్వరం, తలనొప్పి, పొడి దగ్గు):",
      labelDuration: "లక్షణాల వ్యవధి (రోజులు):",
      labelSeverity: "తీవ్రత స్థాయి:",
      btnCheck: "లక్షణాలను విశ్లేషించు",
      mild: "సాధారణం",
      moderate: "మధ్యస్థం",
      severe: "తీవ్రమైనది",
      recTitle: "క్లినికల్ అసెస్‌మెంట్ ఫలితం",
      recText: "లక్షణాల విశ్లేషణ ఆధారంగా, మేము ఈ నిపుణుడిని సంప్రదించాలని సిఫార్సు చేస్తున్నాము:",
      btnBook: "సిఫార్సు చేయబడిన స్పెషాలిటీ బుక్ చేయి",
      btnCancel: "మూసివేయి"
    }
  };

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!symptomsText.trim()) return;

    const lowerText = symptomsText.toLowerCase();
    const isEmergency = lowerText.includes('chest pain') || lowerText.includes('breathing difficulty') || lowerText.includes('stroke') || lowerText.includes('difficulty breathing') || lowerText.includes('heart attack') || lowerText.includes('severe chest pain') || lowerText.includes('paralysis');

    if (isEmergency) {
      setEmergencyAlert(true);
      return;
    }

    let matched = SYMPTOM_SPECIALTIES.find(item => 
      item.keywords.some(keyword => lowerText.includes(keyword))
    );

    // Default to General Physician if no match
    if (!matched) {
      matched = { specialty: 'General Medicine', label: 'General Physician' };
    }

    setResult(matched);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110 }}>
      <div className="glass-card" style={{ padding: '2.5rem', width: '90%', maxWidth: '480px', background: 'var(--white)', border: '1.5px solid var(--border)' }}>
        <h2 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>{t.title}</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t.desc}</p>

        {emergencyAlert ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ background: '#fef2f2', border: '2px solid #ef4444', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚨</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '16px', fontWeight: '800' }}>EMERGENCY WARNING</h3>
              <p style={{ margin: '0', fontSize: '13px', color: '#7f1d1d', lineHeight: '1.5', fontWeight: '500' }}>
                Seek emergency medical care immediately. If you are experiencing chest pain, severe breathing difficulty, stroke symptoms, or a medical emergency, please call your local emergency services (e.g., 911 or 112) now. Do not wait for a virtual consultation.
              </p>
            </div>
            <button 
              onClick={() => { setEmergencyAlert(false); setResult(null); }} 
              className="btn-ghost" 
              style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
            >
              ← Back
            </button>
          </div>
        ) : !result ? (
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.labelSymptom}</label>
              <textarea 
                required 
                value={symptomsText} 
                onChange={(e) => setSymptomsText(e.target.value)} 
                placeholder="Describe how you feel..." 
                style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.labelDuration}</label>
                <input 
                  type="number" 
                  min="1" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.labelSeverity}</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: '100%' }}>
                  <option value="Mild">{t.mild}</option>
                  <option value="Moderate">{t.moderate}</option>
                  <option value="Severe">{t.severe}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem' }}>
              <button type="submit" className="glow-button" style={{ flex: 1 }}>{t.btnCheck}</button>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>{t.btnCancel}</button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ background: 'var(--sky-pale)', border: '1.5px solid var(--sky)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--sky-dark)', fontSize: '15px', fontWeight: '700' }}>{t.recTitle}</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--ink-soft)' }}>{t.recText}</p>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--ink)' }}>
                🏥 {result.label} ({result.specialty})
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => {
                  onSelectSpecialty(result.specialty);
                  onClose();
                }} 
                className="glow-button" 
                style={{ width: '100%' }}
              >
                {t.btnBook}
              </button>
              <button 
                onClick={() => setResult(null)} 
                className="btn-ghost" 
                style={{ width: '100%' }}
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;
