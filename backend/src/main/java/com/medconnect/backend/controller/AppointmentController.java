package com.medconnect.backend.controller;

import com.medconnect.backend.entity.Appointment;
import com.medconnect.backend.service.AppointmentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/patient/{patientId}")
    public List<Appointment> getPatientAppointments(@PathVariable String patientId) {
        return appointmentService.getAppointmentsForPatient(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getDoctorAppointments(@PathVariable String doctorId) {
        return appointmentService.getAppointmentsForDoctor(doctorId);
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentService.createAppointment(appointment);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteAppointment(@PathVariable String id) {
        appointmentService.deleteAppointment(id);
        return org.springframework.http.ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/complete")
    public Appointment completeAppointment(@PathVariable String id) {
        return appointmentService.completeAppointment(id);
    }
}
