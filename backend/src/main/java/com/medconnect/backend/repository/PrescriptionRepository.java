package com.medconnect.backend.repository;

import com.medconnect.backend.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByAppointmentDoctorId(Long doctorId);
    List<Prescription> findByAppointmentPatientId(Long patientId);
    Optional<Prescription> findByVerificationCode(String verificationCode);
}
