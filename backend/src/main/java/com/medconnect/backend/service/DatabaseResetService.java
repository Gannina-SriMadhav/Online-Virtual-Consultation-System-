package com.medconnect.backend.service;

import com.medconnect.backend.entity.*;
import com.medconnect.backend.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.Duration;

@Service
public class DatabaseResetService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseResetService(UserRepository userRepository,
                                AppointmentRepository appointmentRepository,
                                PrescriptionRepository prescriptionRepository,
                                MedicalRecordRepository medicalRecordRepository,
                                AuditLogRepository auditLogRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public synchronized void resetAndSeed() {
        // Clear all collections
        userRepository.deleteAll();
        appointmentRepository.deleteAll();
        prescriptionRepository.deleteAll();
        medicalRecordRepository.deleteAll();
        auditLogRepository.deleteAll();

        // 1. Seed System Admin
        User admin = new User();
        admin.setName("System Admin");
        admin.setEmail("admin@medconnect.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(RoleEnum.ADMIN);
        admin.setAge(35);
        admin.setPhoneNumber("1234567890");
        admin.setIsApproved(true);
        userRepository.save(admin);

        // 2. Seed Doctor (Cardiologist)
        User docCardio = new User();
        docCardio.setName("Dr. Arvind Sharma");
        docCardio.setEmail("doctor.cardio@medconnect.com");
        docCardio.setPassword(passwordEncoder.encode("doctor123"));
        docCardio.setRole(RoleEnum.DOCTOR);
        docCardio.setAge(45);
        docCardio.setPhoneNumber("9876543210");
        docCardio.setIsApproved(true);
        docCardio.setSpecialist("Cardiologist");
        docCardio.setLicenseNumber("LIC-12345-CARDIO");
        docCardio.setRating(5.0);
        docCardio.setRatingCount(2);
        userRepository.save(docCardio);

        // 3. Seed Doctor (Dermatologist)
        User docDerm = new User();
        docDerm.setName("Dr. Sarah Paul");
        docDerm.setEmail("doctor.derm@medconnect.com");
        docDerm.setPassword(passwordEncoder.encode("doctor123"));
        docDerm.setRole(RoleEnum.DOCTOR);
        docDerm.setAge(38);
        docDerm.setPhoneNumber("8765432109");
        docDerm.setIsApproved(true);
        docDerm.setSpecialist("Dermatologist");
        docDerm.setLicenseNumber("LIC-67890-DERM");
        docDerm.setRating(4.8);
        docDerm.setRatingCount(1);
        userRepository.save(docDerm);

        // 4. Seed Patient
        User patient = new User();
        patient.setName("John Doe");
        patient.setEmail("patient@medconnect.com");
        patient.setPassword(passwordEncoder.encode("patient123"));
        patient.setRole(RoleEnum.PATIENT);
        patient.setAge(30);
        patient.setPhoneNumber("5551234567");
        patient.setIsApproved(true);
        patient.setEhrData("{\"bloodGroup\":\"O+\",\"allergies\":\"Peanuts, Penicillin\",\"medications\":\"None\",\"pastSurgeries\":\"Appendectomy in 2018\",\"vaccinations\":\"COVID-19 (3 doses), Tetanus (2022)\"}");
        userRepository.save(patient);

        // 5. Seed Pharmacist
        User pharmacist = new User();
        pharmacist.setName("City Pharmacy");
        pharmacist.setEmail("pharmacist@medconnect.com");
        pharmacist.setPassword(passwordEncoder.encode("pharmacist123"));
        pharmacist.setRole(RoleEnum.PHARMACIST);
        pharmacist.setAge(40);
        pharmacist.setPhoneNumber("5559876543");
        pharmacist.setIsApproved(true);
        userRepository.save(pharmacist);

        // 6. Seed a completed appointment with Dr. Arvind Sharma for patient
        Appointment pastAppt = new Appointment();
        pastAppt.setPatient(patient);
        pastAppt.setDoctor(docCardio);
        pastAppt.setAppointmentDate(Instant.now().minus(Duration.ofDays(2)));
        pastAppt.setStatus("Completed");
        pastAppt.setPaymentAmount(150.0);
        pastAppt.setPaymentTransactionId("TXN-PAST-100293");
        pastAppt.setPaymentStatus("Paid");
        pastAppt.setPatientSymptoms("Mild chest fluttering during exercise");
        pastAppt.setLabTests("Electrocardiogram (ECG), Lipid Profile");
        pastAppt.setConsultationSummary("Patient presented with mild chest fluttering. Advised rest, reduced caffeine, and completed ECG check. No acute ischemia noted.");
        appointmentRepository.save(pastAppt);

        // 7. Add medical record for the past consultation
        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setDoctor(docCardio);
        record.setDiagnosis("Mild Fluttering - Benign");
        record.setTreatmentPlan("Reduce caffeine intake. Follow-up ECG. Take aspirin if fluttering recurs.");
        record.setRecordDate(Instant.now().minus(Duration.ofDays(2)));
        medicalRecordRepository.save(record);

        // 8. Seed a prescription for the completed appointment
        Prescription rx = new Prescription();
        rx.setAppointment(pastAppt);
        rx.setMedicationDetails("Aspirin 81mg - 1 tablet daily");
        rx.setInstructions("Take 1 tablet daily with food in the morning.");
        rx.setIssuedAt(Instant.now().minus(Duration.ofDays(2)));
        rx.setIsFulfilled(false);
        rx.setVerificationCode("ML-A81B");
        prescriptionRepository.save(rx);

        // 9. Seed an upcoming confirmed appointment for testing waiting room
        Appointment activeAppt = new Appointment();
        activeAppt.setPatient(patient);
        activeAppt.setDoctor(docCardio);
        activeAppt.setAppointmentDate(Instant.now().plus(Duration.ofHours(2)));
        activeAppt.setStatus("Confirmed");
        activeAppt.setPaymentAmount(150.0);
        activeAppt.setPaymentTransactionId("TXN-ACTIVE-200394");
        activeAppt.setPaymentStatus("Paid");
        activeAppt.setPatientSymptoms("Routine cardiology checkup");
        appointmentRepository.save(activeAppt);

        // 10. Seed audit log to show we reset the system
        AuditLog resetLog = new AuditLog("system", "System", "SYSTEM", "DATABASE_RESET", "The database has been wiped and successfully populated with clean mock demonstration data.");
        auditLogRepository.save(resetLog);
    }
}
