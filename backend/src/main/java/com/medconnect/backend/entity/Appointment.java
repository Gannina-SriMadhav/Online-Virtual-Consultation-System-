package com.medconnect.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.Instant;

@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    @DocumentReference
    private User patient;

    @DocumentReference
    private User doctor;

    private Instant appointmentDate;

    private String status;

    public Appointment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }
    public User getDoctor() { return doctor; }
    public void setDoctor(User doctor) { this.doctor = doctor; }
    public Instant getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(Instant appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // New Telehealth, Payment, Lab, and AI Summary Fields
    private Double paymentAmount;
    private String paymentTransactionId;
    private String paymentStatus;
    private String patientSymptoms;
    private String labTests;
    private String consultationSummary;

    public Double getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(Double paymentAmount) { this.paymentAmount = paymentAmount; }
    
    public String getPaymentTransactionId() { return paymentTransactionId; }
    public void setPaymentTransactionId(String paymentTransactionId) { this.paymentTransactionId = paymentTransactionId; }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getPatientSymptoms() { return patientSymptoms; }
    public void setPatientSymptoms(String patientSymptoms) { this.patientSymptoms = patientSymptoms; }
    
    public String getLabTests() { return labTests; }
    public void setLabTests(String labTests) { this.labTests = labTests; }
    
    public String getConsultationSummary() { return consultationSummary; }
    public void setConsultationSummary(String consultationSummary) { this.consultationSummary = consultationSummary; }
}
