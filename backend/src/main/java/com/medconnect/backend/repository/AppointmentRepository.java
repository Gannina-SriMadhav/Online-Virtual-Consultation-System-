package com.medconnect.backend.repository;

import com.medconnect.backend.entity.Appointment;
import com.medconnect.backend.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findByPatient(User patient);
    List<Appointment> findByDoctor(User doctor);
}
