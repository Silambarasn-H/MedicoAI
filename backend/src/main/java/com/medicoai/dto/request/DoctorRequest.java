package com.medicoai.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request body for creating or updating a doctor profile.
 * Used by POST /doctors and PUT /doctors/{id}.
 */
@Data
public class DoctorRequest {

    /**
     * Required when ADMIN creates a doctor profile for an existing user.
     * Omit when a DOCTOR role user creates their own profile.
     */
    private Long userId;

    @NotBlank(message = "Specialization is required")
    @Size(max = 100, message = "Specialization must be at most 100 characters")
    private String specialization;

    @Size(max = 200, message = "Qualification must be at most 200 characters")
    private String qualification;

    @Min(value = 0,  message = "Experience years cannot be negative")
    @Max(value = 60, message = "Experience years cannot exceed 60")
    private Integer experienceYears;

    @Size(max = 50, message = "License number must be at most 50 characters")
    private String licenseNumber;

    @DecimalMin(value = "0.0", message = "Consultation fee cannot be negative")
    @Digits(integer = 8, fraction = 2, message = "Invalid consultation fee format")
    private BigDecimal consultationFee;

    @Size(max = 100, message = "Available days must be at most 100 characters")
    private String availableDays;

    @Size(max = 100, message = "Available time must be at most 100 characters")
    private String availableTime;

    @Size(max = 2000, message = "Bio must be at most 2000 characters")
    private String bio;
}
