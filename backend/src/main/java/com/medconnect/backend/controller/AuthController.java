package com.medconnect.backend.controller;

import com.medconnect.backend.entity.User;
import com.medconnect.backend.repository.UserRepository;
import com.medconnect.backend.service.DatabaseResetService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DatabaseResetService databaseResetService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, DatabaseResetService databaseResetService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.databaseResetService = databaseResetService;
    }

    @PostMapping("/register")
    public org.springframework.http.ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return org.springframework.http.ResponseEntity.status(409).body("This email address is already registered. Please log in.");
        }
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().trim().isEmpty()) {
            if (userRepository.findByPhoneNumber(user.getPhoneNumber().trim()).isPresent()) {
                return org.springframework.http.ResponseEntity.status(409).body("This mobile number is already registered. Please log in.");
            }
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        if ("DOCTOR".equals(user.getRole().name()) || "PHARMACIST".equals(user.getRole().name())) {
             user.setIsApproved(false);
        } else {
             user.setIsApproved(true);
        }
        
        User saved = userRepository.save(user);
        return org.springframework.http.ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            String identifier = loginRequest.getEmail();
            User user = userRepository.findByEmailOrPhoneNumber(identifier, identifier)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return org.springframework.http.ResponseEntity.status(401).body("Invalid credentials");
            }
            
            if (user.getIsApproved() != null && !user.getIsApproved()) {
                return org.springframework.http.ResponseEntity.status(403).body("Account pending administrative approval.");
            }

            if (user.getTwoFactorEnabled() != null && user.getTwoFactorEnabled()) {
                return org.springframework.http.ResponseEntity.status(202).body("2FA_REQUIRED");
            }

            return org.springframework.http.ResponseEntity.ok("mock-jwt-token-for-" + user.getEmail() + "-role-" + user.getRole());
        } catch(Exception e) {
            return org.springframework.http.ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/reset-db")
    public org.springframework.http.ResponseEntity<?> resetDatabase() {
        try {
            databaseResetService.resetAndSeed();
            return org.springframework.http.ResponseEntity.ok("Database successfully reset and populated with clean demo data.");
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(500).body("Error resetting database: " + e.getMessage());
        }
    }
}
