package com.medconnect.backend.service;

import com.medconnect.backend.entity.Appointment;
import com.medconnect.backend.entity.User;
import com.medconnect.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    
    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<Appointment> getAppointmentsForPatient(String patientId) {
        User patient = new User();
        patient.setId(patientId);
        return appointmentRepository.findByPatient(patient);
    }
    
    public List<Appointment> getAppointmentsForDoctor(String doctorId) {
        User doctor = new User();
        doctor.setId(doctorId);
        return appointmentRepository.findByDoctor(doctor);
    }
    
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(String appointmentId) {
        appointmentRepository.deleteById(appointmentId);
    }

    public Appointment completeAppointment(String appointmentId) {
        return appointmentRepository.findById(appointmentId).map(appointment -> {
            appointment.setStatus("COMPLETED");
            return appointmentRepository.save(appointment);
        }).orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
}
