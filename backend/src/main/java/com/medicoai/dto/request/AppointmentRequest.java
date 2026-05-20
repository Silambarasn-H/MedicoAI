package com.medicoai.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medicoai.enums.AppointmentType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for booking or updating an appointment.
 *
 * <p>Jackson @JsonFormat annotations ensure the frontend strings
 * "2026-05-20" and "10:00" deserialize correctly into LocalDate/LocalTime.</p>
 */
@Data
public class AppointmentRequest {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    /** Required when ADMIN or DOCTOR books on behalf of a patient. */
    private Long patientId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date must be today or in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime appointmentTime;

    private AppointmentType type = AppointmentType.IN_PERSON;

    @Size(max = 1000, message = "Reason must be at most 1000 characters")
    private String reason;

    @Size(max = 2000, message = "Notes must be at most 2000 characters")
    private String notes;
}
