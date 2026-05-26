package com.medconnect.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;

@Document(collection = "prescriptions")
public class Prescription {

    @Id
    private String id;

    @DocumentReference
    private Appointment appointment;

    private String medicationDetails;

    private String instructions;

    private LocalDateTime issuedAt;

    public Prescription() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }
    public String getMedicationDetails() { return medicationDetails; }
    public void setMedicationDetails(String medicationDetails) { this.medicationDetails = medicationDetails; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    private Boolean isFulfilled = false;

    private String verificationCode;

    public Boolean getIsFulfilled() { return isFulfilled; }
    public void setIsFulfilled(Boolean isFulfilled) { this.isFulfilled = isFulfilled; }
    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
}
