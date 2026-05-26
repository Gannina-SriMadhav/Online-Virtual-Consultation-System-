package com.medconnect.backend.repository;

import com.medconnect.backend.entity.MedicalRecord;
import com.medconnect.backend.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    List<MedicalRecord> findByPatient(User patient);
    List<MedicalRecord> findByDoctor(User doctor);
}
