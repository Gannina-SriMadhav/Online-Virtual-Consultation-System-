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

const TRANSLATIONS = {
  en: {
    portals: "Portals",
    howItWorks: "How it works",
    habitsTracker: "Habits Tracker",
    features: "Features",
    login: "Log in",
    register: "Get started free",
    heroBadge: "Virtual-first healthcare, now live",
    heroTitle: "Healthcare that comes to you, anywhere",
    heroDesc: "Book virtual consultations, receive e-prescriptions, access lab reports, and manage your complete medical journey, all in one secure platform for patients, doctors, pharmacists, and admins.",
    heroCtaBook: "Book a consultation →",
    heroCtaSee: "See how it works",
    activePatients: "Active Patients",
    licensedDoctors: "Licensed Doctors",
    satisfactionRate: "Satisfaction Rate",
    todayConsultations: "Today's consultations",
    liveNow: "Live now",
    upNext: "Up next",
    patientVitals: "Patient vitals",
    bloodPressure: "Blood pressure",
    heartRate: "Heart rate",
    rxSent: "E-Prescription sent",
    hdCall: "HD Video call",
    encrypted: "End-to-end encrypted",
    portalsTitle: "Built for everyone in healthcare",
    portalsSub: "Three powerful, dedicated portals — each designed around the specific needs and workflows of every stakeholder.",
    patientPortal: "Patient Portal",
    doctorPortal: "Doctor Portal",
    pharmacistPortal: "Pharmacist Portal",
    patientFeatures: [
      "Book & manage video/chat appointments",
      "Receive and download e-prescriptions",
      "Access lab reports & medical history",
      "Real-time prescription tracking",
      "Symptom checker before consultation",
      "Secure in-app messaging with doctor",
      "Insurance & billing management",
      "Medication reminders & refills"
    ],
    doctorFeatures: [
      "HD video consultations with patients",
      "Issue digital e-prescriptions (signed)",
      "View complete patient medical history",
      "Order lab tests & view results",
      "Set availability & manage schedule",
      "Digital SOAP notes & clinical records",
      "Refer patients to specialists",
      "Earnings dashboard & analytics"
    ],
    pharmacistFeatures: [
      "Receive & verify e-prescriptions",
      "Manage drug inventory & stock alerts",
      "Process & track medication orders",
      "Drug interaction & allergy checking",
      "Counsel patients on medication use",
      "Approve refill requests",
      "Dispense & log controlled substances"
    ],
    journeyTitle: "From symptom to prescription in minutes",
    journeyTag: "Patient journey",
    step1Title: "Register & describe",
    step1Desc: "Create your account, fill in your health profile, and describe your symptoms using our guided checker.",
    step2Title: "Choose a doctor",
    step2Desc: "Browse specialists by speciality, rating, language, and next available slot. Book instantly.",
    step3Title: "Virtual consultation",
    step3Desc: "Join an encrypted HD video call. Doctor reviews your history, vitals, and lab results in real-time.",
    step4Title: "Prescription & follow-up",
    step4Desc: "Receive a signed e-prescription, track your medication, and schedule follow-ups in one tap.",
    trackerTag: "Live Demo Simulator",
    trackerTitle: "Track Your Healthy Habits, Live",
    trackerDesc: "Experience our interactive wellness tracker. Log your water intake, update your steps, and record active exercise minutes to see your daily health score calculate in real-time.",
    hydration: "Hydration",
    steps: "Daily Steps",
    activeTime: "Active Time",
    resetSimulator: "Reset simulator stats",
    overallScore: "Overall Score",
    dayProgress: "Day Progress",
    habitMsg1: "Start moving to hit your goals!",
    habitMsg2: "You're doing great! Keep going.",
    habitMsg3: "Almost there! Incredible effort.",
    habitMsg4: "Perfect Day! Health goals accomplished! 🏆",
    featuresTag: "Platform features",
    featuresTitle: "Everything healthcare needs, digitized",
    feat1Title: "HIPAA-grade security",
    feat1Desc: "End-to-end encryption, role-based access control, and complete audit trails for all clinical data.",
    feat2Title: "HD video consultations",
    feat2Desc: "WebRTC-powered video calls with screen sharing, call toggles, and low connectivity adaptation.",
    feat3Title: "Digital e-prescriptions",
    feat3Desc: "Digitally signed prescriptions with security codes, sent directly to pharmacists in real-time.",
    feat4Title: "Lab integration",
    feat4Desc: "Doctors order tests digitally; results flow back automatically to patient medical histories.",
    feat5Title: "Unified medical records",
    feat5Desc: "Complete longitudinal health records including clinical diagnoses, SOAP notes, and treatment histories.",
    feat6Title: "Payments & billing",
    feat6Desc: "Stripe-powered payments with invoice generation and billing logs for every consultation.",
    feat7Title: "Smart notifications",
    feat7Desc: "Automated alerts for appointments, new records, and prescription fulfillments in real-time.",
    feat8Title: "AI symptom checker",
    feat8Desc: "Pre-consultation triage collects symptoms and recommends specialists, speeding up clinical pathways.",
    feat9Title: "Analytics dashboards",
    feat9Desc: "Rich dashboards for admins, doctors, and pharmacists with consultation volumes and user tracking.",
    ctaTitle: "Start your virtual consultation today",
    ctaDesc: "MediLink is fully open-source, HIPAA compliant, and deployment ready. Create a profile or log in to launch your medical room.",
    ctaRegister: "Get started free →",
    ctaLogin: "Access Portals",
    privacyPolicy: "Privacy policy",
    termsOfService: "Terms of service",
    hipaaCompliance: "HIPAA Compliance",
    systemStatus: "System status: Online",
    systemStatusToast: "System Status: Online 🟢 All clinical servers operational.",
    copyright: "© 2026 MedLink with Madhav",
    aiWelcome: "Hello! I am your MediLink Guide AI. 🤖 I'm here to help you understand all aspects of the platform. Ask me anything or select a topic below!",
    aiChipReport: "🧑‍⚕️ Report Sharing",
    aiChipRx: "💊 Legit Prescriptions",
    aiChipDoc: "🩺 Doctor Verification",
    aiChipSecurity: "🔒 HIPAA & Security"
  },
  hi: {
    portals: "पोर्टल",
    howItWorks: "यह कैसे काम करता है",
    habitsTracker: "आदतों का ट्रैकर",
    features: "विशेषताएं",
    login: "लॉग इन करें",
    register: "मुफ्त में शुरू करें",
    heroBadge: "वर्चुअल-फर्स्ट स्वास्थ्य सेवा, अब लाइव है",
    heroTitle: "स्वास्थ्य सेवा जो सीधे आपके पास आती है, कहीं भी",
    heroDesc: "वर्चुअल परामर्श बुक करें, ई-प्रिस्क्रिप्शन प्राप्त करें, लैब रिपोर्ट देखें और अपनी संपूर्ण चिकित्सा यात्रा प्रबंधित करें। मरीजों, डॉक्टरों, फार्मासिस्टों और एडमिन के लिए एक सुरक्षित मंच।",
    heroCtaBook: "परामर्श बुक करें →",
    heroCtaSee: "देखें यह कैसे काम करता है",
    activePatients: "सक्रिय मरीज",
    licensedDoctors: "लाइसेंस प्राप्त डॉक्टर",
    satisfactionRate: "संतुष्टि दर",
    todayConsultations: "आज के परामर्श",
    liveNow: "अभी लाइव",
    upNext: "आगे अगला",
    patientVitals: "मरीज के वाइटल्स",
    bloodPressure: "रक्तचाप (BP)",
    heartRate: "दिल की धड़कन",
    rxSent: "ई-प्रिस्क्रिप्शन भेजा गया",
    hdCall: "एचडी वीडियो कॉल",
    encrypted: "शुरुआत से अंत तक एन्क्रिप्टेड",
    portalsTitle: "स्वास्थ्य सेवा में सभी के लिए निर्मित",
    portalsSub: "तीन शक्तिशाली, समर्पित पोर्टल — प्रत्येक हितधारक की विशिष्ट आवश्यकताओं और कार्यप्रवाह के लिए डिज़ाइन किया गया।",
    patientPortal: "मरीज पोर्टल",
    doctorPortal: "डॉक्टर पोर्टल",
    pharmacistPortal: "फार्मासिस्ट पोर्टल",
    patientFeatures: [
      "वीडियो/चैट अपॉइंटमेंट बुक और प्रबंधित करें",
      "ई-प्रिस्क्रिप्शन प्राप्त करें और डाउनलोड करें",
      "लैब रिपोर्ट और चिकित्सा इतिहास तक पहुँचें",
      "वास्तविक समय नुस्खा ट्रैकिंग",
      "परामर्श से पहले लक्षण चेकर",
      "डॉक्टर के साथ सुरक्षित इन-ऐप संदेश",
      "बीमा और बिलिंग प्रबंधन",
      "दवा अनुस्मारक और रिफिल"
    ],
    doctorFeatures: [
      "मरीजों के साथ एचडी वीडियो परामर्श",
      "डिजिटल ई-प्रिस्क्रिप्शन जारी करें (हस्ताक्षरित)",
      "मरीज का संपूर्ण चिकित्सा इतिहास देखें",
      "लैब टेस्ट ऑर्डर करें और परिणाम देखें",
      "उपलब्धता सेट करें और शेड्यूल प्रबंधित करें",
      "डिजिटल SOAP नोट्स और क्लिनिकल रिकॉर्ड",
      "मरीजों को विशेषज्ञों के पास रेफर करें",
      "कमाई डैशबोर्ड और विश्लेषिकी"
    ],
    pharmacistFeatures: [
      "ई-प्रिस्क्रिप्शन प्राप्त करें और सत्यापित करें",
      "दवा सूची और स्टॉक अलर्ट प्रबंधित करें",
      "दवा के आदेशों को संसाधित और ट्रैक करें",
      "दवा परस्पर क्रिया और एलर्जी की जाँच",
      "मरीजों को दवा के उपयोग पर सलाह दें",
      "रिफिल अनुरोधों को स्वीकृत करें",
      "नियंत्रित पदार्थों का वितरण और लॉगिंग"
    ],
    journeyTitle: "मिनटों में लक्षणों से लेकर प्रिस्क्रिप्शन तक",
    journeyTag: "मरीज की यात्रा",
    step1Title: "पंजीकरण और विवरण",
    step1Desc: "अपना खाता बनाएं, अपना स्वास्थ्य प्रोफाइल भरें, और हमारे निर्देशित चेकर का उपयोग करके अपने लक्षणों का वर्णन करें।",
    step2Title: "डॉक्टर चुनें",
    step2Desc: "विशेषता, रेटिंग, भाषा और अगले उपलब्ध स्लॉट के आधार पर विशेषज्ञों को खोजें। तुरंत बुक करें।",
    step3Title: "वर्चुअल परामर्श",
    step3Desc: "एक एन्क्रिप्टेड एचडी वीडियो कॉल में शामिल हों। डॉक्टर वास्तविक समय में आपके इतिहास, वाइटल्स और लैब परिणामों की समीक्षा करते हैं।",
    step4Title: "प्रिस्क्रिप्शन और फॉलो-अप",
    step4Desc: "एक हस्ताक्षरित ई-प्रिस्क्रिप्शन प्राप्त करें, अपनी दवा को ट्रैक करें, और एक टैप में फॉलो-अप शेड्यूल करें।",
    trackerTag: "लाइव डेमो सिम्युलेटर",
    trackerTitle: "अपनी स्वस्थ आदतों को ट्रैक करें, लाइव",
    trackerDesc: "हमारे इंटरैक्टिव वेलनेस ट्रैकर का अनुभव करें। अपने पानी के सेवन को लॉग करें, अपने कदमों को अपडेट करें, और वास्तविक समय में अपने दैनिक स्वास्थ्य स्कोर की गणना देखने के लिए व्यायाम के मिनटों को रिकॉर्ड करें।",
    hydration: "पानी का सेवन",
    steps: "दैनिक कदम",
    activeTime: "सक्रिय समय",
    resetSimulator: "सिम्युलेटर आंकड़े रीसेट करें",
    overallScore: "कुल स्कोर",
    dayProgress: "दिन की प्रगति",
    habitMsg1: "अपने लक्ष्यों को प्राप्त करने के लिए चलना शुरू करें!",
    habitMsg2: "आप बहुत अच्छा कर रहे हैं! आगे बढ़ते रहें।",
    habitMsg3: "बस पहुँचने ही वाले हैं! अद्भुत प्रयास।",
    habitMsg4: "शानदार दिन! स्वास्थ्य लक्ष्य पूरे हुए! 🏆",
    featuresTag: "मंच की विशेषताएं",
    featuresTitle: "स्वास्थ्य सेवा की हर जरूरत, डिजिटल रूप में",
    feat1Title: "HIPAA-ग्रेड सुरक्षा",
    feat1Desc: "सभी क्लिनिकल डेटा के लिए एंड-टू-एंड एन्क्रिप्शन, भूमिका-आधारित पहुंच नियंत्रण और पूर्ण ऑडिट ट्रेल्स।",
    feat2Title: "एचडी वीडियो परामर्श",
    feat2Desc: "स्क्रीन शेयरिंग, कॉल टॉगल और कम कनेक्टिविटी अनुकूलन के साथ वेबआरटीसी-संचालित वीडियो कॉल।",
    feat3Title: "डिजिटल ई-प्रिस्क्रिप्शन",
    feat3Desc: "सुरक्षा कोड के साथ डिजिटल रूप से हस्ताक्षरित नुस्खे, वास्तविक समय में सीधे फार्मासिस्टों को भेजे जाते हैं।",
    feat4Title: "लैब एकीकरण",
    feat4Desc: "डॉक्टर डिजिटल रूप से टेस्ट का आदेश देते हैं; परिणाम स्वचालित रूप से मरीज के चिकित्सा इतिहास में आ जाते हैं।",
    feat5Title: "एकीकृत चिकित्सा रिकॉर्ड",
    feat5Desc: "नैदानिक निदान, SOAP नोट्स और उपचार इतिहास सहित संपूर्ण अनुदैर्ध्य स्वास्थ्य रिकॉर्ड।",
    feat6Title: "भुगतान और बिलिंग",
    feat6Desc: "प्रत्येक परामर्श के लिए चालान निर्माण और बिलिंग लॉग के साथ स्ट्राइप-संचालित भुगतान।",
    feat7Title: "स्मार्ट सूचनाएं",
    feat7Desc: "वास्तविक समय में नियुक्तियों, नए रिकॉर्ड और नुस्खे की पूर्ति के लिए स्वचालित अलर्ट।",
    feat8Title: "एआई लक्षण चेकर",
    feat8Desc: "पूर्व-परामर्श ट्राइएज लक्षणों को एकत्र करता है और विशेषज्ञों की सिफारिश करता है, जिससे नैदानिक रास्ते तेज हो जाते हैं।",
    feat9Title: "विश्लेषिकी डैशबोर्ड",
    feat9Desc: "परामर्श मात्रा और उपयोगकर्ता ट्रैकिंग के साथ एडमिन, डॉक्टरों और फार्मासिस्टों के लिए समृद्ध डैशबोर्ड।",
    ctaTitle: "आज ही अपना वर्चुअल परामर्श शुरू करें",
    ctaDesc: "MediLink पूरी तरह से ओपन-सोर्स, HIPAA आज्ञाकारी और परिनियोजन के लिए तैयार है। अपना मेडिकल रूम शुरू करने के लिए एक प्रोफाइल बनाएं या लॉग इन करें।",
    ctaRegister: "मुफ्त में शुरू करें →",
    ctaLogin: "पोर्टल तक पहुंचें",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
    hipaaCompliance: "HIPAA अनुपालन",
    systemStatus: "सिस्टम स्थिति: ऑनलाइन",
    systemStatusToast: "सिस्टम स्थिति: ऑनलाइन 🟢 सभी नैदानिक सर्वर चालू हैं।",
    copyright: "© 2026 MedLink माघव के साथ",
    aiWelcome: "नमस्ते! मैं आपका मेडिलिंक गाइड एआई हूँ। 🤖 मैं यहाँ आपको मंच के सभी पहलुओं को समझने में मदद करने के लिए हूँ। मुझसे कुछ भी पूछें या नीचे एक विषय चुनें!",
    aiChipReport: "🧑‍⚕️ रिपोर्ट शेयरिंग",
    aiChipRx: "💊 वैध नुस्खे",
    aiChipDoc: "🩺 डॉक्टर सत्यापन",
    aiChipSecurity: "🔒 HIPAA और सुरक्षा"
  },
  te: {
    portals: "పోర్టల్స్",
    howItWorks: "ఇది ఎలా పనిచేస్తుంది",
    habitsTracker: "ఆరోగ్య ట్రాకర్",
    features: "ఫీచర్లు",
    login: "లాగిన్ అవ్వండి",
    register: "ఉచితంగా ప్రారంభించండి",
    heroBadge: "వర్చువల్-ఫస్ట్ హెల్త్‌కేర్, ఇప్పుడు లైవ్ లో ఉంది",
    heroTitle: "హెల్త్‌కేర్ సేవలు నేరుగా మీ వద్దకే, ఎక్కడైనా",
    heroDesc: "వర్చువల్ సంప్రదింపులను బుక్ చేసుకోండి, ఈ-ప్రిస్క్రిప్షన్లను పొందండి, ల్యాబ్ నివేదికలను యాక్సెస్ చేయండి మరియు మీ పూర్తి వైద్య ప్రయాణాన్ని నిర్వహించండి. రోగులు, వైద్యులు, ఫార్మాసిస్టులు మరియు అడ్మిన్ల కోసం ఒక సురక్షితమైన వేదిక.",
    heroCtaBook: "సంప్రదింపు బుక్ చేయండి →",
    heroCtaSee: "ఇది ఎలా పనిచేస్తుందో చూడండి",
    activePatients: "యాక్టివ్ రోగులు",
    licensedDoctors: "లైసెన్స్ పొందిన వైద్యులు",
    satisfactionRate: "సంతృప్తి రేటు",
    todayConsultations: "ఈరోజు సంప్రదింపులు",
    liveNow: "ప్రస్తుతం లైవ్ లో ఉంది",
    upNext: "తదుపరిది",
    patientVitals: "రోగి వైటల్స్",
    bloodPressure: "రక్తపోటు (BP)",
    heartRate: "గుండె వేగం",
    rxSent: "ఈ-ప్రిస్క్రిప్షన్ పంపబడింది",
    hdCall: "హెచ్‌డీ వీడియో కాల్",
    encrypted: "ఎండ్-టు-ఎండ్ ఎన్‌క్రిప్ట్ చేయబడింది",
    portalsTitle: "హెల్త్‌కేర్ లో అందరి కోసం నిర్మించబడింది",
    portalsSub: "మూడు శక్తివంతమైన, ప్రత్యేక పోర్టల్స్ — ప్రతి భాగస్వామి యొక్క నిర్దిష్ట అవసరాలు మరియు పని విధానాల కోసం రూపొందించబడింది.",
    patientPortal: "రోగి పోర్టల్",
    doctorPortal: "వైద్యుల పోర్టల్",
    pharmacistPortal: "ఫార్మాసిస్ట్ పోర్టల్",
    patientFeatures: [
      "వీడియో/చాట్ అపాయింట్‌మెంట్‌లను బుక్ చేయండి & నిర్వహించండి",
      "ఈ-ప్రిస్క్రిప్షన్‌లను పొందండి మరియు డౌన్‌లోడ్ చేయండి",
      "ల్యాబ్ నివేదికలు & వైద్య చరిత్రను యాక్సెస్ చేయండి",
      "నిజ సమయ ప్రిస్క్రిప్షన్ ట్రాకింగ్",
      "సంప్రదింపుకు ముందు లక్షణాల తనిఖీ",
      "వైద్యుడితో సురక్షితమైన ఇన్-యాప్ సందేశం",
      "భీమా & బిల్లింగ్ నిర్వహణ",
      "మందుల రిమైండర్‌లు & రీఫిల్‌లు"
    ],
    doctorFeatures: [
      "రోగులతో హెచ్‌డీ వీడియో సంప్రదింపులు",
      "డిజిటల్ ఈ-ప్రిస్క్రిప్షన్‌లను జారీ చేయండి (సంతకం చేసినవి)",
      "రోగి పూర్తి వైద్య చరిత్రను వీక్షించండి",
      "ల్యాబ్ పరీక్షలను ఆదేశించండి & ఫలితాలను చూడండి",
      "అందుబాటు సమయాన్ని సెట్ చేయండి & షెడ్యూల్‌ను నిర్వహించండి",
      "డిజిటల్ SOAP నోట్స్ & క్లినికల్ రికార్డులు",
      "రోగులను నిపుణులకు రిఫర్ చేయండి",
      "ఆదాయాల డ్యాష్‌బోర్డ్ & అనలిటిక్స్"
    ],
    pharmacistFeatures: [
      "ఈ-ప్రిస్క్రిప్షన్‌లను స్వీకరించండి & ధృవీకరించండి",
      "ఔషధాల ఇన్వెంటరీ & స్టాక్ హెచ్చరికలను నిర్వహించండి",
      "మందుల ఆర్డర్‌లను ప్రాసెస్ చేయండి & ట్రాక్ చేయండి",
      "ఔషధ పరస్పర చర్యలు & అలర్జీల తనిఖీ",
      "మందుల వాడకంపై రోగులకు సలహా ఇవ్వండి",
      "రీఫిల్ అభ్యర్థనలను ఆమోదించండి",
      "నియంత్రిత ఔషధాలను పంపిణీ చేయండి & నమోదు చేయండి"
    ],
    journeyTitle: "కేవలం నిమిషాల్లోనే లక్షణాల నుండి ప్రిస్క్రిప్షన్ వరకు",
    journeyTag: "రోగి ప్రయాణం",
    step1Title: "నమోదు మరియు వివరణ",
    step1Desc: "మీ ఖాతాను సృష్టించండి, మీ ఆరోగ్య ప్రొఫైల్‌ను నింపండి మరియు మా గైడెడ్ సిస్టమ్ ఉపయోగించి మీ లక్షణాలను వివరించండి.",
    step2Title: "వైద్యుడిని ఎంచుకోండి",
    step2Desc: "విభాగం, రేటింగ్, భాష మరియు తదుపరి అందుబాటులో ఉన్న స్లాట్ ఆధారంగా నిపుణులను బ్రౌజ్ చేయండి. తక్షణమే బుక్ చేయండి.",
    step3Title: "వర్చువల్ సంప్రదింపులు",
    step3Desc: "ఎన్‌క్రిప్ట్ చేయబడిన హెచ్‌డీ వీడియో కాల్‌లో చేరండి. వైద్యుడు నిజ సమయంలో మీ చరిత్ర, వైటల్స్ మరియు ల్యాబ్ ఫలితాలను సమీక్షిస్తారు.",
    step4Title: "ప్రిస్క్రిప్షన్ & ఫాలో-అప్",
    step4Desc: "సంతకం చేసిన ఈ-ప్రిస్క్రిప్షన్ పొందండి, మీ మందులను ట్రాక్ చేయండి మరియు ఒక్క క్లిక్ తో తదుపరి అపాయింట్‌మెంట్ షెడ్యూల్ చేయండి.",
    trackerTag: "లైవ్ డెమో సిమ్యులేటర్",
    trackerTitle: "మీ ఆరోగ్యకరమైన అలవాట్లను ట్రాక్ చేయండి, లైవ్",
    trackerDesc: "మా ఇంటరాక్టివ్ వెల్నెస్ ట్రాకర్‌ను అనుభవించండి. మీ నీటి వినియోగాన్ని నమోదు చేయండి, మీ అడుగులను అప్‌డేట్ చేయండి మరియు మీ రోజువారీ ఆరోగ్య స్కోరును నిజ సమయంలో చూడటానికి వ్యాయామ సమయాన్ని రికార్డ్ చేయండి.",
    hydration: "హైడ్రేషన్",
    steps: "రోజువారీ అడుగులు",
    activeTime: "యాక్టివ్ సమయం",
    resetSimulator: "సిమ్యులేటర్ రీసెట్ చేయండి",
    overallScore: "మొత్తం స్కోరు",
    dayProgress: "రోజు పురోగతి",
    habitMsg1: "మీ లక్ష్యాలను చేరుకోవడానికి నడవడం ప్రారంభించండి!",
    habitMsg2: "మీరు చాలా బాగా చేస్తున్నారు! ఇలాగే కొనసాగించండి.",
    habitMsg3: "దాదాపు చేరుకున్నారు! అద్భుతమైన కృషి.",
    habitMsg4: "అద్భుతమైన రోజు! ఆరోగ్య లక్ష్యాలు పూర్తయ్యాయి! 🏆",
    featuresTag: "వేదిక ఫీచర్లు",
    featuresTitle: "ఆరోగ్య సంరక్షణకు అవసరమైన ప్రతిదీ, డిజిటల్‌గా",
    feat1Title: "HIPAA-స్థాయి భద్రత",
    feat1Desc: "అన్ని క్లినికల్ డేటా కోసం ఎండ్-టు-ఎండ్ ఎన్‌క్రిప్షన్, పాత్రల ఆధారిత యాక్సెస్ మరియు పూర్తి ఆడిట్ వివరాలు.",
    feat2Title: "హెచ్‌డీ వీడియో సంప్రదింపులు",
    feat2Desc: "స్క్రీన్ షేరింగ్, కాల్ ఆన్/ఆఫ్ మరియు తక్కువ ఇంటర్నెట్ వేగానికి అనుకూలంగా పనిచేసే వెబ్‌ఆర్‌టీసీ వీడియో కాల్స్.",
    feat3Title: "డిజిటల్ ఈ-ప్రిస్క్రిప్షన్లు",
    feat3Desc: "భద్రతా కోడ్‌లతో కూడిన డిజిటల్ సంతకం చేసిన ప్రిస్క్రిప్షన్లు, నిజ సమయంలో నేరుగా ఫార్మాసిస్టులకు పంపబడతాయి.",
    feat4Title: "ల్యాబ్ అనుసంధానం",
    feat4Desc: "వైద్యులు డిజిటల్‌గా పరీక్షలను ఆదేశిస్తారు; ఫలితాలు స్వయంచాలకంగా రోగి వైద్య చరిత్రకు చేరతాయి.",
    feat5Title: "ఏకీకృత వైద్య రికార్డులు",
    feat5Desc: "క్లినికల్ నిర్ధారణలు, SOAP నోట్స్ మరియు చికిత్స చరిత్రలతో కూడిన పూర్తి వైద్య రికార్డులు.",
    feat6Title: "చెల్లింపులు & బిల్లింగ్",
    feat6Desc: "ప్రతి సంప్రదింపుకు ఇన్‌వాయిస్ జనరేషన్ మరియు బిల్లింగ్ లాగ్‌లతో స్ట్రైప్-ఆధారిత చెల్లింపులు.",
    feat7Title: "స్మార్ట్ నోటిఫికేషన్లు",
    feat7Desc: "నియమకాలు, కొత్త రికార్డులు మరియు ప్రిస్క్రిప్షన్ల అమలు కోసం నిజ సమయంలో స్వయంచాలక హెచ్చరికలు.",
    feat8Title: "AI లక్షణాల చెకర్",
    feat8Desc: "సంప్రదింపుకు ముందే లక్షణాలను సేకరించి, నిపుణులను సిఫార్సు చేస్తుంది, తద్వారా వైద్య చికిత్స ప్రక్రియ వేగవంతమవుతుంది.",
    feat9Title: "అనలిటిక్స్ డ్యాష్‌బోర్డ్‌లు",
    feat9Desc: "సంప్రదింపుల పరిమాణం మరియు వినియోగదారుల ట్రాకింగ్‌తో అడ్మిన్‌లు, వైద్యులు మరియు ఫార్మాసిస్ట్‌ల కోసం రిచ్ డ్యాష్‌బోర్డ్‌లు.",
    ctaTitle: "ఈరోజే మీ వర్చువల్ సంప్రదింపులను ప్రారంభించండి",
    ctaDesc: "MediLink పూర్తిగా ఓపెన్-సోర్స్, HIPAA నిబంధనలకు కట్టుబడి ఉంటుంది మరియు వినియోగానికి సిద్ధంగా ఉంది. మీ వైద్య గదిని ప్రారంభించడానికి ప్రొఫైల్‌ను సృష్టించండి లేదా లాగిన్ అవ్వండి.",
    ctaRegister: "ఉచితంగా ప్రారంభించండి →",
    ctaLogin: "పోర్టల్స్ యాక్సెస్ చేయండి",
    privacyPolicy: "గోప్యతా విధానం",
    termsOfService: "సేవా నిబంధనలు",
    hipaaCompliance: "HIPAA సమ్మతి",
    systemStatus: "సిస్టమ్ స్థితి: ఆన్‌లైన్",
    systemStatusToast: "సిస్టమ్ స్థితి: ఆన్‌లైన్ 🟢 అన్ని క్లినికల్ సర్వర్లు పనిచేస్తున్నాయి.",
    copyright: "© 2026 మాధవ్‌తో కూడిన మెడ్‌లింక్",
    aiWelcome: "నమస్కారం! నేను మీ మెడ్‌లింక్ గైడ్ AI. 🤖 ప్లాట్‌ఫారమ్‌కు సంబంధించిన అన్ని అంశాలను అర్థం చేసుకోవడంలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. నన్ను ఏదైనా అడగండి లేదా దిగువన ఒక అంశాన్ని ఎంచుకోండి!",
    aiChipReport: "🧑‍⚕️ రిపోర్ట్ షేరింగ్",
    aiChipRx: "💊 నిజమైన ప్రిస్క్రిప్షన్లు",
    aiChipDoc: "🩺 వైద్యుల ధృవీకరణ",
    aiChipSecurity: "🔒 HIPAA & భద్రత"
  }
};

/*
  te: {
    portals: "పోర్టల్స్",
    howItWorks: "ఇది ఎలా పనిచేస్తుంది",
    habitsTracker: "ఆరోగ్య ట్రాకర్",
    features: "ఫీచర్లు",
    login: "లాగిన్ అవ్వండి",
    register: "ఉచితంగా ప్రారంభించండి",
    heroBadge: "వర్చువల్-ఫస్ట్ హెల్త్‌కేర్, ఇప్పుడు లైవ్ లో ఉంది",
    heroTitle: "హెల్త్‌కేర్ సేవలు నేరుగా మీ వద్దకే, ఎక్కడైనా",
    heroDesc: "వర్చువల్ సంప్రదింపులను బుక్ చేసుకోండి, ఈ-ప్రిస్క్రిప్షన్లను పొందండి, ల్యాబ్ నివేదికలను యాక్సెస్ చేయండి మరియు మీ పూర్తి వైద్య ప్రయాణాన్ని నిర్వహించండి. రోగులు, వైద్యులు, ఫార్మాసిస్టులు మరియు అడ్మిన్ల కోసం ఒక సురక్షితమైన వేదిక.",
    heroCtaBook: "సంప్రదింపు బుక్ చేయండి →",
    heroCtaSee: "ఇది ఎలా పనిచేస్తుందో చూడండి",
    activePatients: "యాక్టివ్ రోగులు",
    licensedDoctors: "లైసెన్స్ పొందిన వైద్యులు",
    satisfactionRate: "సంతృప్తి రేటు",
    todayConsultations: "ఈరోజు సంప్రదింపులు",
    liveNow: "ప్రస్తుతం లైవ్ లో ఉంది",
    upNext: "తదుపరిది",
    patientVitals: "రోగి వైటల్స్",
    bloodPressure: "రक्तపోటు (BP)",
    heartRate: "గుండె వేగం",
    rxSent: "ఈ-ప్రిస్క్రిప్షన్ పంపబడింది",
    hdCall: "హెచ్‌డీ వీడియో కాల్",
    encrypted: "ఎండ్-టు-ఎండ్ ఎన్‌క్రిప్ట్ చేయబడింది",
    portalsTitle: "హెల్త్‌కేర్ లో అందరి కోసం నిర్మించబడింది",
    portalsSub: "మూడు శక్తివంతమైన, ప్రత్యేక పోర్టల్స్ — ప్రతి భాగస్వామి యొక్క నిర్దిష్ట అవసరాలు మరియు పని విధానాల కోసం రూపొందించబడింది.",
    patientPortal: "రోగి పోర్టల్",
    doctorPortal: "వైద్యుల పోర్టల్",
    pharmacistPortal: "ఫార్మాసిస్ట్ పోర్టల్",
    journeyTitle: "కేవలం నిమిషాల్లోనే లక్షణాల నుండి ప్రిస్క్రిప్షన్ వరకు",
    journeyTag: "రోగి ప్రయాణం",
    step1Title: "నమోదు మరియు వివరణ",
    step1Desc: "మీ ఖాతాను సృష్టించండి, మీ ఆరోగ్య ప్రొఫైల్‌ను నింపండి మరియు మా గైడెడ్ సిస్టమ్ ఉపయోగించి మీ లక్షణాలను వివరించండి.",
    step2Title: "వైద్యుడిని ఎంచుకోండి",
    step2Desc: "విభాగం, రేటింగ్, భాష మరియు తదుపరి అందుబాటులో ఉన్న స్లాట్ ఆధారంగా నిపుణులను బ్రౌజ్ చేయండి. తక్షణమే బుక్ చేయండి.",
    step3Title: "వర్చువల్ సంప్రదింపులు",
    step3Desc: "ఎన్‌క్రిప్ట్ చేయబడిన హెచ్‌డీ వీడియో కాల్‌లో చేరండి. వైద్యుడు నిజ సమయంలో మీ చరిత్ర, వైటల్స్ మరియు ల్యాబ్ ఫలితాలను సమీక్షిస్తారు.",
    step4Title: "ప్రిస్క్రిప్షన్ & ఫాలో-అప్",
    step4Desc: "సంతకం చేసిన ఈ-ప్రిస్క్రిప్షన్ పొందండి, మీ మందులను ట్రాక్ చేయండి మరియు ఒక్క క్లిక్ తో తదుపరి అపాయింట్‌మెంట్ షెడ్యూల్ చేయండి.",
    trackerTag: "లైవ్ డెమో సిమ్యులేటర్",
    trackerTitle: "మీ ఆరోగ్యకరమైన అలవాట్లను ట్రాక్ చేయండి, లైవ్",
    trackerDesc: "మా ఇంటరాక్టివ్ వెల్నెస్ ట్రాకర్‌ను అనుభవించండి. మీ నీటి వినియోగాన్ని నమోదు చేయండి, మీ అడుగులను అప్‌డేట్ చేయండి మరియు మీ రోజువారీ ఆరోగ్య స్కోరును నిజ సమయంలో చూడటానికి వ్యాయామ సమయాన్ని రికార్డ్ చేయండి.",
    hydration: "హైడ్రేషన్",
    steps: "రోజువారీ అడుగులు",
    activeTime: "యాక్టివ్ సమయం",
    resetSimulator: "సిమ్యులేటర్ రీసెట్ చేయండి",
    overallScore: "మొత్తం స్కోరు",
    dayProgress: "రోజు పురోగతి",
    habitMsg1: "మీ లక్ష్యాలను చేరుకోవడానికి నడవడం ప్రారంభించండి!",
    habitMsg2: "మీరు చాలా బాగా చేస్తున్నారు! ఇలాగే కొనసాగించండి.",
    habitMsg3: "దాదాపు చేరుకున్నారు! అద్భుతమైన కృషి.",
    habitMsg4: "అద్భుతమైన రోజు! ఆరోగ్య लक्ष्यాలు పూర్తయ్యాయి! 🏆",
    featuresTag: "వేదిక ఫీచర్లు",
    featuresTitle: "ఆరోగ్య సంరక్షణకు అవసరమైన ప్రతిదీ, డిజిటల్‌గా",
    feat1Title: "HIPAA-స్థాయి భద్రత",
    feat1Desc: "అన్ని క్లినికల్ డేటా కోసం ఎండ్-టు-ఎండ్ ఎన్‌క్రిప్షన్, పాత్రల ఆధారిత యాక్సెస్ మరియు పూర్తి ఆడిట్ వివరాలు.",
    feat2Title: "హెచ్‌డీ వీడియో సంప్రదింపులు",
    feat2Desc: "స్క్రీన్ షేరింగ్, కాల్ ఆన్/ఆఫ్ మరియు తక్కువ ఇంటర్నెట్ వేగానికి అనుకూలంగా పనిచేసే వెబ్‌ఆర్‌టీసీ వీడియో కాల్స్.",
    feat3Title: "డిజిటల్ ఈ-ప్రిస్క్రిప్షన్లు",
    feat3Desc: "భద్రతా కోడ్‌లతో కూడిన డిజిటల్ సంతకం చేసిన ప్రిస్క్రిప్షన్లు, నిజ సమయంలో నేరుగా ఫార్మాసిస్టులకు పంపబడతాయి.",
    ctaTitle: "ఈరోజే మీ వర్చువల్ సంప్రదింపులను ప్రారంభించండి",
    ctaDesc: "MediLink పూర్తిగా ఓపెన్-సోర్స్, HIPAA నిబంధనలకు కట్టుబడి ఉంటుంది మరియు వినియోగానికి సిద్ధంగా ఉంది. మీ వైద్య గదిని ప్రారంభించడానికి ప్రొఫైల్‌ను సృష్టించండి లేదా లాగిన్ అవ్వండి."
  }
*/

const LandingPage = () => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');
  const t = TRANSLATIONS[currentLang];

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
      text: TRANSLATIONS.en.aiWelcome
    }
  ]);

  useEffect(() => {
    setChatMessages(prev => prev.map(msg => msg.id === 1 ? { ...msg, text: t.aiWelcome } : msg));
  }, [currentLang]);
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
        text: t.aiWelcome
      }
    ]);
    toast.success(currentLang === 'en' ? "Chat history cleared." : currentLang === 'hi' ? "चैट इतिहास साफ किया गया।" : "చాట్ చరిత్ర క్లియర్ చేయబడింది.");
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
            <a href="#roles">{t.portals}</a>
            <a href="#how">{t.howItWorks}</a>
            <a href="#tracker">{t.habitsTracker}</a>
            <a href="#features">{t.features}</a>
          </div>
          <div className="nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              value={currentLang} 
              onChange={(e) => {
                setCurrentLang(e.target.value);
                localStorage.setItem('lang', e.target.value);
              }} 
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
              <option value="hi">🇮🇳 हिंदी (Hindi)</option>
              <option value="te">🇮🇳 తెలుగు (Telugu)</option>
            </select>
            <Link to="/login" className="btn btn-ghost">{t.login}</Link>
            <Link to="/register" className="btn btn-primary">{t.register}</Link>
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
              {t.heroBadge}
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: 1.15, marginBottom: '20px' }}>
              {currentLang === 'en' ? (
                <>Healthcare that comes <em>to you</em>, anywhere</>
              ) : currentLang === 'hi' ? (
                <>स्वास्थ्य सेवा जो सीधे <em>आपके पास</em> आती है, कहीं भी</>
              ) : (
                <>హెల్త్‌కేర్ సేవలు నేరుగా <em>మీ వద్దకే</em>, ఎక్కడైనా</>
              )}
            </h1>
            <p className="hero-desc">
              {t.heroDesc}
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">{t.heroCtaBook}</Link>
              <a href="#how" className="btn btn-ghost btn-lg">{t.heroCtaSee}</a>
            </div>
            {/* Analytics restructured to Dashboard UI style cards with real time numbers */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2.5rem', width: '100%', maxWidth: '520px' }}>
              <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--white)', borderTop: '4px solid var(--sky)', textAlign: 'left', borderRadius: '12px', boxShadow: 'var(--card-shadow)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.activePatients}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ink)', marginTop: '0.4rem' }}>{patientsCount}</div>
              </div>
              <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--white)', borderTop: '4px solid var(--mint)', textAlign: 'left', borderRadius: '12px', boxShadow: 'var(--card-shadow)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.licensedDoctors}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--ink)', marginTop: '0.4rem' }}>{doctorsCount}</div>
              </div>
              <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--white)', borderTop: '4px solid var(--violet)', textAlign: 'left', borderRadius: '12px', boxShadow: 'var(--card-shadow)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.satisfactionRate}</div>
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
                <div className="hc-label">{t.todayConsultations}</div>
                <div className="hc-appt">
                  <div className="hc-appt-icon" style={{ background: '#fef3c7' }}>🎥</div>
                  <div className="hc-appt-info">
                    <div className="hc-appt-name">Arjun Mehta</div>
                    <div className="hc-appt-time">10:00 AM — Video call</div>
                  </div>
                  <span className="hc-appt-status status-live">{t.liveNow}</span>
                </div>
                <div className="hc-appt">
                  <div className="hc-appt-icon" style={{ background: '#e0f2fe' }}>💬</div>
                  <div className="hc-appt-info">
                    <div className="hc-appt-name">Sunita Bose</div>
                    <div className="hc-appt-time">11:30 AM — Chat consultation</div>
                  </div>
                  <span className="hc-appt-status status-next">{t.upNext}</span>
                </div>
              </div>
              <div className="hc-section" style={{ marginBottom: 0 }}>
                <div className="hc-label">{t.patientVitals} — Arjun Mehta</div>
                <div className="vitals">
                  <div className="vital">
                    <div className="vital-val">124/80</div>
                    <div className="vital-lbl">{t.bloodPressure}</div>
                  </div>
                  <div className="vital">
                    <div className="vital-val">96%</div>
                    <div className="vital-lbl">SpO₂</div>
                  </div>
                  <div className="vital">
                    <div className="vital-val">72 bpm</div>
                    <div className="vital-lbl">{t.heartRate}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="floating-card fc-rx">
              <span className="fc-rx-icon">💊</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{t.rxSent}</div>
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
                <div style={{ fontWeight: '600', color: 'var(--ink)' }}>{t.hdCall}</div>
                <div style={{ color: 'var(--ink-muted)', fontSize: '11px' }}>{t.encrypted}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="section" id="roles">
        <div className="section-inner">
          <div className="section-tag">{t.portals}</div>
          <h2 className="section-title">{t.portalsTitle}</h2>
          <p className="section-sub">{t.portalsSub}</p>
          <div className="roles-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="role-card patient">
              <div className="role-icon ri-patient">
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="role-title" style={{ color: '#1e3a8a' }}>{t.patientPortal}</div>
              <ul className="role-features rf-patient">
                {t.patientFeatures.map((feat, index) => (
                  <li key={index}>{feat}</li>
                ))}
              </ul>
            </div>
            <div className="role-card doctor">
              <div className="role-icon ri-doctor">
                <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <div className="role-title" style={{ color: '#14532d' }}>{t.doctorPortal}</div>
              <ul className="role-features rf-doctor">
                {t.doctorFeatures.map((feat, index) => (
                  <li key={index}>{feat}</li>
                ))}
              </ul>
            </div>
            <div className="role-card pharmacist">
              <div className="role-icon ri-pharmacist">
                <svg viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
              </div>
              <div className="role-title" style={{ color: '#7c2d12' }}>{t.pharmacistPortal}</div>
              <ul className="role-features rf-pharmacist">
                {t.pharmacistFeatures.map((feat, index) => (
                  <li key={index}>{feat}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <div className="how-inner">
          <div className="section-tag">{t.journeyTag}</div>
          <h2 className="section-title">{t.journeyTitle}</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14h6M9 18h6M9 10h6"></path></svg>
              </div>
              <div className="step-title">{t.step1Title}</div>
              <div className="step-desc">{t.step1Desc}</div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div className="step-title">{t.step2Title}</div>
              <div className="step-desc">{t.step2Desc}</div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
              <div className="step-title">{t.step3Title}</div>
              <div className="step-desc">{t.step3Desc}</div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
              </div>
              <div className="step-title">{t.step4Title}</div>
              <div className="step-desc">{t.step4Desc}</div>
            </div>
          </div>
        </div>
      </section>

      {/* DAILY HEALTHY HABITS TRACKER */}
      <section className="tracker-section" id="tracker" style={{ padding: '80px 5%', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-tag" style={{ textAlign: 'center' }}>{t.trackerTag}</div>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '16px' }}>{t.trackerTitle}</h2>
          <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto 48px', maxWidth: '650px' }}>
            {t.trackerDesc}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }} className="tracker-grid">
            {/* Interactive Control Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Card 1: Water Tracker */}
              <div className="glass-card" style={{ padding: '24px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ fontSize: '32px', padding: '12px', background: '#e0f2fe', borderRadius: '12px', color: 'var(--sky)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--ink)' }}>{t.hydration}</span>
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
                    <span style={{ fontWeight: '600', color: 'var(--ink)' }}>{t.steps}</span>
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
                    <span style={{ fontWeight: '600', color: 'var(--ink)' }}>{t.activeTime}</span>
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
                  🔄 {t.resetSimulator}
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
                  <span style={{ fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>{t.dayProgress}</span>
                </div>
              </div>

              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--ink)', marginBottom: '8px' }}>
                {overallScore < 50 && t.habitMsg1}
                {overallScore >= 50 && overallScore < 80 && t.habitMsg2}
                {overallScore >= 80 && overallScore < 100 && t.habitMsg3}
                {overallScore === 100 && t.habitMsg4}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0, lineHeight: '1.5' }}>
                {overallScore < 100 ? (
                  currentLang === 'en' ? `Log more stats. You need ${3000 - water > 0 ? `${3000 - water}ml water` : ''} ${3000 - water > 0 && 10000 - steps > 0 ? 'and' : ''} ${10000 - steps > 0 ? `${10000 - steps} steps` : ''} to meet target guidelines.` :
                  currentLang === 'hi' ? `अधिक आँकड़े लॉग करें। आपको लक्ष्य पूरा करने के लिए ${3000 - water > 0 ? `${3000 - water}ml पानी` : ''} ${3000 - water > 0 && 10000 - steps > 0 ? 'और' : ''} ${10000 - steps > 0 ? `${10000 - steps} कदम` : ''} चलने की आवश्यकता है।` :
                  `మరిన్ని గణాంకాలను నమోదు చేయండి. లక్ష్యాన్ని చేరుకోవడానికి మీకు ${3000 - water > 0 ? `${3000 - water}ml నీరు` : ''} ${3000 - water > 0 && 10000 - steps > 0 ? 'మరియు' : ''} ${10000 - steps > 0 ? `${10000 - steps} అడుగులు` : ''} అవసరం.`
                ) : (
                  currentLang === 'en' ? "You've fully completed your health habits targets for today! Maintain this streak for optimal physical wellness." :
                  currentLang === 'hi' ? "आपने आज के लिए अपने स्वास्थ्य आदतों के लक्ष्यों को पूरी तरह से पूरा कर लिया है! इष्टतम शारीरिक कल्याण के लिए इस सिलसिले को बनाए रखें।" :
                  "ఈ రోజు కోసం మీ ఆరోగ్య అలవాట్ల లక్ష్యాలను మీరు పూర్తిగా పూర్తి చేసారు! సరైన శారీరక ఆరోగ్యం కోసం ఈ ప్రయాణాన్ని కొనసాగించండి."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-tag">{t.featuresTag}</div>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>{t.featuresTitle}</h2>
          <div className="features-grid">
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <div className="feat-title">{t.feat1Title}</div>
              <div className="feat-desc">{t.feat1Desc}</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
              <div className="feat-title">{t.feat2Title}</div>
              <div className="feat-desc">{t.feat2Desc}</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="feat-title">{t.feat3Title}</div>
              <div className="feat-desc">{t.feat3Desc}</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M6 3h12M8 3v7.5L3 19a2 2 0 0 0 1.8 3h14.4a2 2 0 0 0 1.8-3l-5-8.5V3M6 14h12"></path></svg>
              </div>
              <div className="feat-title">{t.feat4Title}</div>
              <div className="feat-desc">{t.feat4Desc}</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div className="feat-title">{t.feat5Title}</div>
              <div className="feat-desc">{t.feat5Desc}</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              </div>
              <div className="feat-title">{t.feat6Title}</div>
              <div className="feat-desc">{t.feat6Desc}</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <div className="feat-title">{t.feat7Title}</div>
              <div className="feat-desc">{t.feat7Desc}</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div className="feat-title">{t.feat8Title}</div>
              <div className="feat-desc">{t.feat8Desc}</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </div>
              <div className="feat-title">{t.feat9Title}</div>
              <div className="feat-desc">{t.feat9Desc}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-blob"></div>
        <div className="cta-inner">
          <h2 className="cta-title">{t.ctaTitle}</h2>
          <p className="cta-sub">{t.ctaDesc}</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">{t.ctaRegister}</Link>
            <Link to="/login" className="btn btn-outline-white btn-lg">{t.ctaLogin}</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo">MediLink</div>
          <div className="footer-links">
            <a href="#" onClick={(e) => { e.preventDefault(); setPolicyTab('privacy'); }}>{t.privacyPolicy}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setPolicyTab('terms'); }}>{t.termsOfService}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setPolicyTab('hipaa'); }}>{t.hipaaCompliance}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.success(t.systemStatusToast); }}>{t.systemStatus}</a>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{t.copyright}</div>
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
                {t.aiChipReport}
              </button>
              <button 
                className="ai-suggestion-chip" 
                onClick={() => handleSendMessage("What is a Legit Verification Code?")}
              >
                {t.aiChipRx}
              </button>
              <button 
                className="ai-suggestion-chip" 
                onClick={() => handleSendMessage("How to register as a doctor?")}
              >
                {t.aiChipDoc}
              </button>
              <button 
                className="ai-suggestion-chip" 
                onClick={() => handleSendMessage("Is MediLink HIPAA compliant?")}
              >
                {t.aiChipSecurity}
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
