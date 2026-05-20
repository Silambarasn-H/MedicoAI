package com.medicoai.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for rescheduling an existing appointment.
 */
@Data
public class RescheduleRequest {

    @NotNull(message = "New appointment date is required")
    @FutureOrPresent(message = "New date must be today or in the future")
    private LocalDate newDate;

    @NotNull(message = "New appointment time is required")
    private LocalTime newTime;
}
