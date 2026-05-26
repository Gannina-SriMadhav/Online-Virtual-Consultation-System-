package com.medconnect.backend.repository;

import com.medconnect.backend.entity.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    @Query("{ 'patient': ?0 }")
    List<Appointment> findByPatientId(String patientId);

    @Query("{ 'doctor': ?0 }")
    List<Appointment> findByDoctorId(String doctorId);
}
