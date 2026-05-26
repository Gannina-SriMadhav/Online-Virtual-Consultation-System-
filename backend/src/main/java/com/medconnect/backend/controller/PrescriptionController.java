package com.medconnect.backend.controller;

import com.medconnect.backend.entity.Prescription;
import com.medconnect.backend.service.PrescriptionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public Prescription issuePrescription(@RequestBody Prescription prescription) {
        return prescriptionService.issuePrescription(prescription);
    }

    @GetMapping("/patient/{patientId}")
    public List<Prescription> getPatientPrescriptions(@PathVariable String patientId) {
        return prescriptionService.getPrescriptionsForPatient(patientId);
    }

    @GetMapping
    public List<Prescription> getAllPrescriptions() {
        return prescriptionService.getAllPrescriptions();
    }

    @PutMapping("/{id}/fulfill")
    public Prescription fulfillPrescription(@PathVariable String id) {
        return prescriptionService.fulfillPrescription(id);
    }

    @GetMapping("/verify/{code}")
    public Prescription verifyPrescriptionCode(@PathVariable String code) {
        return prescriptionService.getPrescriptionByVerificationCode(code);
    }
}
