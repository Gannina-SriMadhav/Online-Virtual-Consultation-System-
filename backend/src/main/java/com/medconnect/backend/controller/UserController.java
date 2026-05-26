package com.medconnect.backend.controller;

import com.medconnect.backend.entity.User;
import com.medconnect.backend.entity.Appointment;
import com.medconnect.backend.entity.MedicalRecord;
import com.medconnect.backend.entity.Prescription;
import com.medconnect.backend.repository.UserRepository;
import com.medconnect.backend.repository.AppointmentRepository;
import com.medconnect.backend.repository.MedicalRecordRepository;
import com.medconnect.backend.repository.PrescriptionRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PrescriptionRepository prescriptionRepository;

    public UserController(UserRepository userRepository, 
                          PasswordEncoder passwordEncoder,
                          AppointmentRepository appointmentRepository,
                          MedicalRecordRepository medicalRecordRepository,
                          PrescriptionRepository prescriptionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/{id}/approve")
    public User approveUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setIsApproved(true);
        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(@PathVariable Long id) {
        // Delete all prescriptions related to this user's appointments
        List<Prescription> prescriptionsAsPatient = prescriptionRepository.findByAppointmentPatientId(id);
        prescriptionRepository.deleteAll(prescriptionsAsPatient);
        List<Prescription> prescriptionsAsDoctor = prescriptionRepository.findByAppointmentDoctorId(id);
        prescriptionRepository.deleteAll(prescriptionsAsDoctor);

        // Delete all appointments related to this user
        List<Appointment> appointmentsAsPatient = appointmentRepository.findByPatientId(id);
        appointmentRepository.deleteAll(appointmentsAsPatient);
        List<Appointment> appointmentsAsDoctor = appointmentRepository.findByDoctorId(id);
        appointmentRepository.deleteAll(appointmentsAsDoctor);

        // Delete all medical records related to this user
        List<MedicalRecord> recordsAsPatient = medicalRecordRepository.findByPatientId(id);
        medicalRecordRepository.deleteAll(recordsAsPatient);
        List<MedicalRecord> recordsAsDoctor = medicalRecordRepository.findByDoctorId(id);
        medicalRecordRepository.deleteAll(recordsAsDoctor);

        // Delete the user itself
        userRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userRepository.findById(id).orElseThrow();
        
        // Email uniqueness check
        if (!user.getEmail().equalsIgnoreCase(updatedUser.getEmail())) {
            java.util.Optional<User> existingEmail = userRepository.findByEmail(updatedUser.getEmail());
            if (existingEmail.isPresent() && !existingEmail.get().getId().equals(id)) {
                return org.springframework.http.ResponseEntity.status(409).body("This email address is already registered by another account.");
            }
        }
        
        // Phone number uniqueness check
        if (updatedUser.getPhoneNumber() != null && !updatedUser.getPhoneNumber().trim().isEmpty()) {
            if (user.getPhoneNumber() == null || !user.getPhoneNumber().trim().equals(updatedUser.getPhoneNumber().trim())) {
                java.util.Optional<User> existingPhone = userRepository.findByPhoneNumber(updatedUser.getPhoneNumber().trim());
                if (existingPhone.isPresent() && !existingPhone.get().getId().equals(id)) {
                    return org.springframework.http.ResponseEntity.status(409).body("This mobile number is already registered by another account.");
                }
            }
        }
        
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setAge(updatedUser.getAge());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        
        if (updatedUser.getSpecialist() != null) {
            user.setSpecialist(updatedUser.getSpecialist());
        }
        if (updatedUser.getLicenseNumber() != null) {
            user.setLicenseNumber(updatedUser.getLicenseNumber());
        }
        
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty() && !updatedUser.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        
        User saved = userRepository.save(user);
        return org.springframework.http.ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/rate")
    public User rateUser(@PathVariable Long id, @RequestParam Double ratingScore) {
        User user = userRepository.findById(id).orElseThrow();
        double currentTotal = user.getRating() * user.getRatingCount();
        int newCount = user.getRatingCount() + 1;
        double newAverage = (currentTotal + ratingScore) / newCount;
        
        user.setRating(newAverage);
        user.setRatingCount(newCount);
        return userRepository.save(user);
    }
}
