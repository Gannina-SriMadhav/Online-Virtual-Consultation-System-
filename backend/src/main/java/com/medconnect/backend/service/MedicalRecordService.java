package com.medconnect.backend.service;

import com.medconnect.backend.entity.MedicalRecord;
import com.medconnect.backend.entity.User;
import com.medconnect.backend.repository.MedicalRecordRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }

    public MedicalRecord addMedicalRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public List<MedicalRecord> getRecordsForPatient(String patientId) {
        User patient = new User();
        patient.setId(patientId);
        return medicalRecordRepository.findByPatient(patient);
    }
}
