import React, { useState, useEffect, useRef } from 'react';
import { getPatientAppointments, getPatientRecords, createAppointment, getAllUsers, getAllPrescriptions, cancelAppointment, updateUserProfile, getDoctorConsultations } from '../api';
import toast from 'react-hot-toast';
import VideoConsultation from '../components/VideoConsultation';
import { Video, XCircle, Calendar, FileText, Pill, LogOut } from 'lucide-react';

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
    failedCancelAction: "Failed to execute cancel action."
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
    failedCancelAction: "रद्द करने की कार्रवाई निष्पादित करने में विफल।"
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
    failedCancelAction: "రద్దు చర్యను అమలు చేయడంలో విఫలమైంది."
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
  
  const [showModal, setShowModal] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  
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
      const updated = await updateUserProfile(patientId, payload);
      toast.success(t.profileUpdated);
      localStorage.setItem('userEmail', updated.email);
      loadData();
      setShowSettingsModal(false);
      setIsEditingSettings(false);
    } catch (err) {
      toast.error(t.profileUpdateFailed);
    }
  };

  const loadData = async () => {
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

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookDate || !bookSlot) {
      toast.error(t.selectDateAndSlot);
      return;
    }
    try {
      const localDateTimeStr = `${bookDate}T${bookSlot}`;
      const localDate = new Date(localDateTimeStr);
      await createAppointment({
        patient: { id: patientId },
        doctor: { id: bookData.doctorId },
        appointmentDate: localDate.toISOString(),
        status: 'CONFIRMED'
      });
      setShowModal(false);
      setBookData({ doctorId: '', date: '' });
      setBookDate('');
      setBookSlot('');
      loadData();
      toast.success(t.bookingSuccess);
    } catch (err) {
      toast.error(t.bookingFailed);
    }
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
             loadData();
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
                 <button className="glow-button" style={{ width: '100%', padding: '8px 16px', fontSize: '13px' }} onClick={handleOpenBookingModal}>{t.quickBookCall}</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--coral)' }}>{t.quickMedication}</h3>
                 <button className="btn-ghost" onClick={() => setShowScriptsModal(true)} style={{ background: 'transparent', border: '1.5px solid var(--coral)', color: 'var(--coral)', boxShadow: 'none', width: '100%', padding: '8px 16px', fontSize: '13px', height: 'auto' }}>{t.quickViewScripts}</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--white)' }}>
                 <h3 className="serif-text" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--violet)' }}>{t.quickHistory}</h3>
                 <button className="btn-ghost" onClick={() => setShowRecordsModal(true)} style={{ background: 'transparent', border: '1.5px solid var(--violet)', color: 'var(--violet)', boxShadow: 'none', width: '100%', padding: '8px 16px', fontSize: '13px', height: 'auto' }}>{t.quickViewRecords}</button>
              </div>
            </div>

            {/* Upcoming Appointments List */}
            <div className="glass-card" style={{ padding: '2.5rem', background: 'var(--white)' }}>
              <h3 className="serif-text" style={{ marginBottom: '1.5rem', color: 'var(--ink)', fontSize: '1.8rem' }}>{t.upcomingAppts}</h3>
              {appointments.filter(a => a.status !== 'COMPLETED').length === 0 ? (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>{t.myPrescriptions}</h2>
              <button onClick={() => setShowScriptsModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
            </div>
            {scripts.length === 0 ? (
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
                     {!rx.isFulfilled && (
                       <div style={{ marginTop: '0.8rem', padding: '10px 14px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: 'var(--sky)', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                         <span>{t.handoverLegitCode}</span>
                         <span style={{ fontFamily: 'monospace', letterSpacing: '0.5px', background: 'var(--white)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '14px', color: 'var(--ink)' }}>{rx.verificationCode || 'Generating...'}</span>
                         <span style={{ color: 'var(--ink-muted)', fontSize: '11px', fontWeight: 'normal' }}>{t.shareWithPharmacistOnly}</span>
                       </div>
                     )}
                   </div>
                 ))}
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
      {showModal && (
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.selectDate}</label>
                <input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)} style={{ width: '100%' }} min={new Date().toISOString().split('T')[0]} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-soft)' }}>{t.selectTimeSlot}</label>
                <select required value={bookSlot} onChange={e => setBookSlot(e.target.value)} style={{ width: '100%' }} disabled={!bookDate || !bookData.doctorId}>
                  <option value="" disabled>{!bookData.doctorId ? t.selectDoctorFirst : (!bookDate ? t.selectDateFirst : t.selectTimeSlot)}</option>
                  {TIME_SLOTS.map(slot => {
                    const isEmergency = slot.time === '08:00';
                    const displayLabel = isEmergency ? (currentLang === 'hi' ? '08:00 AM (आपातकालीन मामला)' : (currentLang === 'te' ? '08:00 AM (అత్యవసర కేసు)' : slot.label)) : slot.label;
                    return (
                      <option key={slot.time} value={slot.time} disabled={isSlotBooked(slot.time)}>
                        {displayLabel} {isSlotBooked(slot.time) ? ` (${t.bookedLabel})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="glow-button" style={{ flex: 1 }}>{t.bookApptBtn}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1 }}>{t.cancelBtn}</button>
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

export default PatientDashboard;
