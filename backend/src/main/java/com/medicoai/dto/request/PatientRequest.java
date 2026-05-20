package com.medicoai.dto.request;

import com.medicoai.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

/**
 * Request body for creating or updating a patient profile.
 * Used by both POST /patients and PUT /patients/{id}.
 */
@Data
public class PatientRequest {

    /** Required only when an admin creates a patient directly (links to existing user). */
    private Long userId;

    // ── Personal info (required on create, optional on update) ──

    @Size(max = 5, message = "Blood group must be at most 5 characters")
    private String bloodGroup;

    private LocalDate dateOfBirth;

    private Gender gender;

    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Emergency contact must be a valid 10-digit Indian mobile number"
    )
    private String emergencyContact;

    @Size(max = 1000, message = "Allergies text too long")
    private String allergies;

    @Size(max = 1000, message = "Chronic diseases text too long")
    private String chronicDiseases;

    @Size(max = 100, message = "Insurance ID must be at most 100 characters")
    private String insuranceId;
}
