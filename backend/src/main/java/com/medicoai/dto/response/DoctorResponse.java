package com.medicoai.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for doctor data.
 * Flattens Doctor + User into one object — same pattern as PatientResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoctorResponse {

    // Doctor table fields
    private Long       id;
    private String     specialization;
    private String     qualification;
    private Integer    experienceYears;
    private String     licenseNumber;
    private BigDecimal consultationFee;
    private String     availableDays;
    private String     availableTime;
    private String     bio;
    private BigDecimal rating;
    private Integer    totalReviews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Flattened from User
    private Long    userId;
    private String  fullName;
    private String  email;
    private String  phone;
    private String  profileImage;
    private boolean active;
}
