package com.medconnect.backend.repository;

import com.medconnect.backend.entity.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    @Query("{ 'patient': ?0 }")
    List<MedicalRecord> findByPatientId(String patientId);

    @Query("{ 'doctor': ?0 }")
    List<MedicalRecord> findByDoctorId(String doctorId);
}
