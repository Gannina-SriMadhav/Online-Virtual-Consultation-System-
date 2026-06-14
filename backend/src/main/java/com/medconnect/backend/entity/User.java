package com.medconnect.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private RoleEnum role;

    // New Dynamic Fields
    private Integer age;
    private String specialist;
    private String licenseNumber;
    private String phoneNumber;
    
    private String certificateData;

    public User() {}

    public User(String id, String name, String email, String password, RoleEnum role, Integer age, String specialist, String licenseNumber, String certificateData, String phoneNumber) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.age = age;
        this.specialist = specialist;
        this.licenseNumber = licenseNumber;
        this.certificateData = certificateData;
        this.phoneNumber = phoneNumber;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public RoleEnum getRole() { return role; }
    public void setRole(RoleEnum role) { this.role = role; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getSpecialist() { return specialist; }
    public void setSpecialist(String specialist) { this.specialist = specialist; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getCertificateData() { return certificateData; }
    public void setCertificateData(String certificateData) { this.certificateData = certificateData; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    private Boolean isApproved = true;

    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }

    private Double rating = 5.0;

    private Integer ratingCount = 1;

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    // New Telehealth and Security Fields
    private String availabilityConfig;
    private String ehrData;
    private String twoFactorSecret;
    private Boolean twoFactorEnabled = false;
    private String activeSessions;

    public String getAvailabilityConfig() { return availabilityConfig; }
    public void setAvailabilityConfig(String availabilityConfig) { this.availabilityConfig = availabilityConfig; }
    
    public String getEhrData() { return ehrData; }
    public void setEhrData(String ehrData) { this.ehrData = ehrData; }
    
    public String getTwoFactorSecret() { return twoFactorSecret; }
    public void setTwoFactorSecret(String twoFactorSecret) { this.twoFactorSecret = twoFactorSecret; }
    
    public Boolean getTwoFactorEnabled() { return twoFactorEnabled; }
    public void setTwoFactorEnabled(Boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }
    
    public String getActiveSessions() { return activeSessions; }
    public void setActiveSessions(String activeSessions) { this.activeSessions = activeSessions; }
}
