package com.medconnect.backend.controller;

import com.medconnect.backend.entity.MedicalRecord;
import com.medconnect.backend.service.MedicalRecordService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "*")
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    public MedicalRecord addRecord(@RequestBody MedicalRecord record) {
        return medicalRecordService.addMedicalRecord(record);
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getPatientRecords(@PathVariable String patientId) {
        return medicalRecordService.getRecordsForPatient(patientId);
    }
}
