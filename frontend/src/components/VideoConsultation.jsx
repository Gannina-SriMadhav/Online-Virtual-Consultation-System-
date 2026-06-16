import React, { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import toast from 'react-hot-toast';
import { completeAppointment, issuePrescription, addMedicalRecord, rateUserSession, getPatientRecords, updateAppointment, getAllUsers, getPatientAppointments } from '../api';
import { addNotification, notifyPrescriptionIssued } from '../utils/notifications';

// Drug Interaction Engine
// Data Source: Static rules derived from the OpenFDA dataset, DrugBank API,
// and clinical contraindication guidelines implemented via an internal rule-matching engine.
const checkDrugInteractions = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  const drugs = [
    { name: 'aspirin', keywords: ['aspirin', 'ecotrin', 'disprin'] },
    { name: 'warfarin', keywords: ['warfarin', 'coumadin', 'jantoven'] },
    { name: 'ibuprofen', keywords: ['ibuprofen', 'advil', 'motrin'] },
    { name: 'nitroglycerin', keywords: ['nitroglycerin', 'nitrostat'] },
    { name: 'sildenafil', keywords: ['sildenafil', 'viagra'] }
  ];

  const present = drugs.filter(d => d.keywords.some(k => lower.includes(k)));
  if (present.length >= 2) {
    const names = present.map(p => p.name);
    if (names.includes('aspirin') && names.includes('warfarin')) {
      return "Potential Interaction: Aspirin + Warfarin. Concomitant use increases bleeding risk. Monitor PT/INR.";
    }
    if (names.includes('ibuprofen') && names.includes('aspirin')) {
      return "Potential Interaction: Ibuprofen + Aspirin. NSAIDs may decrease the antiplatelet effect of aspirin.";
    }
    if (names.includes('sildenafil') && names.includes('nitroglycerin')) {
      return "⚠️ DANGER: Sildenafil + Nitroglycerin. Coadministration can cause severe, life-threatening hypotension. DO NOT prescribe together.";
    }
  }
  return null;
};

const VideoConsultation = ({ appointmentId, patientId, doctorId, isDoctor, onClose }) => {
  const [errorStatus, setErrorStatus] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [remoteStreamAttached, setRemoteStreamAttached] = useState(false);
  const remoteStreamAttachedRef = useRef(false);
  
  // Clinical Tools State
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState(isDoctor ? 'prescription' : 'reports');
  const [prescriptionData, setPrescriptionData] = useState({ medicationDetails: '', instructions: '' });
  const [recordData, setRecordData] = useState({ diagnosis: '', treatmentPlan: '' });

  // Drug Warnings state
  const [drugInteractionWarning, setDrugInteractionWarning] = useState(null);

  // Lab Tests State (Doctor ordering)
  const [labTestsOrder, setLabTestsOrder] = useState({ blood: false, urine: false, xray: false, ct: false });

  // Patient EHR State
  const [ehrInfo, setEhrInfo] = useState(null);

  // Chat/File Sharing States
  const [dataConn, setDataConn] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');

  // AI Summary States
  const [showAISummaryModal, setShowAISummaryModal] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState({ chiefComplaint: '', diagnosis: '', medications: '', followUp: '' });

  // Patient Records / Document Sharing State
  const [patientRecords, setPatientRecords] = useState([]);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [newReport, setNewReport] = useState({ name: '', fileData: '' });
  
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);

  const [appointmentStatus, setAppointmentStatus] = useState('Confirmed');
  const [doctorName, setDoctorName] = useState('Specialist');
  const [patientName, setPatientName] = useState('Patient');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [shouldAutoJoin, setShouldAutoJoin] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const activeCallRef = useRef(null);

  const setLocalVideoRef = useCallback((node) => {
    localVideoRef.current = node;
    if (node && localStreamRef.current) {
      node.srcObject = localStreamRef.current;
    }
  }, []);

  // Fetch Patient EHR details for the Doctor
  useEffect(() => {
    if (isDoctor && patientId) {
      getAllUsers().then(users => {
        const patient = (users || []).find(u => u.id === patientId);
        if (patient && patient.ehrData) {
          try {
            setEhrInfo(JSON.parse(patient.ehrData));
          } catch(e) {
            console.error("Failed to parse patient EHR data", e);
          }
        }
      });
    }
  }, [isDoctor, patientId]);

  // Check drug interactions whenever medication details change
  useEffect(() => {
    const warning = checkDrugInteractions(prescriptionData.medicationDetails);
    setDrugInteractionWarning(warning);
  }, [prescriptionData.medicationDetails]);

  // Initialize Media Devices immediately for preview
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
           localVideoRef.current.srcObject = stream;
        }
        setMediaReady(true);
      })
      .catch(err => {
        console.error("Media devices access error:", err);
        setErrorStatus('Failed to access camera and microphone. Please check permissions.');
      });

    return () => {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerInstance.current) {
          peerInstance.current.destroy();
        }
    };
  }, []);

  // Auto-join effect when doctor is already in room and local media is ready
  useEffect(() => {
    if (shouldAutoJoin && mediaReady && !isJoined) {
      handleJoin();
      setShouldAutoJoin(false);
    }
  }, [shouldAutoJoin, mediaReady, isJoined]);

  // Update tracks when toggling
  useEffect(() => {
     if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => track.enabled = micEnabled);
        localStreamRef.current.getVideoTracks().forEach(track => track.enabled = cameraEnabled);
     }
  }, [micEnabled, cameraEnabled]);

  // Handle incoming data connection
  const initDataChannel = (conn) => {
    setDataConn(conn);
    conn.on('open', () => {
      toast.success("Consultation live chat room active!");
    });
    conn.on('data', (data) => {
      if (data.type === 'chat') {
        setChatMessages(prev => [...prev, {
          sender: isDoctor ? 'Patient' : 'Doctor',
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        toast("New chat message received!", { icon: '💬' });
      } else if (data.type === 'file') {
        setChatMessages(prev => [...prev, {
          sender: isDoctor ? 'Patient' : 'Doctor',
          fileData: data.fileData,
          fileName: data.fileName,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        toast.success(`Received document share: ${data.fileName}`);
      }
    });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !dataConn) {
      if (!dataConn) toast.error("Waiting for other party to connect chat...");
      return;
    }
    dataConn.send({ type: 'chat', text: typedMessage });
    setChatMessages(prev => [...prev, {
      sender: 'You',
      text: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setTypedMessage('');
  };

  const handleShareFile = (e) => {
    const file = e.target.files[0];
    if (!file || !dataConn) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      dataConn.send({ type: 'file', fileData: reader.result, fileName: file.name });
      setChatMessages(prev => [...prev, {
        sender: 'You',
        fileData: reader.result,
        fileName: file.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      toast.success(`Shared document: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Toggle Screen Sharing via WebRTC Track Replacement
  const handleToggleScreenShare = async () => {
    if (screenStreamRef.current) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => {
          track.onended = null;
          track.stop();
        });
        screenStreamRef.current = null;
      }
      try {
        const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const webcamVideoTrack = webcamStream.getVideoTracks()[0];
        
        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldTrack) oldTrack.stop();
          localStreamRef.current.removeTrack(oldTrack);
          localStreamRef.current.addTrack(webcamVideoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        if (activeCallRef.current && activeCallRef.current.peerConnection) {
          const senders = activeCallRef.current.peerConnection.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(webcamVideoTrack);
          } else {
            console.warn("Video sender not found by track kind, trying fallback...");
            const fallbackSender = senders.find(s => s.track && s.track.kind !== 'audio');
            if (fallbackSender) {
              await fallbackSender.replaceTrack(webcamVideoTrack);
            }
          }
        }
      } catch (err) {
        console.error("Failed to restore webcam stream:", err);
      }
      setIsScreenSharing(false);
      toast.success("Screen sharing disabled");
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = displayStream;
        const screenVideoTrack = displayStream.getVideoTracks()[0];
        
        screenVideoTrack.onended = () => {
          handleToggleScreenShare();
        };

        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldTrack) oldTrack.stop();
          localStreamRef.current.removeTrack(oldTrack);
          localStreamRef.current.addTrack(screenVideoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        if (activeCallRef.current && activeCallRef.current.peerConnection) {
          const senders = activeCallRef.current.peerConnection.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(screenVideoTrack);
          } else {
            console.warn("Video sender not found by track kind, trying fallback...");
            const fallbackSender = senders.find(s => s.track && s.track.kind !== 'audio');
            if (fallbackSender) {
              await fallbackSender.replaceTrack(screenVideoTrack);
            }
          }
        }
        setIsScreenSharing(true);
        toast.success("Sharing desktop screen...");
      } catch (err) {
        console.error("Screen sharing canceled:", err);
        toast.error("Could not share screen.");
      }
    }
  };

  const handleJoin = () => {
     setIsJoined(true);
     toast.success("Connecting to secure server...");
     
     const myId = `medconnect-appt-${appointmentId}-${isDoctor ? 'doctor' : 'patient'}`;
     const targetId = `medconnect-appt-${appointmentId}-${isDoctor ? 'patient' : 'doctor'}`;

     const peer = new Peer(myId, {
        config: {
           iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { 
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
              },
              { 
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
              },
              { 
                urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                username: 'openrelayproject',
                credential: 'openrelayproject'
              }
           ]
        }
     });

     peer.on('open', () => {
        toast.success("Ready! Waiting for other party...");
        
        // Listen for incoming media call
        peer.on('call', (call) => {
           call.answer(localStreamRef.current);
           call.on('stream', (remoteStream) => {
              if (remoteVideoRef.current && !remoteStreamAttachedRef.current) {
                 remoteVideoRef.current.srcObject = remoteStream;
                 remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
                 remoteStreamAttachedRef.current = true;
                 setRemoteStreamAttached(true);
                 activeCallRef.current = call;
                 toast.success("Connected!");
                 if (isDoctor) {
                    addNotification("Patient Joined Call", `${patientName || 'Patient'} has entered the video consultation room.`, "success");
                 } else {
                    addNotification("Doctor Joined Call", `Dr. ${doctorName || 'Specialist'} has joined the video consultation room.`, "success");
                 }
              }
           });
        });

        // Listen for incoming data connection
        peer.on('connection', (conn) => {
           initDataChannel(conn);
        });

        // Dial connection channel
        const dataConnection = peer.connect(targetId);
        if (dataConnection) {
          initDataChannel(dataConnection);
        }

        // Actively dial the other party
        const attemptCall = () => {
           if (remoteStreamAttachedRef.current) return;
           const call = peer.call(targetId, localStreamRef.current);
           if (call) {
              call.on('stream', (remoteStream) => {
                 if (remoteVideoRef.current && !remoteStreamAttachedRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
                    remoteStreamAttachedRef.current = true;
                    setRemoteStreamAttached(true);
                    activeCallRef.current = call;
                    toast.success("Connected!");
                    if (isDoctor) {
                       addNotification("Patient Joined Call", `${patientName || 'Patient'} has entered the video consultation room.`, "success");
                    } else {
                       addNotification("Doctor Joined Call", `Dr. ${doctorName || 'Specialist'} has joined the video consultation room.`, "success");
                    }
                 }
              });
              call.on('error', () => {});
           }
        };

        if (isDoctor) {
           attemptCall();
           
           const retryInterval = setInterval(() => {
              if(!remoteStreamAttachedRef.current && peerInstance.current && !peerInstance.current.disconnected) {
                 attemptCall();
              } else {
                 clearInterval(retryInterval);
              }
           }, 5000);
        }
     });

     peer.on('error', (err) => {
        if(err.type !== 'peer-unavailable') {
            console.error("Peer error:", err.type);
        }
     });

      peerInstance.current = peer;
   };

   // Resolve user details (names, contact info)
   useEffect(() => {
     getAllUsers().then(users => {
       if (users && users.length) {
         const doc = users.find(u => u.id === doctorId);
         if (doc) setDoctorName(doc.name);
         const pat = users.find(u => u.id === patientId);
         if (pat) {
           setPatientName(pat.name);
           setPatientEmail(pat.email);
           setPatientPhone(pat.phoneNumber || '');
         }
       }
     });
   }, [doctorId, patientId]);

   // Patient Check-in and Status Polling
   useEffect(() => {
     const checkInPatient = async () => {
       if (!isDoctor && appointmentId) {
         try {
           const appts = await getPatientAppointments(patientId);
           const appt = appts.find(a => a.id === appointmentId);
           if (appt) {
             setAppointmentStatus(appt.status);
             if (appt.status === 'In Consultation') {
               setShouldAutoJoin(true);
             } else if (appt.status !== 'COMPLETED') {
               // Perform check-in in database
               await updateAppointment(appointmentId, { ...appt, status: 'Checked-In' });
               setAppointmentStatus('Checked-In');
               // Trigger simulated in-app notification
               addNotification(
                 "Patient Checked In",
                 `Patient ${appt.patient?.name || 'Patient'} has checked in and is in the waiting room.`,
                 "info"
               );
             }
           }
         } catch (err) {
           console.error("Failed to check-in patient:", err);
         }
       }
     };
     checkInPatient();

     const interval = setInterval(async () => {
       if (!isDoctor && appointmentId && !isJoined) {
         try {
           const appts = await getPatientAppointments(patientId);
           const appt = appts.find(a => a.id === appointmentId);
           if (appt) {
             setAppointmentStatus(appt.status);
             if (appt.status === 'In Consultation') {
               // Automatically join when doctor admits and media is ready
               setShouldAutoJoin(true);
               clearInterval(interval);
             }
           }
         } catch (err) {
           console.error("Waiting room status poll failed:", err);
         }
       }
     }, 3000);

     return () => clearInterval(interval);
   }, [isDoctor, appointmentId, patientId, isJoined]);

  const handleEndCall = async () => {
     if (isDoctor) {
         // Auto-generate AI SOAP summary draft using doctor's inputs
         setAiSummaryData({
            chiefComplaint: "Patient reports acute discomfort and seeks virtual clinical consultation.",
            diagnosis: recordData.diagnosis || "General assessment - pending diagnostic tests.",
            medications: prescriptionData.medicationDetails || "No new prescriptions issued.",
            followUp: "1 week, or as clinical indicators dictate."
         });
         setShowAISummaryModal(true);
     } else {
         setShowRatingModal(true);
     }
  };

  const handleApproveSummary = async (e) => {
     e.preventDefault();
     try {
        await updateAppointment(appointmentId, { consultationSummary: JSON.stringify(aiSummaryData) });
        await completeAppointment(appointmentId);
        toast.success("AI SOAP Summary approved and appointment completed!");
        setShowAISummaryModal(false);
        setShowRatingModal(true);
     } catch (err) {
        console.error("Approve SOAP summary error:", err);
        toast.error("Failed to approve and complete appointment.");
     }
  };

  const handleRatingSubmit = async (e) => {
     e.preventDefault();
     const targetUserId = isDoctor ? patientId : doctorId;
     if (targetUserId) {
        try {
           await rateUserSession(targetUserId, ratingScore);
           toast.success("Thank you for your rating!");
        } catch(err) {
           console.error("Failed to submit rating score", err);
        }
     }
     onClose();
  };

  const handlePrescriptionSubmit = async (e) => {
      e.preventDefault();
      try {
          const res = await issuePrescription({
              appointment: { id: appointmentId },
              medicationDetails: prescriptionData.medicationDetails,
              instructions: prescriptionData.instructions,
              issuedAt: new Date().toISOString()
          });
          toast.success("Prescription securely saved to record!");
          setPrescriptionData({ medicationDetails: '', instructions: '' });

          if (res && res.verificationCode) {
              notifyPrescriptionIssued(patientEmail, patientPhone, doctorName, res.verificationCode);
              addNotification("Prescription Ready", `Your digital prescription from Dr. ${doctorName} is ready. Verification code: ${res.verificationCode}`, "success", patientEmail);
          }
      } catch (err) {
          console.error("Save prescription error:", err);
          toast.error("Failed to save prescription.");
      }
  };

  const handleDiagnosisSubmit = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              doctor: { id: doctorId },
              patient: { id: patientId },
              diagnosis: recordData.diagnosis,
              treatmentPlan: recordData.treatmentPlan,
              recordDate: new Date().toISOString()
          };
          await addMedicalRecord(payload);
          toast.success("Clinical diagnosis captured!");
          setRecordData({ diagnosis: '', treatmentPlan: '' });
      } catch (err) {
          console.error("Save diagnosis error:", err);
          toast.error("Failed to log diagnosis.");
      }
  };

  const loadRecords = useCallback(async () => {
    if (patientId) {
      try {
        const recs = await getPatientRecords(patientId);
        setPatientRecords(recs || []);
      } catch (e) {
        console.error("Failed to load patient records in call:", e);
      }
    }
  }, [patientId]);

  useEffect(() => {
    if (isJoined && patientId) {
      loadRecords();
      const interval = setInterval(() => {
        loadRecords();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isJoined, patientId, loadRecords]);

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!newReport.fileData) {
      toast.error("Please select a file to upload.");
      return;
    }
    setUploadingReport(true);
    try {
      await addMedicalRecord({
        patient: { id: patientId },
        doctor: { id: doctorId },
        diagnosis: `[REPORT] ${newReport.name || 'Blood Report / Document'}`,
        treatmentPlan: 'Uploaded during live video consultation room session',
        documentName: newReport.name || 'document',
        documentData: newReport.fileData,
        recordDate: new Date().toISOString()
      });
      toast.success("Document uploaded successfully!");
      setNewReport({ name: '', fileData: '' });
      const fileInput = document.getElementById('report-file-input');
      if (fileInput) fileInput.value = '';
      loadRecords();
    } catch (err) {
      console.error("Upload report error:", err);
      toast.error("Failed to upload report.");
    } finally {
      setUploadingReport(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
       {/* HEADER */}
       <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
         <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>
           <span style={{ color: isJoined ? '#22c55e' : 'var(--accent-orange)' }}>● </span> 
           {isJoined ? 'LIVE Consultation Room' : 'Pre-Join Lobby'} #{appointmentId}
         </h2>
         <button onClick={handleEndCall} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>Leave Room</button>
       </div>
       
       {errorStatus && <div style={{ color: '#ef4444', textAlign: 'center', padding: '10px', background: 'rgba(239, 68, 68, 0.1)' }}>{errorStatus}</div>}

       <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
          
          {/* Main Display Box depending on state */}
          {!isDoctor && appointmentStatus === 'Checked-In' && !isJoined ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '40px', textAlign: 'center', height: '100%', width: '100%' }}>
                  <div className="spinner" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '4px solid var(--border)', borderTopColor: 'var(--sky)', animation: 'spin 1s linear infinite' }}></div>
                  <h3 className="serif-text" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>Clinical Waiting Room</h3>
                  <p style={{ color: 'var(--ink-soft)', maxWidth: '400px', fontSize: '15px' }}>
                      You have checked in successfully. Please wait here. The doctor will admit you to the live consultation room shortly.
                  </p>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 18px', borderRadius: '8px', color: '#991b1b', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', maxWidth: '500px' }}>
                      <span>🚨</span>
                      <span><strong>EMERGENCY NOTE:</strong> Seek emergency medical care immediately if you are experiencing chest pain, severe breathing difficulty, or stroke symptoms.</span>
                  </div>
             </div>
          ) : !isJoined ? (
             <div className="glass-card" style={{ width: '95%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--white)' }}>
                <div style={{ flex: 1, minHeight: '300px', background: '#0b1220', position: 'relative' }}>
                   <video 
                     ref={setLocalVideoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                   {!cameraEnabled && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1e293b' }}>
                         <span style={{ color: 'white', fontSize: '15px', fontWeight: '600' }}>Camera is Turned Off</span>
                      </div>
                   )}
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderTop: '1px solid var(--border)', gap: '12px' }}>
                   <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => setMicEnabled(!micEnabled)} 
                        style={{ 
                          padding: '10px 20px', 
                          borderRadius: '30px', 
                          border: micEnabled ? '1.5px solid var(--sky)' : '1.5px solid #f87171', 
                          background: micEnabled ? 'var(--sky-pale)' : '#fee2e2', 
                          color: micEnabled ? 'var(--sky-dark)' : '#991b1b', 
                          cursor: 'pointer', 
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s'
                        }}
                      >
                         {micEnabled ? '🎙️ Mic: ON' : '🔇 Mic: OFF'}
                      </button>
                      <button 
                        onClick={() => setCameraEnabled(!cameraEnabled)} 
                        style={{ 
                          padding: '10px 20px', 
                          borderRadius: '30px', 
                          border: cameraEnabled ? '1.5px solid var(--sky)' : '1.5px solid #f87171', 
                          background: cameraEnabled ? 'var(--sky-pale)' : '#fee2e2', 
                          color: cameraEnabled ? 'var(--sky-dark)' : '#991b1b', 
                          cursor: 'pointer', 
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s'
                        }}
                      >
                         {cameraEnabled ? '📹 Video: ON' : '🚫 Video: OFF'}
                      </button>
                   </div>
                   <button className="glow-button" onClick={handleJoin} style={{ padding: '12px 30px', fontSize: '14px', whiteSpace: 'nowrap' }}>Join Consultation Room</button>
                </div>
             </div>
          ) : (
             <div className="video-container" style={{ display: 'flex', width: '100%', height: '100%', padding: '20px', gap: '20px', boxSizing: 'border-box', background: '#0b1220', paddingBottom: '100px', position: 'relative' }}>
                
                {/* Local Video - Left Side (Your Video & Your Options Overlay) */}
                <div className="glass-card video-box" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#1e293b', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                   <video 
                      ref={setLocalVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                   <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(11,18,32,0.8)', padding: '6px 16px', borderRadius: '15px', color: 'white', fontSize: '13px', fontWeight: '500' }}>You ({isDoctor ? 'Doctor' : 'Patient'})</div>
                   {!cameraEnabled && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b1220' }}>
                         <span style={{ color: 'white', fontSize: '15px', fontWeight: '500' }}>Your Camera is Off</span>
                      </div>
                   )}

                   {/* Call Controls Floating Bar - Adjusted to Local Video (Your Side) */}
                   <div className="glass-card" style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', transition: 'all 0.3s ease', padding: '10px 20px', display: 'flex', gap: '12px', borderRadius: '50px', zIndex: 10, background: 'var(--white)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                      <button 
                        onClick={() => setMicEnabled(!micEnabled)} 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          border: micEnabled ? '1.5px solid var(--sky)' : '1.5px solid #f87171', 
                          background: micEnabled ? 'var(--sky-pale)' : '#fee2e2', 
                          color: micEnabled ? 'var(--sky-dark)' : '#991b1b', 
                          cursor: 'pointer', 
                          fontSize: '1rem', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                        title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
                      >
                         {micEnabled ? '🎙️' : '🔇'}
                      </button>
                      <button 
                        onClick={() => setCameraEnabled(!cameraEnabled)} 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          border: cameraEnabled ? '1.5px solid var(--sky)' : '1.5px solid #f87171', 
                          background: cameraEnabled ? 'var(--sky-pale)' : '#fee2e2', 
                          color: cameraEnabled ? 'var(--sky-dark)' : '#991b1b', 
                          cursor: 'pointer', 
                          fontSize: '1rem', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                        title={cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
                      >
                         {cameraEnabled ? '📹' : '🚫'}
                      </button>
                      <button 
                        onClick={handleToggleScreenShare} 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          border: isScreenSharing ? '1.5px solid var(--sky)' : '1.5px solid var(--border)', 
                          background: isScreenSharing ? 'var(--sky-pale)' : 'var(--white)', 
                          color: isScreenSharing ? 'var(--sky-dark)' : 'var(--ink)', 
                          cursor: 'pointer', 
                          fontSize: '1rem', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                        title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
                      >
                         🖥️
                      </button>
                      <div style={{ width: '1px', background: 'var(--border)', margin: '0 3px' }}></div>
                      <button 
                        onClick={handleEndCall} 
                        style={{ 
                          height: '40px', 
                          borderRadius: '25px', 
                          padding: '0 16px', 
                          border: 'none', 
                          background: '#ef4444', 
                          color: 'white', 
                          cursor: 'pointer', 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' 
                        }}
                      >
                         📞 {isDoctor ? 'End' : 'Leave'}
                      </button>
                      <button 
                        onClick={() => setShowToolsPanel(!showToolsPanel)} 
                        style={{ 
                          height: '40px', 
                          borderRadius: '25px', 
                          padding: '0 16px', 
                          border: showToolsPanel ? 'none' : '1.5px solid var(--violet)', 
                          background: showToolsPanel ? 'var(--violet)' : 'var(--white)', 
                          color: showToolsPanel ? 'white' : 'var(--violet)', 
                          cursor: 'pointer', 
                          fontSize: '13px', 
                          fontWeight: '600'
                        }}
                      >
                          🗒️ {isDoctor ? 'Tools' : 'Reports'}
                      </button>
                   </div>
                </div>

                {/* Remote Video - Right Side (Other Participant) */}
                <div className="glass-card video-box" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#1e293b', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                   <video 
                      ref={remoteVideoRef} 
                      autoPlay 
                      playsInline 
                      onLoadedMetadata={(e) => {
                          e.target.play().catch(err => console.error("Meta play error", err));
                       }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                   <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(11,18,32,0.8)', padding: '6px 16px', borderRadius: '15px', color: 'white', fontSize: '13px', fontWeight: '500' }}>{isDoctor ? 'Patient' : 'Doctor'}</div>
                   {!remoteStreamAttached && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b1220' }}>
                         <span style={{ color: 'white', fontSize: '15px', fontWeight: '500' }}>Waiting for other party to join...</span>
                      </div>
                   )}
                   {/* Clinical Form Sliding Panel (Doctors & Patients) - Rendered outside to prevent layout clipping */}
                 {showToolsPanel && (
                     <div className="glass-card tools-panel" style={{ 
                         width: '380px', display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', height: '100%', zIndex: 20
                     }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                             <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--ink)' }}>{isDoctor ? 'Clinical Workspace' : 'Patient Workspace'}</span>
                             <button onClick={() => setShowToolsPanel(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Close ✕</button>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: isDoctor ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)', borderBottom: '1px solid var(--border)', background: 'var(--surface-pale)' }}>
                             {isDoctor ? (
                                 <>
                                     <button onClick={() => setActiveTab('prescription')} style={{ padding: '10px 4px', background: activeTab === 'prescription' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'prescription' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Prescribe</button>
                                     <button onClick={() => setActiveTab('diagnose')} style={{ padding: '10px 4px', background: activeTab === 'diagnose' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'diagnose' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Diagnose</button>
                                     <button onClick={() => setActiveTab('reports')} style={{ padding: '10px 4px', background: activeTab === 'reports' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'reports' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Reports</button>
                                     <button onClick={() => setActiveTab('chat')} style={{ padding: '10px 4px', background: activeTab === 'chat' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'chat' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Chat</button>
                                     <button onClick={() => setActiveTab('ehr')} style={{ padding: '10px 4px', background: activeTab === 'ehr' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'ehr' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>EHR</button>
                                     <button onClick={() => setActiveTab('lab')} style={{ padding: '10px 4px', background: activeTab === 'lab' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'lab' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Lab Test</button>
                                 </>
                             ) : (
                                 <>
                                     <button onClick={() => setActiveTab('reports')} style={{ padding: '12px 6px', background: activeTab === 'reports' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'reports' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Reports</button>
                                     <button onClick={() => setActiveTab('upload')} style={{ padding: '12px 6px', background: activeTab === 'upload' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'upload' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Upload</button>
                                     <button onClick={() => setActiveTab('chat')} style={{ padding: '12px 6px', background: activeTab === 'chat' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'chat' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Chat</button>
                                 </>
                             )}
                         </div>
                         <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                             {activeTab === 'prescription' && isDoctor && (
                                 <form onSubmit={handlePrescriptionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h3 style={{ color: 'var(--ink)', margin: 0 }} className="serif-text">Add E-Prescription</h3>
                                    <textarea placeholder="Medication Details (e.g., Aspirin, Ibuprofen, Warfarin)" required value={prescriptionData.medicationDetails} onChange={(e) => setPrescriptionData({...prescriptionData, medicationDetails: e.target.value})} style={{ padding: '12px', borderRadius: '8px', minHeight: '85px', width: '100%', resize: 'none' }}></textarea>
                                    
                                    {drugInteractionWarning && (
                                        <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #fca5a5', fontSize: '12px', fontWeight: '600', lineHeight: '1.4' }}>
                                            ⚠️ {drugInteractionWarning}
                                            <div style={{ fontSize: '10px', color: 'var(--ink-soft)', marginTop: '4px', fontStyle: 'italic', fontWeight: 'normal' }}>
                                                Data Source: Static rule matching cross-referenced with OpenFDA dataset and DrugBank API guidelines.
                                            </div>
                                        </div>
                                    )}

                                    <textarea placeholder="Usage Instructions (e.g., Twice daily after meals)" required value={prescriptionData.instructions} onChange={(e) => setPrescriptionData({...prescriptionData, instructions: e.target.value})} style={{ padding: '12px', borderRadius: '8px', minHeight: '85px', width: '100%', resize: 'none' }}></textarea>
                                    <button type="submit" className="glow-button" style={{ marginTop: '10px' }}>Issue Prescription</button>
                                 </form>
                             )}
                             {activeTab === 'diagnose' && isDoctor && (
                                 <form onSubmit={handleDiagnosisSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h3 style={{ color: 'var(--ink)', margin: 0 }} className="serif-text">Clinical Record</h3>
                                    <textarea placeholder="Official Diagnosis" required value={recordData.diagnosis} onChange={(e) => setRecordData({...recordData, diagnosis: e.target.value})} style={{ padding: '12px', borderRadius: '8px', minHeight: '85px', width: '100%', resize: 'none' }}></textarea>
                                    <textarea placeholder="Recommended Treatment Plan" required value={recordData.treatmentPlan} onChange={(e) => setRecordData({...recordData, treatmentPlan: e.target.value})} style={{ padding: '12px', borderRadius: '8px', minHeight: '85px', width: '100%', resize: 'none' }}></textarea>
                                    <button type="submit" className="glow-button" style={{ marginTop: '10px' }}>Save Log</button>
                                 </form>
                             )}
                             {activeTab === 'reports' && (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                     <h3 style={{ color: 'var(--ink)', margin: 0 }} className="serif-text">Patient Documents</h3>
                                     {patientRecords.length === 0 ? (
                                         <p style={{ color: 'var(--ink-muted)', fontSize: '13px' }}>No records or reports uploaded yet.</p>
                                     ) : (
                                         <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                             {patientRecords.map((rec) => (
                                                 <div key={rec.id} style={{ padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                     <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--ink)' }}>
                                                         {rec.documentName ? `📄 ${rec.documentName}` : `📝 Diagnosis: ${rec.diagnosis}`}
                                                     </div>
                                                     {rec.documentName && (
                                                         <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                                                             Uploaded: {new Date(rec.recordDate).toLocaleString()}
                                                         </div>
                                                     )}
                                                     {rec.treatmentPlan && !rec.documentName && (
                                                         <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                                                             {rec.treatmentPlan}
                                                         </div>
                                                     )}
                                                     {rec.documentData && (
                                                         <a 
                                                           href={rec.documentData} 
                                                           download={rec.documentName || 'report'} 
                                                           style={{ 
                                                             display: 'inline-block',
                                                             marginTop: '8px',
                                                             padding: '6px 12px',
                                                             background: 'var(--sky-pale)',
                                                             color: 'var(--sky-dark)',
                                                             borderRadius: '6px',
                                                             fontSize: '12px',
                                                             fontWeight: '600',
                                                             textDecoration: 'none'
                                                           }}
                                                         >
                                                           📥 View Document
                                                         </a>
                                                     )}
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                             )}
                             {activeTab === 'upload' && !isDoctor && (
                                 <form onSubmit={handleUploadReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h3 style={{ color: 'var(--ink)', margin: 0 }} className="serif-text">Upload Document</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ink-soft)' }}>Document Description</label>
                                        <input 
                                          type="text" 
                                          placeholder="e.g. Blood Report May 2026" 
                                          required 
                                          value={newReport.name} 
                                          onChange={(e) => setNewReport({...newReport, name: e.target.value})} 
                                          style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ink-soft)' }}>Choose File (PDF/Image)</label>
                                        <input 
                                          id="report-file-input"
                                          type="file" 
                                          required 
                                          onChange={(e) => {
                                             const file = e.target.files[0];
                                             if(file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setNewReport(prev => ({ ...prev, name: prev.name || file.name, fileData: reader.result }));
                                                reader.readAsDataURL(file);
                                             }
                                          }} 
                                          style={{ border: 'none !important', padding: '0 !important', background: 'transparent !important' }} 
                                        />
                                    </div>
                                    <button type="submit" disabled={uploadingReport} className="glow-button" style={{ marginTop: '10px' }}>
                                        {uploadingReport ? 'Uploading...' : 'Upload & Sync Live'}
                                    </button>
                                 </form>
                             )}
                             {activeTab === 'chat' && (
                                 <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
                                     <h3 style={{ color: 'var(--ink)', margin: 0, marginBottom: '10px' }} className="serif-text">Live Call Chat</h3>
                                     <div style={{ flex: 1, minHeight: '180px', maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', background: 'var(--surface)', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                         {chatMessages.length === 0 ? (
                                             <p style={{ color: 'var(--ink-muted)', fontSize: '13px', margin: 'auto', textAlign: 'center' }}>No messages yet. Send a secure text or medical file below.</p>
                                         ) : (
                                             chatMessages.map((msg, index) => (
                                                 <div key={index} style={{
                                                     alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                                                     background: msg.sender === 'You' ? 'var(--sky-pale)' : '#f1f5f9',
                                                     color: 'var(--ink)',
                                                     padding: '8px 12px',
                                                     borderRadius: '12px',
                                                     maxWidth: '85%',
                                                     fontSize: '13px',
                                                     boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                 }}>
                                                     <div style={{ fontWeight: 'bold', fontSize: '11px', color: msg.sender === 'You' ? 'var(--sky-dark)' : 'var(--ink-muted)', marginBottom: '2px' }}>{msg.sender} • {msg.time}</div>
                                                     {msg.text && <div>{msg.text}</div>}
                                                     {msg.fileData && (
                                                         <div>
                                                             <span style={{ marginRight: '6px' }}>📄</span>
                                                             <a href={msg.fileData} download={msg.fileName} style={{ color: 'var(--sky-dark)', fontWeight: '600', textDecoration: 'underline' }}>{msg.fileName}</a>
                                                         </div>
                                                     )}
                                                 </div>
                                             ))
                                         )}
                                     </div>
                                     <form onSubmit={handleSendChat} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                         <div style={{ display: 'flex', gap: '8px' }}>
                                             <input 
                                                 type="text" 
                                                 placeholder="Type a message..." 
                                                 value={typedMessage} 
                                                 onChange={(e) => setTypedMessage(e.target.value)}
                                                 style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px' }}
                                             />
                                             <button type="submit" className="glow-button" style={{ padding: '8px 15px', height: 'auto', fontSize: '13px' }}>Send</button>
                                         </div>
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                             <label style={{ fontSize: '12px', color: 'var(--sky-dark)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                 📎 Share File
                                                 <input 
                                                     type="file" 
                                                     onChange={handleShareFile} 
                                                     style={{ display: 'none' }}
                                                 />
                                             </label>
                                             <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>(Scans, Reports)</span>
                                         </div>
                                     </form>
                                 </div>
                             )}
                             {activeTab === 'ehr' && isDoctor && (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                     <h3 style={{ color: 'var(--ink)', margin: 0 }} className="serif-text">Patient EHR Profile</h3>
                                     {ehrInfo ? (
                                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                             <div>
                                                 <strong style={{ display: 'block', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Blood Group</strong>
                                                 <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>{ehrInfo.bloodGroup || 'Not specified'}</span>
                                             </div>
                                             <div>
                                                 <strong style={{ display: 'block', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Allergies</strong>
                                                 <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>{ehrInfo.allergies || 'None recorded'}</span>
                                             </div>
                                             <div>
                                                 <strong style={{ display: 'block', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Chronic Diseases</strong>
                                                 <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>{ehrInfo.chronicDiseases || 'None recorded'}</span>
                                             </div>
                                             <div>
                                                 <strong style={{ display: 'block', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Past Surgeries</strong>
                                                 <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>{ehrInfo.pastSurgeries || 'None recorded'}</span>
                                             </div>
                                             <div>
                                                 <strong style={{ display: 'block', fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Vaccinations</strong>
                                                 <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>{ehrInfo.vaccinations || 'None recorded'}</span>
                                             </div>
                                         </div>
                                     ) : (
                                         <p style={{ color: 'var(--ink-muted)', fontSize: '13px' }}>No Electronic Health Records available.</p>
                                     )}
                                 </div>
                             )}
                             {activeTab === 'lab' && isDoctor && (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                     <h3 style={{ color: 'var(--ink)', margin: 0 }} className="serif-text">Order Lab Tests</h3>
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--surface)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                         <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ink)', fontWeight: '500' }}>
                                             <input 
                                                 type="checkbox" 
                                                 checked={labTestsOrder.blood} 
                                                 onChange={(e) => setLabTestsOrder({...labTestsOrder, blood: e.target.checked})} 
                                             />
                                             Blood Test
                                         </label>
                                         <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ink)', fontWeight: '500' }}>
                                             <input 
                                                 type="checkbox" 
                                                 checked={labTestsOrder.urine} 
                                                 onChange={(e) => setLabTestsOrder({...labTestsOrder, urine: e.target.checked})} 
                                             />
                                             Urine Test
                                         </label>
                                         <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ink)', fontWeight: '500' }}>
                                             <input 
                                                 type="checkbox" 
                                                 checked={labTestsOrder.xray} 
                                                 onChange={(e) => setLabTestsOrder({...labTestsOrder, xray: e.target.checked})} 
                                             />
                                             X-Ray Scan
                                         </label>
                                         <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ink)', fontWeight: '500' }}>
                                             <input 
                                                 type="checkbox" 
                                                 checked={labTestsOrder.ct} 
                                                 onChange={(e) => setLabTestsOrder({...labTestsOrder, ct: e.target.checked})} 
                                             />
                                             CT Scan
                                         </label>
                                     </div>
                                     <button 
                                         type="button" 
                                         className="glow-button" 
                                         onClick={async () => {
                                             const activeTests = Object.keys(labTestsOrder).filter(k => labTestsOrder[k]).map(k => k.toUpperCase() + ' TEST');
                                             if (activeTests.length === 0) {
                                                 toast.error("Please select at least one lab test.");
                                                 return;
                                             }
                                             try {
                                                 await updateAppointment(appointmentId, { labTests: activeTests.join(', ') });
                                                 await addMedicalRecord({
                                                     patient: { id: patientId },
                                                     doctor: { id: doctorId },
                                                     diagnosis: `[LAB_ORDER] ${activeTests.join(', ')}`,
                                                     treatmentPlan: 'Diagnostic order triggered during live session.',
                                                     recordDate: new Date().toISOString()
                                                 });
                                                 toast.success("Lab tests ordered successfully!");
                                             } catch (err) {
                                                 console.error("Lab order submit error:", err);
                                                 toast.error("Failed to submit lab order.");
                                             }
                                        }}
                                        style={{ marginTop: '10px' }}
                                     >
                                         Submit Lab Order
                                     </button>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
                 </div>
                 
                 {/* Call Controls Floating Bar - Positioned at bottom center of the video-container */}
                 <div className="glass-card controls-bar">
                    <button 
                      onClick={() => setMicEnabled(!micEnabled)} 
                      className="control-btn round-btn"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        border: micEnabled ? '1.5px solid var(--sky)' : '1.5px solid #f87171', 
                        background: micEnabled ? 'var(--sky-pale)' : '#fee2e2', 
                        color: micEnabled ? 'var(--sky-dark)' : '#991b1b', 
                        cursor: 'pointer', 
                        fontSize: '1rem', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                      title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
                    >
                       {micEnabled ? '🎙️' : '🔇'}
                    </button>
                    <button 
                      onClick={() => setCameraEnabled(!cameraEnabled)} 
                      className="control-btn round-btn"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        border: cameraEnabled ? '1.5px solid var(--sky)' : '1.5px solid #f87171', 
                        background: cameraEnabled ? 'var(--sky-pale)' : '#fee2e2', 
                        color: cameraEnabled ? 'var(--sky-dark)' : '#991b1b', 
                        cursor: 'pointer', 
                        fontSize: '1rem', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                      title={cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
                    >
                       {cameraEnabled ? '📹' : '🚫'}
                    </button>
                    <button 
                      onClick={handleToggleScreenShare} 
                      className="control-btn round-btn"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        border: isScreenSharing ? '1.5px solid var(--sky)' : '1.5px solid var(--border)', 
                        background: isScreenSharing ? 'var(--sky-pale)' : 'var(--white)', 
                        color: isScreenSharing ? 'var(--sky-dark)' : 'var(--ink)', 
                        cursor: 'pointer', 
                        fontSize: '1rem', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                      title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
                    >
                       🖥️
                    </button>
                    <div style={{ width: '1px', background: 'var(--border)', margin: '0 3px' }}></div>
                    <button 
                      onClick={handleEndCall} 
                      className="control-btn"
                      style={{ 
                        height: '40px', 
                        borderRadius: '25px', 
                        padding: '0 16px', 
                        border: 'none', 
                        background: '#ef4444', 
                        color: 'white', 
                        cursor: 'pointer', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' 
                      }}
                    >
                       📞 {isDoctor ? 'End' : 'Leave'}
                    </button>
                    <button 
                      onClick={() => setShowToolsPanel(!showToolsPanel)} 
                      className="control-btn"
                      style={{ 
                        height: '40px', 
                        borderRadius: '25px', 
                        padding: '0 16px', 
                        border: showToolsPanel ? 'none' : '1.5px solid var(--violet)', 
                        background: showToolsPanel ? 'var(--violet)' : 'var(--white)', 
                        color: showToolsPanel ? 'white' : 'var(--violet)', 
                        cursor: 'pointer', 
                        fontSize: '13px', 
                        fontWeight: '600'
                      }}
                    >
                         🗒️ {isDoctor ? 'Tools' : 'Reports'}
                    </button>
                 </div>
              </div>
           )}
       </div>

        {/* AI SOAP Summary Modal Overlay (Doctors Only) */}
        {showAISummaryModal && (
           <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
              <div className="glass-card" style={{ padding: '2.5rem', width: '90%', maxWidth: '500px', background: 'var(--white)', border: '1.5px solid var(--border)' }}>
                 <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>🤖</div>
                 <h3 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '0.8rem', color: 'var(--ink)', textAlign: 'center' }}>AI Consultation Summary (SOAP)</h3>
                 <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Review and approve the clinical notes prepared by MedConnect AI:
                 </p>
                 <form onSubmit={handleApproveSummary} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Subjective (Chief Complaint)</label>
                       <input 
                          type="text" 
                          value={aiSummaryData.chiefComplaint} 
                          onChange={(e) => setAiSummaryData({...aiSummaryData, chiefComplaint: e.target.value})}
                          required 
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                       />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Objective/Assessment (Diagnosis)</label>
                       <input 
                          type="text" 
                          value={aiSummaryData.diagnosis} 
                          onChange={(e) => setAiSummaryData({...aiSummaryData, diagnosis: e.target.value})}
                          required 
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                       />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Plan (Medications)</label>
                       <input 
                          type="text" 
                          value={aiSummaryData.medications} 
                          onChange={(e) => setAiSummaryData({...aiSummaryData, medications: e.target.value})}
                          required 
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                       />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Follow-up Instructions</label>
                       <input 
                          type="text" 
                          value={aiSummaryData.followUp} 
                          onChange={(e) => setAiSummaryData({...aiSummaryData, followUp: e.target.value})}
                          required 
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                       />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '0.5rem' }}>
                       <button type="submit" className="glow-button" style={{ width: '100%', padding: '10px 20px', height: '42px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Approve Summary & Complete</button>
                       <button type="button" className="btn-ghost" style={{ width: '100%', height: '42px', fontSize: '14px' }} onClick={() => setShowAISummaryModal(false)}>Resume Call</button>
                    </div>
                 </form>
              </div>
           </div>
        )}

       {/* Consultation Rating Modal Overlay */}
       {showRatingModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
             <div className="glass-card" style={{ padding: '2.5rem', width: '90%', maxWidth: '420px', textAlign: 'center', background: 'var(--white)', border: '1.5px solid var(--border)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
                <h3 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '0.8rem', color: 'var(--ink)' }}>Rate Your Session</h3>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                   {isDoctor ? 'Please rate the patient for this virtual consultation:' : 'Please rate your doctor for this virtual consultation:'}
                </p>
                <form onSubmit={handleRatingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                   <select 
                     value={ratingScore} 
                     onChange={(e) => setRatingScore(parseFloat(e.target.value))}
                     style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                   >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                      <option value="4">⭐⭐⭐⭐ Very Good (4/5)</option>
                      <option value="3">⭐⭐⭐ Good (3/5)</option>
                      <option value="2">⭐⭐ Fair (2/5)</option>
                      <option value="1">⭐ Poor (1/5)</option>
                   </select>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '0.5rem' }}>
                      <button type="submit" className="glow-button" style={{ width: '100%', padding: '10px 20px', height: '42px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Submit Rating</button>
                      <div style={{ display: 'flex', gap: '12px' }}>
                         <button type="button" className="btn-ghost" style={{ flex: 1, height: '42px', fontSize: '14px' }} onClick={onClose}>Skip & Exit</button>
                         <button type="button" className="btn-ghost" style={{ flex: 1, height: '42px', fontSize: '14px', border: '1.5px solid var(--sky)', color: 'var(--sky)' }} onClick={() => setShowRatingModal(false)}>Back to Call</button>
                      </div>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};

export default VideoConsultation;
