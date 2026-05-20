package com.medicoai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.medicoai.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for patient data.
 * Flattens the User + Patient relationship into a single object
 * so the frontend never has to deal with nested user objects.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientResponse {

    // Patient table fields
    private Long          id;
    private LocalDate     dateOfBirth;
    private Gender        gender;
    private String        bloodGroup;
    private String        address;
    private String        emergencyContact;
    private String        allergies;
    private String        chronicDiseases;
    private String        insuranceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Flattened from User
    private Long   userId;
    private String fullName;
    private String email;
    private String phone;
    private String profileImage;
    private boolean active;
}
