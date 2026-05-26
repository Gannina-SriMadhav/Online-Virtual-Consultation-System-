package com.medconnect.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.Instant;

@Document(collection = "medical_records")
public class MedicalRecord {

    @Id
    private String id;

    @DocumentReference
    private User patient;

    @DocumentReference
    private User doctor;

    private String diagnosis;

    private String treatmentPlan;

    private Instant recordDate;

    private String documentData;

    private String documentName;

    public MedicalRecord() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }
    public User getDoctor() { return doctor; }
    public void setDoctor(User doctor) { this.doctor = doctor; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getTreatmentPlan() { return treatmentPlan; }
    public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }
    public Instant getRecordDate() { return recordDate; }
    public void setRecordDate(Instant recordDate) { this.recordDate = recordDate; }
    public String getDocumentData() { return documentData; }
    public void setDocumentData(String documentData) { this.documentData = documentData; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
}
