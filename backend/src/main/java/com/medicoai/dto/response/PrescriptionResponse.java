package com.medicoai.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Flat response DTO for Prescription.
 * Flattens patient + doctor info so the frontend needs no extra requests.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrescriptionResponse {

    private Long   id;
    private String diagnosis;
    private String medicines;
    private String instructions;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate followUpDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Flattened patient info
    private Long   patientId;
    private String patientName;
    private String patientEmail;

    // Flattened doctor info
    private Long   doctorId;
    private String doctorName;
    private String specialization;

    // Optional appointment link
    private Long   appointmentId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDate appointmentDate;
    private String appointmentReason;
}
