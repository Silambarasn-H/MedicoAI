package com.medicoai.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.medicoai.enums.AppointmentStatus;
import com.medicoai.enums.AppointmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Flat response DTO for Appointment.
 * @JsonFormat ensures dates/times serialize as readable strings,
 * not arrays, in the JSON response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AppointmentResponse {

    private Long              id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate         appointmentDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime         appointmentTime;

    private AppointmentStatus status;
    private AppointmentType   type;
    private String            reason;
    private String            notes;
    private String            cancellationReason;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime     createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime     updatedAt;

    // Flattened patient info
    private Long   patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    // Flattened doctor info
    private Long   doctorId;
    private String doctorName;
    private String doctorEmail;
    private String specialization;
}
