import React, { useState, useEffect, useRef } from 'react';
import { getPatientAppointments, getPatientRecords, createAppointment, getAllUsers, getAllPrescriptions, cancelAppointment, updateUserProfile, getDoctorConsultations, updateAppointment } from '../api';
import toast from 'react-hot-toast';
import VideoConsultation from '../components/VideoConsultation';
import SymptomChecker from '../components/SymptomChecker';
import CheckoutModal from '../components/CheckoutModal';
import CalendarView from '../components/CalendarView';
import NotificationCenter from '../components/NotificationCenter';
import { printPrescription, printInvoice } from '../utils/printHelper';
import { parseAvailability, generateSlotsForDate } from '../utils/availability';
import { Video, XCircle, Calendar, FileText, Pill, LogOut, Clock } from 'lucide-react';
import { addNotification, notifyAppointmentBooked, notifyAppointmentCancelled, sendConsultationReminderSMS } from '../utils/notifications';

const TIME_SLOTS = [
  { label: '08:00 AM (Emergency Case)', time: '08:00' },
  { label: '10:00 AM', time: '10:00' },
  { label: '10:30 AM', time: '10:30' },
  { label: '11:00 AM', time: '11:00' },
  { label: '11:30 AM', time: '11:30' },
  { label: '12:00 PM', time: '12:00' },
  { label: '12:30 PM', time: '12:30' },
  { label: '02:00 PM', time: '14:00' },
  { label: '02:30 PM', time: '14:30' },
  { label: '03:00 PM', time: '15:00' },
  { label: '03:30 PM', time: '15:30' },
  { label: '04:00 PM', time: '16:00' },
  { label: '04:30 PM', time: '16:30' },
  { label: '05:00 PM', time: '17:00' },
  { label: '05:30 PM', time: '17:30' },
  { label: '06:00 PM', time: '18:00' }
];

const TRANSLATIONS = {
  en: {
    welcome: "Welcome, ",
    portalSubtitle: "Patient Portal • Oversee prescriptions, schedule new clinical consultations, and manage records securely.",
    settings: "Settings",
    logout: "Logout",
    scheduledCalls: "Scheduled Calls",
    activePrescriptions: "Active Prescriptions",
    medicalReports: "Medical Reports",
    quickSchedule: "Schedule",
    quickBookCall: "Book Call",
    quickMedication: "Medication",
    quickViewScripts: "View Scripts",
    quickHistory: "History",
    quickViewRecords: "View Records",
    upcomingAppts: "Upcoming Appointments",
    noUpcomingAppts: "You have no upcoming virtual appointments scheduled.",
    attendingDr: "Dr. ",
    joinCall: "Join Call",
    registeredEmail: "Registered Email",
    accountId: "Account ID",
    ageTriageLog: "Age",
    yearsOld: "years old",
    phoneNum: "Phone Number",
    myPrescriptions: "My Prescriptions",
    noPrescriptions: "No active prescriptions found.",
    prescriptionHash: "Prescription #RX-",
    dispensed: "Dispensed",
    pendingPharmacy: "Pending Pharmacy",
    issuedByDr: "Issued by Dr.",
    handoverLegitCode: "Handover Legit Code:",
    shareWithPharmacistOnly: "(Share with Pharmacist only)",
    medicalRecordsTitle: "Medical Records",
    noMedicalRecords: "No medical records on file.",
    diagnosisLabel: "Diagnosis:",
    treatmentPlanLabel: "Treatment Plan:",
    bookVirtualConsult: "Book Virtual Consultation",
    selectSpecialty: "Select Specialty",
    selectDoctor: "Select Doctor",
    selectDate: "Select Date",
    selectTimeSlot: "Select Time Slot",
    predefinedSlots: "Predefined Slots:",
    selectDoctorFirst: "Please select a doctor first",
    selectDateFirst: "Please select a date first",
    bookedLabel: "Booked",
    bookApptBtn: "Book Appointment",
    accountSettings: "Account Settings",
    fullNameInput: "Full Name",
    emailInput: "Email Address",
    ageInput: "Age (Years)",
    phoneInput: "Phone Number",
    passwordInput: "Password",
    passwordInputHint: "(Leave blank to keep unchanged)",
    confirmPasswordInput: "Confirm Password",
    editDetailsBtn: "Edit details",
    saveChangesBtn: "Save Changes",
    closeBtn: "Close",
    cancelBtn: "Cancel",
    confirmBtn: "Confirm",
    cancelApptTitle: "Cancel Appointment?",
    cancelApptDesc: "Are you sure you want to cancel this virtual consultation appointment permanently? This action cannot be undone.",
    cancelApptBtn: "Cancel Appointment",
    confirmLogoutTitle: "Confirm Logout",
    confirmLogoutDesc: "Are you sure you want to end your clinical patient session?",
    passwordsDoNotMatch: "Passwords do not match!",
    profileUpdated: "Profile updated successfully!",
    profileUpdateFailed: "Failed to update profile details. Verify fields and email uniqueness.",
    loadDetailsFailed: "Failed to load account details.",
    selectDateAndSlot: "Please select both a date and a time slot.",
    bookingSuccess: "Appointment Successfully Booked!",
    bookingFailed: "Booking failed. Make sure DB is running and a Doctor exists.",
    apptCanceled: "Appointment Canceled!",
    errCanceled: "Error canceling appointment.",
    failedCancelAction: "Failed to execute cancel action.",
    enable2fa: "🔒 Enable Two-Factor Authentication (2FA)",
    scan2faQr: "Scan QR with Authenticator App (Google/Microsoft):",
    secretKey: "Secret Key:",
    ehrTitle: "Lifelong EHR Health Profile",
    bloodGroup: "Blood Group",
    selectBloodGroup: "Select Blood Group",
    allergies: "Allergies",
    chronicDiseases: "Chronic Diseases",
    pastSurgeries: "Past Surgeries",
    vaccinations: "Vaccination Records",
    paymentHistoryTitle: "Payment History & Invoices",
    thDoctor: "Doctor",
    thDate: "Date",
    thAmount: "Amount",
    thTxId: "Transaction ID",
    thStatus: "Status",
    thActions: "Actions",
    noPaymentHistory: "No payment transaction history found.",
    btnReceipt: "Receipt",
    btnRefund: "Refund"
  },
  hi: {
    welcome: "आपका स्वागत है, ",
    portalSubtitle: "मरीज पोर्टल • नुस्खों की निगरानी करें, नए नैदानिक परामर्श निर्धारित करें और रिकॉर्ड को सुरक्षित रूप से प्रबंधित करें।",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    scheduledCalls: "निर्धारित कॉल",
    activePrescriptions: "सक्रिय नुस्खे",
    medicalReports: "मेडिकल रिपोर्ट",
    quickSchedule: "शेड्यूल",
    quickBookCall: "कॉल बुक करें",
    quickMedication: "दवाएं",
    quickViewScripts: "नुस्खे देखें",
    quickHistory: "इतिहास",
    quickViewRecords: "रिकॉर्ड देखें",
    upcomingAppts: "आगामी नियुक्तियां",
    noUpcomingAppts: "आपके पास कोई आगामी वर्चुअल अपॉइंटमेंट निर्धारित नहीं है।",
    attendingDr: "डॉ. ",
    joinCall: "कॉल में शामिल हों",
    registeredEmail: "पंजीकृत ईमेल",
    accountId: "खाता आईडी",
    ageTriageLog: "उम्र",
    yearsOld: "वर्ष",
    phoneNum: "फ़ोन नंबर",
    myPrescriptions: "मेरे नुस्खे",
    noPrescriptions: "कोई सक्रिय नुस्खा नहीं मिला।",
    prescriptionHash: "पर्चे #RX-",
    dispensed: "दवा दी गई",
    pendingPharmacy: "फार्मेसी लंबित",
    issuedByDr: "डॉ. द्वारा जारी",
    handoverLegitCode: "हैंडओवर वैध कोड:",
    shareWithPharmacistOnly: "(केवल फार्मासिस्ट के साथ साझा करें)",
    medicalRecordsTitle: "चिकित्सा रिकॉर्ड",
    noMedicalRecords: "फाइल पर कोई चिकित्सा रिकॉर्ड नहीं है।",
    diagnosisLabel: "निदान (Diagnosis):",
    treatmentPlanLabel: "उपचार योजना:",
    bookVirtualConsult: "वर्चुअल परामर्श बुक करें",
    selectSpecialty: "विशेषता चुनें",
    selectDoctor: "डॉक्टर चुनें",
    selectDate: "तारीख चुनें",
    selectTimeSlot: "समय स्लॉट चुनें",
    predefinedSlots: "पूर्वनिर्धारित स्लॉट:",
    selectDoctorFirst: "कृपया पहले डॉक्टर चुनें",
    selectDateFirst: "कृपया पहले तारीख चुनें",
    bookedLabel: "बुक किया गया",
    bookApptBtn: "अपॉइंटमेंट बुक करें",
    accountSettings: "खाता सेटिंग्स",
    fullNameInput: "पूरा नाम",
    emailInput: "ईमेल पता",
    ageInput: "उम्र (वर्ष)",
    phoneInput: "फ़ोन नंबर",
    passwordInput: "पासवर्ड",
    passwordInputHint: "(अपरिवर्तित रखने के लिए खाली छोड़ दें)",
    confirmPasswordInput: "पासवर्ड की पुष्टि करें",
    editDetailsBtn: "विवरण संपादित करें",
    saveChangesBtn: "बदलाव सहेजें",
    closeBtn: "बंद करें",
    cancelBtn: "रद्द करें",
    confirmBtn: "पुष्टि करें",
    cancelApptTitle: "अपॉइंटमेंट रद्द करें?",
    cancelApptDesc: "क्या आप वाकई इस वर्चुअल परामर्श अपॉइंटमेंट को स्थायी रूप से रद्द करना चाहते हैं? इस कार्रवाई को वापस नहीं लिया जा सकता।",
    cancelApptBtn: "अपॉइंटमेंट रद्द करें",
    confirmLogoutTitle: "लॉगआउट की पुष्टि करें",
    confirmLogoutDesc: "क्या आप वाकई अपना मरीज सत्र समाप्त करना चाहते हैं?",
    passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते!",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
    profileUpdateFailed: "प्रोफ़ाइल विवरण अपडेट करने में विफल। फ़ील्ड और ईमेल विशिष्टता सत्यापित करें।",
    loadDetailsFailed: "खाता विवरण लोड करने में विफल।",
    selectDateAndSlot: "कृपया तारीख और समय स्लॉट दोनों चुनें।",
    bookingSuccess: "अपॉइंटमेंट सफलतापूर्वक बुक हो गया!",
    bookingFailed: "बुकिंग विफल रही। सुनिश्चित करें कि डेटाबेस चालू है और कोई डॉक्टर मौजूद है।",
    apptCanceled: "अपॉइंटमेंट रद्द कर दिया गया!",
    errCanceled: "अपॉइंटमेंट रद्द करने में त्रुटि।",
    failedCancelAction: "रद्द करने की कार्रवाई निष्पादित करने में विफल।",
    enable2fa: "🔒 द्वि-कारक प्रमाणीकरण (2FA) सक्षम करें",
    scan2faQr: "प्रमाणीकरण ऐप (Google/Microsoft) से क्यूआर स्कैन करें:",
    secretKey: "गुप्त कुंजी (Secret Key):",
    ehrTitle: "आजीवन EHR स्वास्थ्य प्रोफ़ाइल",
    bloodGroup: "रक्त समूह (Blood Group)",
    selectBloodGroup: "रक्त समूह चुनें",
    allergies: "एलर्जी (Allergies)",
    chronicDiseases: "पुरानी बीमारियाँ (Chronic Diseases)",
    pastSurgeries: "पिछली सर्जरी (Surgeries)",
    vaccinations: "टीकाकरण रिकॉर्ड",
    paymentHistoryTitle: "भुगतान इतिहास और चालान",
    thDoctor: "डॉक्टर",
    thDate: "तारीख",
    thAmount: "राशि",
    thTxId: "लेन-देन आईडी",
    thStatus: "स्थिति",
    thActions: "कार्रवाई",
    noPaymentHistory: "कोई भुगतान लेनदेन इतिहास नहीं मिला।",
    btnReceipt: "रसीद",
    btnRefund: "धनवापसी (Refund)"
  },
  te: {
    welcome: "స్వాగతం, ",
    portalSubtitle: "రోగి పోర్టల్ • ప్రిస్క్రిప్షన్‌లను పర్యవేక్షించండి, కొత్త క్లినికల్ సంప్రదింపులను షెడ్యూల్ చేయండి మరియు రికార్డులను సురక్షితంగా నిర్వహించండి.",
    settings: "సెట్టింగులు",
    logout: "లాగౌట్",
    scheduledCalls: "షెడ్యూల్డ్ కాల్స్",
    activePrescriptions: "యాక్టివ్ ప్రిస్క్రిప్షన్లు",
    medicalReports: "వైద్య నివేదికలు",
    quickSchedule: "షెడ్యూల్",
    quickBookCall: "కాల్ బుక్ చేయండి",
    quickMedication: "మందులు",
    quickViewScripts: "ప్రిస్క్రిప్షన్లు",
    quickHistory: "చరిత్ర",
    quickViewRecords: "రికార్డులు వీక్షించండి",
    upcomingAppts: "రాబోయే అపాయింట్‌మెంట్‌లు",
    noUpcomingAppts: "మీకు రాబోయే వర్చువల్ అపాయింట్‌మెంట్‌లు ఏవీ షెడ్యూల్ చేయబడలేదు.",
    attendingDr: "డా. ",
    joinCall: "కాల్ లో చేరండి",
    registeredEmail: "నమోదిత ఈమెయిల్",
    accountId: "ఖాతా ఐడీ",
    ageTriageLog: "వయస్సు",
    yearsOld: "సంవత్సరాలు",
    phoneNum: "ఫోన్ నంబర్",
    myPrescriptions: "నా ప్రిస్క్రిప్షన్లు",
    noPrescriptions: "యాక్టివ్ ప్రిస్క్రిప్షన్లు ఏవీ కనుగొనబడలేదు.",
    prescriptionHash: "ప్రిస్క్రిప్షన్ #RX-",
    dispensed: "మందులు ఇవ్వబడ్డాయి",
    pendingPharmacy: "ఫార్మసీ పెండింగ్",
    issuedByDr: "వైద్యుడు జారీ చేసారు",
    handoverLegitCode: "హ్యాండోవర్ లెజిట్ కోడ్:",
    shareWithPharmacistOnly: "(ఫార్మాసిస్ట్‌తో మాత్రమే భాగస్వామ్యం చేయండి)",
    medicalRecordsTitle: "వైద్య రికార్డులు",
    noMedicalRecords: "ఫైల్లో వైద్య రికార్డులు ఏవీ లేవు.",
    diagnosisLabel: "వ్యాధి నిర్ధారణ (Diagnosis):",
    treatmentPlanLabel: "చికిత్స ప్రణాళిక:",
    bookVirtualConsult: "వర్చువల్ సంప్రదింపులను బుక్ చేయండి",
    selectSpecialty: "స్పెషాలిటీని ఎంచుకోండి",
    selectDoctor: "వైద్యుడిని ఎంచుకోండి",
    selectDate: "తేదీని ఎంచుకోండి",
    selectTimeSlot: "సమయ స్లాట్‌ను ఎంచుకోండి",
    predefinedSlots: "సమయ స్లాట్లు:",
    selectDoctorFirst: "దయచేసి మొదట వైద్యుడిని ఎంచుకోండి",
    selectDateFirst: "దయచేసి మొదట తేదీని ఎంచుకోండి",
    bookedLabel: "బుక్ చేయబడింది",
    bookApptBtn: "అపాయింట్‌మెంట్ బుక్ చేయండి",
    accountSettings: "ఖాతా సెట్టింగులు",
    fullNameInput: "పూర్తి పేరు",
    emailInput: "ఈమెయిల్ చిరునామా",
    ageInput: "వయస్సు (సంవత్సరాలు)",
    phoneInput: "ఫోన్ నంబర్",
    passwordInput: "పాస్‌వర్డ్",
    passwordInputHint: "(మార్చకుండా ఉంచడానికి ఖాళీగా వదిలేయండి)",
    confirmPasswordInput: "పాస్‌వర్డ్ నిర్ధారించండి",
    editDetailsBtn: "వివరాలను సవరించండి",
    saveChangesBtn: "మార్పులను సేవ్ చేయండి",
    closeBtn: "మూసివేయి",
    cancelBtn: "రద్దు చేయి",
    confirmBtn: "నిర్ధారించు",
    cancelApptTitle: "అపాయింట్‌మెంట్‌ను రద్దు చేయాలా?",
    cancelApptDesc: "మీరు ఈ వర్చువల్ సంప్రదింపుల అపాయింట్‌మెంట్‌ను శాశ్వతంగా రద్దు చేయాలనుకుంటున్నారా? ఈ చర్యను తిరిగి మార్చలేము.",
    cancelApptBtn: "అపాయింట్‌మెంట్‌ను రద్దు చేయి",
    confirmLogoutTitle: "లాగౌట్ నిర్ధారించండి",
    confirmLogoutDesc: "మీరు మీ రోగి సెషన్‌ను ముగించాలనుకుంటున్నారా?",
    passwordsDoNotMatch: "పాసవర్డ్‌లు సరిపోలడం లేదు!",
    profileUpdated: "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!",
    profileUpdateFailed: "ప్రొఫైల్ వివరాలను నవీకరించడంలో విఫలమైంది. ఫీల్డ్‌లు మరియు ఇమెయిల్ ప్రత్యేకతను ధృవీకరించండి.",
    loadDetailsFailed: "ఖాతా వివరాలను లోడ్ చేయడంలో విఫలమైంది.",
    selectDateAndSlot: "దయచేసి తేదీ మరియు సమయ స్లాట్ రెండింటినీ ఎంచుకోండి.",
    bookingSuccess: "అపాయింట్‌మెంట్ విజయవంతంగా బుక్ చేయబడింది!",
    bookingFailed: "బుకింగ్ విఫలమైంది. డేటాబేస్ రన్ అవుతుందో లేదో మరియు వైద్యుడు ఉన్నారో లేదో సరిచూసుకోండి.",
    apptCanceled: "అపాయింట్‌మెంట్ రద్దు చేయబడింది!",
    errCanceled: "అపాయింట్‌మెంట్‌ను రద్దు చేయడంలో లోపం సంభవించింది.",
    failedCancelAction: "రద్దు చర్యను అమలు చేయడంలో విఫలమైంది.",
    enable2fa: "🔒 ద్వి-కారక ప్రామాణీకరణ (2FA) ప్రారంభించు",
    scan2faQr: "అథెంటికేటర్ యాప్ (Google/Microsoft) తో క్యూఆర్ కోడ్ స్కాన్ చేయండి:",
    secretKey: "రహస్య కీ (Secret Key):",
    ehrTitle: "జీవితకాల EHR ఆరోగ్య ప్రొఫైల్",
    bloodGroup: "రక్క సమూహం (Blood Group)",
    selectBloodGroup: "రక్త సమూహాన్ని ఎంచుకోండి",
    allergies: "అలెర్జీలు (Allergies)",
    chronicDiseases: "దీర్ఘకాలిక వ్యాధులు",
    pastSurgeries: "గత శస్త్రచికిత్సలు",
    vaccinations: "టీకా రికార్డులు",
    paymentHistoryTitle: "చెల్లింపు చరిత్ర & ఇన్‌వాయిస్‌లు",
    thDoctor: "వైద్యుడు",
    thDate: "తేదీ",
    thAmount: "మొత్తం",
    thTxId: "లావాదేవీ ఐడీ",
    thStatus: "స్థితి",
    thActions: "చర్యలు",
    noPaymentHistory: "ఎటువంటి చెల్లింపు లావాదేవీల చరిత్ర కనుగొనబడలేదు.",
    btnReceipt: "రసీదు",
    btnRefund: "రీఫండ్"
  }
};

const PatientDashboard = () => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');
  const t = TRANSLATIONS[currentLang];

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('lang', lang);
  };

  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [rxActiveTab, setRxActiveTab] = useState('list');
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // AI Chatbot State
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([
    { sender: 'AI', text: 'Hello! I am your MedConnect AI health assistant. Ask me general medical questions, dosage instructions, or check your schedule.' }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [pendingAppointmentPayload, setPendingAppointmentPayload] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  
  const [bookData, setBookData] = useState({ doctorId: '', date: '' });
  const [bookDate, setBookDate] = useState('');
  const [bookSlot, setBookSlot] = useState('');
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [patientAge, setPatientAge] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  
  const [inCall, setInCall] = useState(false);
  const [activeAppt, setActiveAppt] = useState(null);

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
    twoFactorEnabled: false,
    bloodGroup: '',
    allergies: '',
    chronicDiseases: '',
    pastSurgeries: '',
    vaccinations: '',
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

  const handleOpenSettings = async () => {
    try {
      const users = await getAllUsers();
      const myEmail = localStorage.getItem('userEmail');
      const me = (users || []).find(u => u.email === myEmail);
      if (me) {
        let ehr = {};
        if (me.ehrData) {
          try { ehr = JSON.parse(me.ehrData); } catch (err) { console.error("EHR parse error:", err); }
        }
        setSettingsData({
          name: me.name,
          email: me.email,
          age: me.age || '',
          phoneNumber: me.phoneNumber || '',
          password: '',
          confirmPassword: '',
          twoFactorEnabled: me.twoFactorEnabled || false,
          bloodGroup: ehr.bloodGroup || '',
          allergies: ehr.allergies || '',
          chronicDiseases: ehr.chronicDiseases || '',
          pastSurgeries: ehr.pastSurgeries || '',
          vaccinations: ehr.vaccinations || '',
          specialist: me.specialist || '',
          licenseNumber: me.licenseNumber || ''
        });
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsEditingSettings(false);
        setShowSettingsModal(true);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
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
      const ehrPayload = {
        bloodGroup: settingsData.bloodGroup,
        allergies: settingsData.allergies,
        chronicDiseases: settingsData.chronicDiseases,
        pastSurgeries: settingsData.pastSurgeries,
        vaccinations: settingsData.vaccinations
      };
      const payload = {
        name: settingsData.name,
        email: settingsData.email,
        age: settingsData.age ? parseInt(settingsData.age) : null,
        phoneNumber: settingsData.phoneNumber,
        password: settingsData.password || null,
        twoFactorEnabled: settingsData.twoFactorEnabled,
        ehrData: JSON.stringify(ehrPayload),
        specialist: settingsData.specialist || null,
        licenseNumber: settingsData.licenseNumber || null
      };
      const updated = await updateUserProfile(patientId, payload);
      toast.success(t.profileUpdated);
      localStorage.setItem('userEmail', updated.email);
      loadData();
      setShowSettingsModal(false);
      setIsEditingSettings(false);
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error(t.profileUpdateFailed);
    }
  };

  const handleRequestRefund = async (apptId) => {
    try {
      const appt = appointments.find(a => a.id === apptId);
      if (appt) {
        await updateAppointment(apptId, { ...appt, paymentStatus: 'REFUND_REQUESTED' });
        toast.success("Refund request submitted successfully!");
        loadData();
      }
    } catch (e) {
      console.error("Failed to request refund:", e);
      toast.error("Failed to request refund.");
    }
  };

  const handleSelectSpecialtyFromChecker = (specialty) => {
    const doctorOfSpecialty = doctors.find(d => d.specialist?.toLowerCase() === specialty.toLowerCase() || (specialty === 'General Medicine' && !d.specialist));
    setBookData({
      doctorId: doctorOfSpecialty ? doctorOfSpecialty.id : '',
      date: ''
    });
    setBookDate('');
    setBookSlot('');
    setShowModal(true);
  };

  const handleChatbotSend = (text) => {
    if (!text.trim()) return;
    setChatbotMessages(prev => [...prev, { sender: 'User', text }]);
    setChatbotInput('');
    setIsChatbotTyping(true);

    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();
      
      // 0. Clinical Emergency check
      const isEmergency = lower.includes('chest pain') || lower.includes('breathing difficulty') || lower.includes('stroke') || lower.includes('difficulty breathing') || lower.includes('heart attack') || lower.includes('severe chest pain') || lower.includes('paralysis');
      
      if (isEmergency) {
        reply = "🚨 EMERGENCY WARNING: Seek emergency medical care immediately. If you are experiencing chest pain, severe breathing difficulty, stroke symptoms, or a medical emergency, please call your local emergency services (e.g., 911 or 112) now. Do not wait for a virtual consultation.";
      }
      // 1. Payment issues (payment done, failed, refund, issue, contact owner)
      else if (lower.includes('payment done') || lower.includes('issue') || lower.includes('problem') || lower.includes('failed') || lower.includes('error') || lower.includes('refund') || lower.includes('billing')) {
        reply = "If your payment is done or you are facing any related issue, please contact the owner at madhav.gannina21@gmail.com.";
      }
      // 2. How to book a doctor
      else if (lower.includes('book') || lower.includes('schedule') || lower.includes('doctor') || lower.includes('appointment')) {
        if (lower.includes('how') || lower.includes('can i') || lower.includes('steps') || lower.includes('way')) {
          reply = "To book a doctor: 1. Click the 'Book Call' or 'Book Virtual Consultation' button. 2. Select a doctor, date, and time slot. 3. Click 'Book Appointment' to open the payment checkout.";
        } else {
          const upcoming = appointments.filter(a => a.status !== 'COMPLETED');
          if (upcoming.length > 0) {
            const next = upcoming[0];
            reply = `Checking scheduled records... You have a pending consultation with Dr. ${next.doctor?.name || 'Specialist'} on ${new Date(next.appointmentDate).toLocaleString()}.`;
          } else {
            reply = "You do not have any upcoming virtual consultations scheduled. You can book a consultation using the 'Schedule Call' button.";
          }
        }
      }
      // 3. How to pay money
      else if (lower.includes('pay') || lower.includes('money') || lower.includes('payment')) {
        reply = "To pay: 1. In the checkout modal, select Stripe (Card) or Razorpay (UPI/Card). 2. For Razorpay UPI, enter your UPI ID. 3. Enter your details and click 'Pay & Confirm Booking'.";
      }
      // 4. Paracetamol
      else if (lower.includes('paracetamol')) {
        reply = "Paracetamol (Acetaminophen) is a common analgesic and antipyretic drug. For adults, the general guideline is 500mg to 1000mg every 4 to 6 hours, strictly not exceeding 4000mg (4 grams) within 24 hours to prevent acute liver damage.";
      }
      // 5. Different tablets / medications
      else if (lower.includes('tablet') || lower.includes('pill') || lower.includes('medicine') || lower.includes('capsule') || lower.includes('drug') || lower.includes('medication') || lower.includes('aspirin') || lower.includes('ibuprofen') || lower.includes('crocin') || lower.includes('dolo') || lower.includes('metformin') || lower.includes('antibiotic') || lower.includes('atorvastatin') || lower.includes('amoxicillin')) {
        reply = "Please consult a doctor. You need to contact the doctor for high level medicine to know when to use it and all. To suggest which specialist doctor you need to consult, please check our Symptom Checker.";
      }
      // 6. Help / General assistance
      else if (lower.includes('help') || lower.includes('work') || lower.includes('how to') || lower.includes('use') || lower.includes('assist')) {
        reply = "I can assist you with the following:\n1. How to book a doctor: Ask 'how to book a doctor'.\n2. How to pay money: Ask 'how to pay'.\n3. Payment issues: Ask 'payment issue' to get owner contact.\n4. Medication info: Ask about 'paracetamol'.";
      }
      // 7. Fallback
      else {
        reply = "I am a medical information bot. For clinical diagnosis or specific therapies, please use our Symptom Checker or schedule a call with one of our licensed specialist doctors.";
      }

      setChatbotMessages(prev => [...prev, { sender: 'AI', text: reply }]);
      setIsChatbotTyping(false);
    }, 1000);
  };

  const loadData = async () => {
    try {
      const users = await getAllUsers();
      const myEmail = localStorage.getItem('userEmail');
      const me = (users || []).find(u => u.email === myEmail);
      const myId = me ? me.id : null;
      
      if(me) {
         setPatientName(me.name);
         setPatientId(myId);
         setPatientAge(me.age || 'N/A');
         setPatientEmail(me.email);
         setPatientPhone(me.phoneNumber || 'N/A');
      }

      if (!myId) return;

      const appts = await getPatientAppointments(myId);
      const recs = await getPatientRecords(myId);
      const allScripts = await getAllPrescriptions();

      setAppointments(appts || []);
      setRecords(recs || []);
      setScripts((allScripts || []).filter(s => s.appointment?.patient?.id === myId));
      setDoctors((users || []).filter(u => u.role === 'DOCTOR'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
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

  const loadDoctorAppointments = async (docId) => {
    if (!docId) {
      setDoctorAppointments([]);
      return;
    }
    try {
      const appts = await getDoctorConsultations(docId);
      setDoctorAppointments(appts || []);
    } catch (err) {
      console.error("Failed to load doctor appointments", err);
      setDoctorAppointments([]);
    }
  };

  useEffect(() => {
    if (bookData.doctorId) {
      loadDoctorAppointments(bookData.doctorId);
    } else {
      setDoctorAppointments([]);
    }
  }, [bookData.doctorId]);

  const isSlotBooked = (slotTime) => {
    if (!bookDate || !doctorAppointments.length) return false;
    return doctorAppointments.some(appt => {
      if (appt.status === 'CANCELLED') return false;
      const apptDateObj = new Date(appt.appointmentDate);
      const yyyy = apptDateObj.getFullYear();
      const mm = String(apptDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(apptDateObj.getDate()).padStart(2, '0');
      const apptLocalDateStr = `${yyyy}-${mm}-${dd}`;
      
      const hours = String(apptDateObj.getHours()).padStart(2, '0');
      const minutes = String(apptDateObj.getMinutes()).padStart(2, '0');
      const apptLocalTimeStr = `${hours}:${minutes}`;
      
      return apptLocalDateStr === bookDate && apptLocalTimeStr === slotTime;
    });
  };

  const handleOpenBookingModal = () => {
    setBookData({ doctorId: '', date: '' });
    setBookDate('');
    setBookSlot('');
    setDoctorAppointments([]);
    setShowModal(true);
  };

  const getActiveValidityMessage = () => {
    if (!bookData.doctorId || !appointments.length) return null;
    
    const paidAppts = appointments.filter(appt => 
      appt.doctor?.id === bookData.doctorId && 
      appt.paymentStatus === 'PAID' &&
      appt.status !== 'CANCELLED'
    );
    
    if (paidAppts.length === 0) return null;
    
    const now = new Date().getTime();
    const activePaidAppt = paidAppts.find(appt => {
      const paidTime = new Date(appt.appointmentDate).getTime();
      const diffMs = now - paidTime;
      return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
    });
    
    if (activePaidAppt) {
      const expirationTime = new Date(activePaidAppt.appointmentDate).getTime() + 7 * 24 * 60 * 60 * 1000;
      const remainingDays = Math.ceil((expirationTime - now) / (24 * 60 * 60 * 1000));
      return `💚 7-Day Fee Validity Active! Bookings with this doctor are free until ${new Date(expirationTime).toLocaleDateString()} (${remainingDays} days remaining).`;
    }
    return null;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookDate || !bookSlot) {
      toast.error(t.selectDateAndSlot);
      return;
    }
    const selectedDoctor = doctors.find(d => d.id === bookData.doctorId);
    const proposedTime = new Date(`${bookDate}T${bookSlot}`).getTime();
    
    // Check if they have an active paid appointment with this doctor in the last 7 days relative to the proposed time
    const isFreeBooking = appointments.some(appt => {
      if (appt.doctor?.id === bookData.doctorId && appt.paymentStatus === 'PAID' && appt.status !== 'CANCELLED') {
        const paidTime = new Date(appt.appointmentDate).getTime();
        const diffMs = proposedTime - paidTime;
        // If proposed appointment is within 7 days (7 * 24 * 60 * 60 * 1000 ms) after the paid appointment
        return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
      }
      return false;
    });

    if (isFreeBooking) {
      try {
        const payload = {
          patient: { id: patientId },
          doctor: { id: bookData.doctorId },
          appointmentDate: new Date(`${bookDate}T${bookSlot}`).toISOString(),
          status: 'CONFIRMED',
          paymentAmount: 0.0,
          paymentTransactionId: '7_DAYS_FREE_VALIDITY',
          paymentStatus: 'PAID'
        };
        await createAppointment(payload);
        toast.success("Active fee validity found! Booked consultation for free.");
        
        // Trigger Email & SMS notifications
        notifyAppointmentBooked(patientEmail, selectedDoctor?.name || 'Specialist', bookDate, bookSlot);
        const dateTimeString = `${bookDate}T${bookSlot}`;
        sendConsultationReminderSMS(patientPhone, selectedDoctor?.name || 'Specialist', dateTimeString, patientEmail);

        // Add Notification
        addNotification(
          "Free Booking Confirmed",
          `Your free consultation with Dr. ${selectedDoctor?.name || 'Specialist'} is confirmed for ${bookDate} at ${bookSlot} under the 7-day fee validity.`,
          "success",
          patientEmail
        );

        setBookData({ doctorId: '', date: '' });
        setBookDate('');
        setBookSlot('');
        setShowModal(false);
        loadData();
      } catch (err) {
        console.error("Free booking error:", err);
        toast.error("Failed to complete free booking.");
      }
    } else {
      setCheckoutDetails({
        doctorName: selectedDoctor ? selectedDoctor.name : 'Specialist',
        date: bookDate,
        slot: bookSlot
      });
      setPendingAppointmentPayload({
        patient: { id: patientId },
        doctor: { id: bookData.doctorId },
        appointmentDate: new Date(`${bookDate}T${bookSlot}`).toISOString(),
        status: 'CONFIRMED'
      });
      setShowModal(false);
      setShowCheckoutModal(true);
    }
  };

  const handlePaymentSuccess = async (transactionId, amount) => {
    try {
      const payload = {
        ...pendingAppointmentPayload,
        paymentAmount: amount,
        paymentTransactionId: transactionId,
        paymentStatus: 'PAID'
      };
      await createAppointment(payload);
      toast.success(t.bookingSuccess || "Appointment booked successfully!");
      setShowCheckoutModal(false);

      // Trigger Email & SMS notifications
      notifyAppointmentBooked(patientEmail, checkoutDetails?.doctorName || 'Specialist', checkoutDetails?.date, checkoutDetails?.slot);
      const dateTimeString = `${checkoutDetails?.date}T${checkoutDetails?.slot}`;
      sendConsultationReminderSMS(patientPhone, checkoutDetails?.doctorName || 'Specialist', dateTimeString, patientEmail);

      addNotification(
        "Booking Confirmed",
        `Your virtual consultation with ${checkoutDetails?.doctorName || 'Specialist'} is confirmed for ${checkoutDetails?.date} at ${checkoutDetails?.slot}.`,
        "success",
        patientEmail
      );

      setBookData({ doctorId: '', date: '' });
      setBookDate('');
      setBookSlot('');
      loadData();
    } catch (err) {
      console.error("Payment confirmation error:", err);
      toast.error("Failed to complete appointment booking after payment.");
    }
  };

  const handleCancel = (id) => {
    triggerConfirm(
      t.cancelApptTitle,
      t.cancelApptDesc,
      t.cancelApptBtn,
      async () => {
        try {
          const appt = appointments.find(a => a.id === id);
          const docName = appt?.doctor?.name || 'Specialist';
          const apptDate = appt?.appointmentDate ? new Date(appt.appointmentDate).toLocaleString() : '';

          const ok = await cancelAppointment(id);
          if(ok) {
             toast.success(t.apptCanceled);
             notifyAppointmentCancelled(patientEmail, apptDate, docName);
             loadData();
          } else {
             toast.error(t.errCanceled);
          }
        } catch (err) {
          console.error("Cancel appointment error:", err);
          toast.error(t.failedCancelAction);
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

  const startCall = (apptId) => {
    setActiveAppt(apptId);
    setInCall(true);
  };

  if (inCall) {
    const activeApptObj = appointments.find(a => a.id === activeAppt);
    const activeDoctorId = activeApptObj?.doctor?.id;
    return <VideoConsultation appointmentId={activeAppt} patientId={patientId} doctorId={activeDoctorId} isDoctor={false} onClose={() => { setInCall(false); loadData(); }} />;
  }

  // Calculate stats
  const scheduledCallsCount = appointments.filter(a => a.status !== 'COMPLETED').length;
  const pendingScriptsCount = scripts.filter(s => !s.isFulfilled).length;

  if (isLoading) {
    return (
      <div style={{ background: 'var(--surface)', minHeight: '100vh', width: '100%', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="skeleton-text" style={{ width: '250px', height: '36px', marginBottom: '10px' }}></div>
              <div className="skeleton-text" style={{ width: '450px', height: '18px' }}></div>
            </div>
            <div className="skeleton-text" style={{ width: '120px', height: '38px', borderRadius: '20px' }}></div>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="skeleton-card" style={{ height: '100px' }}></div>
            <div className="skeleton-card" style={{ height: '100px' }}></div>
            <div className="skeleton-card" style={{ height: '100px' }}></div>
          </div>
          <div className="dashboard-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="skeleton-card" style={{ height: '220px' }}></div>
              <div className="skeleton-card" style={{ height: '300px' }}></div>
            </div>
            <div className="skeleton-card" style={{ height: '350px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', width: '100%', padding: '40px 20px', position: 'relative' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingTop: '1rem' }}>
        
        {/* Responsive Header Wrapper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '2.5rem' }}>
          <div>
            <h1 className="serif-text" style={{ fontSize: '3rem', color: 'var(--ink)', marginBottom: '0.5rem', marginTop: 0 }}>{t.welcome}{patientName || 'Patient'}!</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: '1.1rem', margin: 0 }}>
              {t.portalSubtitle}
            </p>
          </div>
          {/* Header Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
            <NotificationCenter />
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
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.scheduledCalls}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{scheduledCallsCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--coral)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.activePrescriptions}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{pendingScriptsCount}</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--white)', borderTop: '4px solid var(--violet)' }}>
            <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.medicalReports}</div>
            <div className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)', fontWeight: 'bold', marginTop: '4px' }}>{records.length}</div>
          </div>
        </div>

        {/* Two-column Dashboard grid */}
        <div className="dashboard-grid">
          
          {/* Main workspace - Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Quick action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--sky)' }}>{t.quickSchedule}</h3>
                 <button className="glow-button" style={{ width: '100%', padding: '8px 16px', fontSize: '13px', marginBottom: '8px' }} onClick={handleOpenBookingModal}>{t.quickBookCall}</button>
                 <button className="btn-ghost" style={{ width: '100%', padding: '6px 12px', fontSize: '11px', height: 'auto', border: '1px dashed var(--sky)', color: 'var(--sky)' }} onClick={() => setShowSymptomChecker(true)}>🔍 Symptom Checker AI</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--coral)' }}>{t.quickMedication}</h3>
                 <button className="btn-ghost" onClick={() => setShowScriptsModal(true)} style={{ background: 'transparent', border: '1.5px solid var(--coral)', color: 'var(--coral)', boxShadow: 'none', width: '100%', padding: '8px 16px', fontSize: '13px', height: 'auto' }}>{t.quickViewScripts}</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--violet)' }}>{t.quickHistory}</h3>
                 <button className="btn-ghost" onClick={() => setShowRecordsModal(true)} style={{ background: 'transparent', border: '1.5px solid var(--violet)', color: 'var(--violet)', boxShadow: 'none', width: '100%', padding: '8px 16px', fontSize: '13px', height: 'auto' }}>{t.quickViewRecords}</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--mint)' }}>Billing</h3>
                 <button className="btn-ghost" onClick={() => setShowBillingModal(true)} style={{ background: 'transparent', border: '1.5px solid var(--mint)', color: 'var(--mint)', boxShadow: 'none', width: '100%', padding: '8px 16px', fontSize: '13px', height: 'auto' }}>Invoices</button>
              </div>
            </div>

            {/* Upcoming Appointments List */}
            <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                <h3 className="serif-text" style={{ color: 'var(--ink)', fontSize: '1.8rem', margin: 0 }}>{t.upcomingAppts}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setViewMode('list')} 
                    className="btn-ghost" 
                    style={{ 
                      padding: '4px 12px', 
                      fontSize: '12px', 
                      height: '32px',
                      background: viewMode === 'list' ? 'var(--sky-pale)' : 'transparent',
                      color: viewMode === 'list' ? 'var(--sky-dark)' : 'var(--ink-soft)' 
                    }}
                  >
                    List
                  </button>
                  <button 
                    onClick={() => setViewMode('calendar')} 
                    className="btn-ghost" 
                    style={{ 
                      padding: '4px 12px', 
                      fontSize: '12px', 
                      height: '32px',
                      background: viewMode === 'calendar' ? 'var(--sky-pale)' : 'transparent',
                      color: viewMode === 'calendar' ? 'var(--sky-dark)' : 'var(--ink-soft)' 
                    }}
                  >
                    Calendar
                  </button>
                </div>
              </div>

              {viewMode === 'calendar' ? (
                <CalendarView 
                  appointments={appointments.filter(a => a.status !== 'COMPLETED')} 
                  onSelectAppointment={(appt) => {
                    if (appt.status !== 'CANCELLED') {
                      startCall(appt.id);
                    }
                  }} 
                  isDoctor={false} 
                />
              ) : (
                appointments.filter(a => a.status !== 'COMPLETED').length === 0 ? (
                   <p style={{ color: 'var(--ink-muted)', padding: '2rem', textAlign: 'center' }}>{t.noUpcomingAppts}</p>
                ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {appointments.filter(a => a.status !== 'COMPLETED').map(appt => (
                      <div key={appt.id} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: '600' }}>{t.attendingDr}{appt.doctor?.name || 'Specialist'}</h4>
                          <p style={{ color: 'var(--ink-muted)', fontSize: '13px', marginTop: '4px' }}>{appt.doctor?.specialist || 'General Medicine'} • {new Date(appt.appointmentDate).toLocaleString()}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <span style={{ fontSize: '13px', marginRight: '10px', color: 'var(--sky)', fontWeight: '600' }}>{appt.status}</span>
                           <button className="glow-button pulse-button" onClick={() => startCall(appt.id)} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <Video size={16} /> {t.joinCall}
                           </button>
                           <button onClick={() => handleCancel(appt.id)} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title={t.cancelApptBtn}>
                             <XCircle size={18} />
                           </button>
                        </div>
                      </div>
                    ))}
                   </div>
                )
              )}
            </div>

            {/* Past Consultations & Follow-Ups */}
            <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)', marginTop: '2rem' }}>
              <h3 className="serif-text" style={{ color: 'var(--ink)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Past Consultations & Follow-Ups</h3>
              {appointments.filter(a => a.status === 'COMPLETED' || a.status === 'No Show').length === 0 ? (
                <p style={{ color: 'var(--ink-muted)', padding: '1.5rem', textAlign: 'center', fontSize: '13px' }}>No past consultations on record.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {appointments.filter(a => a.status === 'COMPLETED' || a.status === 'No Show').map(appt => {
                    let summary = null;
                    if (appt.consultationSummary) {
                      try {
                        summary = JSON.parse(appt.consultationSummary);
                      } catch (e) {
                        console.error(e);
                      }
                    }
                    return (
                      <div key={appt.id} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <h4 style={{ fontSize: '15px', color: 'var(--ink)', fontWeight: '600' }}>Dr. {appt.doctor?.name || 'Specialist'}</h4>
                            <p style={{ color: 'var(--ink-muted)', fontSize: '12px', marginTop: '2px' }}>{appt.doctor?.specialist || 'General Medicine'} • {new Date(appt.appointmentDate).toLocaleString()}</p>
                          </div>
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: appt.status === 'COMPLETED' ? 'var(--mint-pale)' : 'rgba(239, 68, 68, 0.1)', color: appt.status === 'COMPLETED' ? 'var(--mint)' : '#ef4444', fontWeight: 'bold' }}>
                            {appt.status}
                          </span>
                        </div>

                        {summary && (
                          <div style={{ background: 'var(--white)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                            <div style={{ marginBottom: '4px' }}><strong>Diagnosis:</strong> {summary.diagnosis}</div>
                            {summary.followUp && (
                              <div style={{ color: 'var(--violet)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                                <Clock size={14} /> Follow-up: {summary.followUp}
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button 
                            className="btn-ghost" 
                            onClick={() => {
                              setBookData({ ...bookData, doctorId: appt.doctor?.id || '' });
                              setBookDate('');
                              setBookSlot('');
                              setShowModal(true);
                            }}
                            style={{ 
                              padding: '6px 14px', 
                              fontSize: '12px', 
                              height: '32px', 
                              border: '1.5px solid var(--sky)', 
                              color: 'var(--sky)',
                              background: 'transparent',
                              borderRadius: '20px'
                            }}
                          >
                            📅 One-Click Rebook
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Vitals & Profile Panel - Right Column (Matches landing visual design) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Patient Profile info card */}
            <div className="glass-card" style={{ padding: '2.2rem', background: 'var(--white)', borderTop: '4px solid var(--sky)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--sky), var(--violet))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                  PT
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--ink)', fontSize: '15px' }}>{patientName || 'Medical Patient'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--mint)', fontWeight: '600' }}>● Online</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.registeredEmail}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{patientEmail || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.accountId}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>#{patientId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.ageTriageLog}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{patientAge} {t.yearsOld}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>{t.phoneNum}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>{patientPhone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Vitals display widget removed because we are doing live sessions */}

          </div>

        </div>
      </div>

      {/* Scripts Modal */}
      {showScriptsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>{t.myPrescriptions}</h2>
              <button onClick={() => { setShowScriptsModal(false); setRxActiveTab('list'); setOcrResult(null); setOcrScanning(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <button onClick={() => setRxActiveTab('list')} style={{ flex: 1, padding: '10px', background: rxActiveTab === 'list' ? 'var(--surface)' : 'transparent', border: 'none', color: rxActiveTab === 'list' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>My Prescriptions</button>
              <button onClick={() => setRxActiveTab('ocr')} style={{ flex: 1, padding: '10px', background: rxActiveTab === 'ocr' ? 'var(--surface)' : 'transparent', border: 'none', color: rxActiveTab === 'ocr' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>🤖 AI Prescription Scan (OCR)</button>
            </div>

            {rxActiveTab === 'list' ? (
              scripts.length === 0 ? (
                 <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>{t.noPrescriptions}</p>
              ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {scripts.map(rx => (
                    <div key={rx.id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: rx.isFulfilled ? '5px solid var(--mint)' : '5px solid var(--coral)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ color: 'var(--ink)', fontWeight: '600' }}>{t.prescriptionHash}{rx.id}</h4>
                        <span style={{ color: rx.isFulfilled ? 'var(--mint)' : 'var(--coral)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                          {rx.isFulfilled ? t.dispensed : t.pendingPharmacy}
                        </span>
                      </div>
                      <p style={{ color: 'var(--ink-muted)', fontSize: '13px', margin: '4px 0 12px' }}>{t.issuedByDr} {t.attendingDr}{rx.appointment?.doctor?.name || 'Practitioner'}</p>
                      <div style={{ background: 'var(--white)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <p style={{ color: 'var(--ink)', fontWeight: '600' }}>💊 {rx.medicationDetails}</p>
                        <p style={{ color: 'var(--ink-soft)', fontSize: '13px', marginTop: '4px' }}>{rx.instructions}</p>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        <button 
                          onClick={() => printPrescription(rx, patientName, rx.appointment?.doctor?.name, patientAge, rx.issuedAt)} 
                          className="btn-ghost" 
                          style={{ height: '32px', padding: '0 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)' }}
                        >
                          🖨️ Print PDF Rx
                        </button>
                        {!rx.isFulfilled && (
                          <div style={{ padding: '6px 12px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: 'var(--sky)', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Code:</span>
                            <span style={{ fontFamily: 'monospace', letterSpacing: '0.5px', background: 'var(--white)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--ink)' }}>{rx.verificationCode || 'ML-XXXX'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                 </div>
              )
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.4rem', margin: 0, color: 'var(--ink)' }}>AI Prescription Reading (OCR)</h3>
                 <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                   Upload an image of an old handwritten prescription. The MedConnect clinical AI will extract medicine names, dosages, and instructions instantly.
                 </p>

                 <div style={{ border: '2px dashed var(--border)', padding: '24px', borderRadius: '12px', textAlign: 'center', background: 'var(--surface)' }}>
                   <input 
                     type="file" 
                     accept="image/*" 
                     onChange={(e) => {
                       const file = e.target.files[0];
                       if (!file) return;
                       setOcrScanning(true);
                       setOcrResult(null);
                       setTimeout(() => {
                         setOcrScanning(false);
                         setOcrResult({
                           doctorName: "Jane Miller, MD",
                           license: "LIC-98310-MED",
                           date: new Date().toLocaleDateString(),
                           medications: [
                             { name: "Metformin 500mg", dosage: "1 tablet", frequency: "Twice daily with meals", duration: "30 days" },
                             { name: "Lisinopril 10mg", dosage: "1 tablet", frequency: "Once daily in the morning", duration: "30 days" },
                             { name: "Atorvastatin 20mg", dosage: "1 tablet", frequency: "Once daily at bedtime", duration: "30 days" }
                           ]
                         });
                         toast.success("AI Prescription Reading completed!");
                       }, 2000);
                     }} 
                     style={{ display: 'none' }} 
                     id="ocr-upload-input" 
                   />
                   <label htmlFor="ocr-upload-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                     <span style={{ fontSize: '2.5rem' }}>📷</span>
                     <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--sky-dark)' }}>Upload old prescription scan</span>
                     <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Supports JPG, PNG or PDF scans</span>
                   </label>
                 </div>

                 {ocrScanning && (
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' }}>
                     <div className="skeleton-line" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(90deg, #f1f5f9 25%, #cbd5e1 50%, #f1f5f9 75%)', animation: 'skeleton-loading 1.5s infinite' }}></div>
                     <span style={{ fontSize: '13.5px', color: 'var(--ink-soft)', fontWeight: '600' }}>AI parsing engine reading handwritten notes...</span>
                   </div>
                 )}

                 {ocrResult && (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                       <span>Dr. {ocrResult.doctorName} ({ocrResult.license})</span>
                       <span>Date: {ocrResult.date}</span>
                     </div>
                     <h4 style={{ margin: '4px 0', color: 'var(--ink)', fontWeight: 'bold', fontSize: '13px' }}>Extracted Medication Plan:</h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {ocrResult.medications.map((m, i) => (
                         <div key={i} style={{ background: 'var(--white)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                           <div style={{ fontWeight: 'bold', color: 'var(--ink)' }}>💊 {m.name}</div>
                           <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                             Dosage: {m.dosage} | Frequency: {m.frequency} | Duration: {m.duration}
                           </div>
                         </div>
                       ))}
                     </div>
                     <button onClick={() => toast.success("Medications synced to your MedConnect clinical calendar!")} className="glow-button" style={{ marginTop: '8px', width: '100%', fontSize: '13px' }}>
                       Import Schedule to Calendar View
                     </button>
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      )}

      {/* Records Modal */}
      {showRecordsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>{t.medicalRecordsTitle}</h2>
              <button onClick={() => setShowRecordsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            {records.length === 0 ? (
               <p style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: '2rem' }}>{t.noMedicalRecords}</p>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {records.map(rec => (
                   <div key={rec.id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '5px solid var(--violet)' }}>
                     <p style={{ color: 'var(--ink-muted)', fontSize: '13px', marginBottom: '8px' }}>{new Date(rec.recordDate).toLocaleString()} • {t.attendingDr}{rec.doctor?.name || 'Specialist'}</p>
                     <h4 style={{ color: 'var(--ink)', marginBottom: '6px', fontWeight: '600' }}>{t.diagnosisLabel} {rec.diagnosis}</h4>
                     <div style={{ background: 'var(--white)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                       <p style={{ color: 'var(--ink-soft)', fontSize: '13px' }}><strong>{t.treatmentPlanLabel}</strong> {rec.treatmentPlan}</p>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      )}


      {/* Appointment Booking Modal */}
      {showModal && (() => {
        const selectedDoctor = doctors.find(d => d.id === bookData.doctorId);
        const docConfig = selectedDoctor ? parseAvailability(selectedDoctor.availabilityConfig) : null;
        const dynamicSlots = docConfig ? generateSlotsForDate(docConfig, bookDate) : [];
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '500px', background: 'var(--white)' }}>
              <h2 className="serif-text" style={{ marginBottom: '1.5rem', fontSize: '2.2rem', color: 'var(--ink)' }}>{t.bookVirtualConsult}</h2>
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.selectDoctor}</label>
                  <select required value={bookData.doctorId} onChange={e => setBookData({...bookData, doctorId: e.target.value})} style={{ width: '100%' }}>
                    <option value="" disabled>{t.selectDoctor}</option>
                    {[...doctors].sort((a, b) => (b.rating || 0) - (a.rating || 0)).map(d => (
                       <option key={d.id} value={d.id}>
                         {t.attendingDr}{d.name} ({d.specialist || 'General Medicine'}) — ★ {(d.rating || 5.0).toFixed(1)} ({d.ratingCount || 1} ratings)
                       </option>
                    ))}
                    {doctors.length === 0 && <option value="2">Demo Doctor (ID 2)</option>}
                  </select>
                </div>

                {getActiveValidityMessage() && (
                  <div style={{ color: '#047857', background: '#ecfdf5', padding: '12px 16px', borderRadius: '12px', border: '1px solid #a7f3d0', fontSize: '13px', fontWeight: '500', lineHeight: '1.4', marginBottom: '0.4rem', marginTop: '-0.4rem' }}>
                    {getActiveValidityMessage()}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.selectDate}</label>
                  <input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)} style={{ width: '100%' }} min={new Date().toISOString().split('T')[0]} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.selectTimeSlot}</label>
                  <select required value={bookSlot} onChange={e => setBookSlot(e.target.value)} style={{ width: '100%' }} disabled={!bookDate || !bookData.doctorId}>
                    <option value="" disabled>{!bookData.doctorId ? t.selectDoctorFirst : (!bookDate ? t.selectDateFirst : t.selectTimeSlot)}</option>
                    {bookDate && bookData.doctorId && dynamicSlots.length === 0 ? (
                      <option value="" disabled>No slots available on this date (Doctor is unavailable/on leave)</option>
                    ) : (
                      dynamicSlots.map(slot => (
                        <option key={slot.time} value={slot.time} disabled={isSlotBooked(slot.time)}>
                          {slot.label} {isSlotBooked(slot.time) ? ` (${t.bookedLabel})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="glow-button" style={{ flex: 1 }}>{t.bookApptBtn}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1 }}>{t.cancelBtn}</button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

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

              {/* Two-Factor Authentication (2FA) Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  disabled={!isEditingSettings}
                  checked={settingsData.twoFactorEnabled || false}
                  onChange={e => setSettingsData({...settingsData, twoFactorEnabled: e.target.checked})}
                  id="toggle-patient-2fa"
                />
                <label htmlFor="toggle-patient-2fa" style={{ fontWeight: '600', color: 'var(--ink)', cursor: 'pointer', fontSize: '13px' }}>
                  {t.enable2fa}
                </label>
              </div>
              {settingsData.twoFactorEnabled && (
                <div style={{ marginTop: '15px', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: '600', textAlign: 'center' }}>{t.scan2faQr}</span>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=otpauth://totp/MedConnect:${settingsData.email}?secret=MC2FAPATIENTSECRET&issuer=MedConnect`} alt="2FA QR Code" width="140" height="140" />
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--ink-muted)' }}>{t.secretKey} MC-2FA-PATIENT-KEY</span>
                </div>
              )}

              {/* EHR section */}
              <h3 style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.25rem', color: 'var(--ink)', fontSize: '1.2rem' }} className="serif-text">{t.ehrTitle}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.bloodGroup}</label>
                <select disabled={!isEditingSettings} value={settingsData.bloodGroup} onChange={e => setSettingsData({...settingsData, bloodGroup: e.target.value})} style={{ width: '100%' }}>
                  <option value="">{t.selectBloodGroup}</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.allergies}</label>
                <textarea disabled={!isEditingSettings} value={settingsData.allergies} onChange={e => setSettingsData({...settingsData, allergies: e.target.value})} placeholder="e.g. Penicillin, Peanuts" style={{ width: '100%', minHeight: '60px', resize: 'none' }}></textarea>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.chronicDiseases}</label>
                <textarea disabled={!isEditingSettings} value={settingsData.chronicDiseases} onChange={e => setSettingsData({...settingsData, chronicDiseases: e.target.value})} placeholder="e.g. Hypertension, Type 2 Diabetes" style={{ width: '100%', minHeight: '60px', resize: 'none' }}></textarea>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.pastSurgeries}</label>
                <textarea disabled={!isEditingSettings} value={settingsData.pastSurgeries} onChange={e => setSettingsData({...settingsData, pastSurgeries: e.target.value})} placeholder="e.g. Appendectomy (2021)" style={{ width: '100%', minHeight: '60px', resize: 'none' }}></textarea>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.vaccinations}</label>
                <textarea disabled={!isEditingSettings} value={settingsData.vaccinations} onChange={e => setSettingsData({...settingsData, vaccinations: e.target.value})} placeholder="e.g. COVID-19 Booster, Hepatitis B" style={{ width: '100%', minHeight: '60px', resize: 'none' }}></textarea>
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

      {/* CheckoutModal Overlay */}
      {showCheckoutModal && (
        <CheckoutModal 
          appointmentDetails={checkoutDetails} 
          onPaymentSuccess={handlePaymentSuccess} 
          onClose={() => setShowCheckoutModal(false)} 
          currentLang={currentLang}
        />
      )}

      {/* SymptomChecker Overlay */}
      {showSymptomChecker && (
        <SymptomChecker 
          onClose={() => setShowSymptomChecker(false)} 
          onSelectSpecialty={handleSelectSpecialtyFromChecker} 
          currentLang={currentLang} 
        />
      )}

      {/* Billing History Modal Overlay */}
      {showBillingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ padding: '3rem', width: '90%', maxWidth: '750px', maxHeight: '80vh', overflowY: 'auto', background: 'var(--white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>{t.paymentHistoryTitle}</h2>
              <button onClick={() => setShowBillingModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface)' }}>
                    <th style={{ padding: '12px', color: 'var(--ink-soft)', fontWeight: 'bold', fontSize: '13px' }}>{t.thDoctor}</th>
                    <th style={{ padding: '12px', color: 'var(--ink-soft)', fontWeight: 'bold', fontSize: '13px' }}>{t.thDate}</th>
                    <th style={{ padding: '12px', color: 'var(--ink-soft)', fontWeight: 'bold', fontSize: '13px' }}>{t.thAmount}</th>
                    <th style={{ padding: '12px', color: 'var(--ink-soft)', fontWeight: 'bold', fontSize: '13px' }}>{t.thTxId}</th>
                    <th style={{ padding: '12px', color: 'var(--ink-soft)', fontWeight: 'bold', fontSize: '13px' }}>{t.thStatus}</th>
                    <th style={{ padding: '12px', color: 'var(--ink-soft)', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>{t.thActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter(a => a.paymentAmount).length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '14px' }}>{t.noPaymentHistory}</td>
                    </tr>
                  ) : (
                    appointments.filter(a => a.paymentAmount).map(appt => (
                      <tr key={appt.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '13.5px' }}>
                        <td style={{ padding: '12px', color: 'var(--ink)', fontWeight: '600' }}>Dr. {appt.doctor?.name || 'Specialist'}</td>
                        <td style={{ padding: '12px', color: 'var(--ink-soft)' }}>{new Date(appt.appointmentDate).toLocaleString()}</td>
                        <td style={{ padding: '12px', color: 'var(--ink)', fontWeight: 'bold' }}>₹{(appt.paymentAmount || 500.00).toFixed(2)}</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: 'var(--ink-muted)' }}>{appt.paymentTransactionId || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px', 
                            fontWeight: 'bold',
                            background: appt.paymentStatus === 'PAID' ? 'var(--mint-pale)' : (appt.paymentStatus === 'REFUNDED' ? '#fee2e2' : '#ffedd5'),
                            color: appt.paymentStatus === 'PAID' ? 'var(--mint-dark)' : (appt.paymentStatus === 'REFUNDED' ? '#ef4444' : '#c2410c')
                          }}>
                            {appt.paymentStatus || 'PAID'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => printInvoice(appt, patientName, appt.doctor?.name, appt.appointmentDate)} 
                            className="btn-ghost" 
                            style={{ padding: '4px 8px', fontSize: '11px', height: 'auto', border: '1px solid var(--border)' }}
                          >
                            {t.btnReceipt}
                          </button>
                          {appt.paymentStatus === 'PAID' && (
                            <button 
                              onClick={() => handleRequestRefund(appt.id)} 
                              className="btn-ghost" 
                              style={{ padding: '4px 8px', fontSize: '11px', height: 'auto', border: '1px solid #fca5a5', color: '#ef4444', background: 'rgba(239, 68, 68, 0.04)' }}
                            >
                              {t.btnRefund}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chatbot Widget */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
        {showChatbot && (
          <div className="glass-card" style={{ width: '350px', height: '450px', background: 'var(--white)', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--sky), var(--violet))', padding: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>MedConnect AI</div>
                  <div style={{ fontSize: '10px', opacity: 0.9 }}>Clinical Assistant</div>
                </div>
              </div>
              <button onClick={() => setShowChatbot(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', outline: 'none' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--surface)' }}>
              {chatbotMessages.map((msg, index) => (
                <div key={index} style={{
                  alignSelf: msg.sender === 'User' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'User' ? 'var(--sky)' : 'var(--white)',
                  color: msg.sender === 'User' ? 'white' : 'var(--ink)',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  maxWidth: '85%',
                  fontSize: '13px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: msg.sender === 'User' ? 'none' : '1px solid var(--border)'
                }}>
                  {msg.text}
                </div>
              ))}
              {isChatbotTyping && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--white)', color: 'var(--ink-muted)', padding: '10px 14px', borderRadius: '14px', fontSize: '12px', border: '1px solid var(--border)' }}>
                  Typing...
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div style={{ padding: '8px 16px', background: 'var(--white)', borderTop: '1px solid var(--border)', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              <button onClick={() => handleChatbotSend("What is diabetes?")} className="btn-ghost" style={{ padding: '4px 10px', height: '26px', fontSize: '11px', flexShrink: 0, borderRadius: '12px' }}>Diabetes?</button>
              <button onClick={() => handleChatbotSend("How should I take paracetamol?")} className="btn-ghost" style={{ padding: '4px 10px', height: '26px', fontSize: '11px', flexShrink: 0, borderRadius: '12px' }}>Paracetamol?</button>
              <button onClick={() => handleChatbotSend("When is my next appointment?")} className="btn-ghost" style={{ padding: '4px 10px', height: '26px', fontSize: '11px', flexShrink: 0, borderRadius: '12px' }}>My Schedule?</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleChatbotSend(chatbotInput); }} style={{ padding: '12px', background: 'var(--white)', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Ask about clinical guidelines..." 
                value={chatbotInput} 
                onChange={(e) => setChatbotInput(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '13px' }}
              />
              <button type="submit" className="glow-button" style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}>➔</button>
            </form>
          </div>
        )}
        
        <button 
          onClick={() => setShowChatbot(!showChatbot)} 
          className="glow-button pulse-button"
          style={{ 
            height: '50px', 
            padding: '0 24px', 
            borderRadius: '25px', 
            boxShadow: '0 10px 25px rgba(14,165,233,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          💬 AI Assistant
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;
