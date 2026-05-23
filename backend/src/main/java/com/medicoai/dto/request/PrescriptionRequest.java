package com.medicoai.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * Request body for creating or updating a prescription.
 */
@Data
public class PrescriptionRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    /** Optional – links prescription to a specific appointment. */
    private Long appointmentId;

    @Size(max = 2000, message = "Diagnosis must be at most 2000 characters")
    private String diagnosis;

    @NotBlank(message = "Medicines are required")
    @Size(max = 5000, message = "Medicines text too long")
    private String medicines;

    @Size(max = 2000, message = "Instructions must be at most 2000 characters")
    private String instructions;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate followUpDate;
}
