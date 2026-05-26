package com.medconnect.backend.repository;

import com.medconnect.backend.entity.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    List<MedicalRecord> findByPatientId(String patientId);
    List<MedicalRecord> findByDoctorId(String doctorId);
}
