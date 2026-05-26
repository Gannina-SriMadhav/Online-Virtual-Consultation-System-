package com.medconnect.backend.service;

import com.medconnect.backend.entity.Prescription;
import com.medconnect.backend.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    private String generateRandomAlphanumeric(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        while (sb.length() < length) {
            int index = (int) (rnd.nextFloat() * chars.length());
            sb.append(chars.charAt(index));
        }
        return sb.toString();
    }

    public Prescription issuePrescription(Prescription prescription) {
        if (prescription.getVerificationCode() == null || prescription.getVerificationCode().trim().isEmpty()) {
            prescription.setVerificationCode("ML-" + generateRandomAlphanumeric(4));
        }
        return prescriptionRepository.save(prescription);
    }
    
    public List<Prescription> getPrescriptionsForPatient(Long patientId) {
        return prescriptionRepository.findByAppointmentPatientId(patientId);
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Prescription fulfillPrescription(Long id) {
        Prescription p = prescriptionRepository.findById(id).orElseThrow(() -> new RuntimeException("Prescription not found"));
        p.setIsFulfilled(true);
        return prescriptionRepository.save(p);
    }

    public Prescription getPrescriptionByVerificationCode(String verificationCode) {
        return prescriptionRepository.findByVerificationCode(verificationCode)
                .orElseThrow(() -> new RuntimeException("Prescription not found with the provided code"));
    }
}
