import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import toast from 'react-hot-toast';
import { completeAppointment, issuePrescription, addMedicalRecord, rateUserSession, getPatientRecords } from '../api';

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

  // Patient Records / Document Sharing State
  const [patientRecords, setPatientRecords] = useState([]);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [newReport, setNewReport] = useState({ name: '', fileData: '' });
  
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize Media Devices immediately for preview
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
           localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        setErrorStatus('Failed to access camera and microphone. Please check permissions.');
      });

    return () => {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerInstance.current) {
          peerInstance.current.destroy();
        }
    };
  }, []);

  // Update tracks when toggling
  useEffect(() => {
     if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => track.enabled = micEnabled);
        localStreamRef.current.getVideoTracks().forEach(track => track.enabled = cameraEnabled);
     }
  }, [micEnabled, cameraEnabled]);

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
       
       // Listen for incoming calls
       peer.on('call', (call) => {
          call.answer(localStreamRef.current);
          call.on('stream', (remoteStream) => {
             if (remoteVideoRef.current && !remoteStreamAttachedRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play().catch(e => console.error("Play error:", e));
                remoteStreamAttachedRef.current = true;
                setRemoteStreamAttached(true);
                toast.success("Connected!");
             }
          });
       });

       // Actively dial the other person
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
                   toast.success("Connected!");
                }
             });
             call.on('error', () => {});
          }
       };

       attemptCall();
       
       const retryInterval = setInterval(() => {
          if(!remoteStreamAttachedRef.current && peerInstance.current && !peerInstance.current.disconnected) {
             attemptCall();
          } else {
             clearInterval(retryInterval);
          }
       }, 5000);
     });

     peer.on('error', (err) => {
        if(err.type !== 'peer-unavailable') {
            console.error("Peer error:", err.type);
        }
     });

     peerInstance.current = peer;
  };

  const handleEndCall = async () => {
     if(isDoctor) {
         try {
            await completeAppointment(appointmentId);
            toast.success("Consultation successfully completed and secured");
            setShowRatingModal(true);
         } catch(e) {
            toast.error("Failed to mark appointment as completed");
            setShowRatingModal(true);
         }
     } else {
         setShowRatingModal(true);
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
          await issuePrescription({
              appointment: { id: appointmentId },
              medicationDetails: prescriptionData.medicationDetails,
              instructions: prescriptionData.instructions,
              issuedAt: new Date().toISOString()
          });
          toast.success("Prescription securely saved to record!");
          setPrescriptionData({ medicationDetails: '', instructions: '' });
      } catch(e) {
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
      } catch(e) {
          toast.error("Failed to log diagnosis.");
      }
  };

  const loadRecords = async () => {
    if (patientId) {
      try {
        const recs = await getPatientRecords(patientId);
        setPatientRecords(recs || []);
      } catch (e) {
        console.error("Failed to load patient records in call:", e);
      }
    }
  };

  useEffect(() => {
    if (isJoined && patientId) {
      loadRecords();
      const interval = setInterval(() => {
        loadRecords();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isJoined, patientId]);

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
          {!isJoined ? (
             <div className="glass-card" style={{ width: '95%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--white)' }}>
                <div style={{ flex: 1, minHeight: '300px', background: '#0b1220', position: 'relative' }}>
                   <video 
                     ref={localVideoRef} 
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
             <div style={{ display: 'flex', width: '100%', height: '100%', padding: '20px', gap: '20px', boxSizing: 'border-box', background: '#0b1220', paddingBottom: '100px' }}>
                
                {/* Local Video - Left Side (Your Video & Your Options Overlay) */}
                <div className="glass-card" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#1e293b', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
                   <video 
                      ref={localVideoRef} 
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
                <div className="glass-card" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#1e293b', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.05)' }}>
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
                </div>
                
                {/* Clinical Form Sliding Panel (Doctors Only) - Rendered outside to prevent layout clipping */}
                {showToolsPanel && (
                    <div className="glass-card" style={{ 
                        width: '380px', display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', height: '100%', zIndex: 20
                    }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                            {isDoctor ? (
                                <>
                                    <button onClick={() => setActiveTab('prescription')} style={{ flex: 1, padding: '15px', background: activeTab === 'prescription' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'prescription' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', cursor: 'pointer' }}>Prescribe</button>
                                    <button onClick={() => setActiveTab('diagnose')} style={{ flex: 1, padding: '15px', background: activeTab === 'diagnose' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'diagnose' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', cursor: 'pointer' }}>Diagnose</button>
                                    <button onClick={() => setActiveTab('reports')} style={{ flex: 1, padding: '15px', background: activeTab === 'reports' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'reports' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', cursor: 'pointer' }}>Reports</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setActiveTab('reports')} style={{ flex: 1, padding: '15px', background: activeTab === 'reports' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'reports' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', cursor: 'pointer' }}>View Reports</button>
                                    <button onClick={() => setActiveTab('upload')} style={{ flex: 1, padding: '15px', background: activeTab === 'upload' ? 'var(--surface)' : 'transparent', border: 'none', color: activeTab === 'upload' ? 'var(--sky-dark)' : 'var(--ink-soft)', fontWeight: 'bold', cursor: 'pointer' }}>Upload Report</button>
                                </>
                            )}
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                            {activeTab === 'prescription' && isDoctor && (
                                <form onSubmit={handlePrescriptionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                   <h3 style={{ color: 'var(--ink)', margin: 0 }} className="serif-text">Add E-Prescription</h3>
                                   <textarea placeholder="Medication Details (e.g., Amoxicillin 500mg)" required value={prescriptionData.medicationDetails} onChange={(e) => setPrescriptionData({...prescriptionData, medicationDetails: e.target.value})} style={{ padding: '12px', borderRadius: '8px', minHeight: '85px', width: '100%', resize: 'none' }}></textarea>
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
                        </div>
                    </div>
                )}
             </div>
          )}
       </div>

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
                     style={{ width: '100%', padding: '10px' }}
                   >
                      <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                      <option value="4">⭐⭐⭐⭐ Very Good (4/5)</option>
                      <option value="3">⭐⭐⭐ Good (3/5)</option>
                      <option value="2">⭐⭐ Fair (2/5)</option>
                      <option value="1">⭐ Poor (1/5)</option>
                   </select>
                   <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem', justifyContent: 'center' }}>
                      <button type="submit" className="glow-button" style={{ flex: 1, padding: '10px 20px', height: '42px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Submit Rating</button>
                      <button type="button" className="btn-ghost" style={{ flex: 1, height: '42px', fontSize: '14px' }} onClick={onClose}>Skip</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};

export default VideoConsultation;
