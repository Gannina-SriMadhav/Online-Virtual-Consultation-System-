package com.medconnect.backend.repository;

import com.medconnect.backend.entity.Prescription;
import com.medconnect.backend.entity.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends MongoRepository<Prescription, String> {
    List<Prescription> findByAppointmentIn(List<Appointment> appointments);
    Optional<Prescription> findByVerificationCode(String verificationCode);
}
