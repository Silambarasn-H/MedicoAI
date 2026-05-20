package com.medicoai.service;

import com.medicoai.dto.request.AppointmentRequest;
import com.medicoai.dto.request.RescheduleRequest;
import com.medicoai.dto.response.AppointmentResponse;
import com.medicoai.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Contract for all appointment business operations.
 */
public interface AppointmentService {

    /** Book a new appointment. patientUserId is the logged-in user's ID. */
    AppointmentResponse book(Long patientUserId, AppointmentRequest request);

    /** Get appointment by ID. */
    AppointmentResponse getById(Long id);

    /** Paginated list with optional status + keyword filter (admin view). */
    Page<AppointmentResponse> getAll(AppointmentStatus status, String search, Pageable pageable);

    /** All appointments for a patient (paginated). */
    Page<AppointmentResponse> getByPatient(Long patientId, Pageable pageable);

    /** All appointments for a doctor (paginated). */
    Page<AppointmentResponse> getByDoctor(Long doctorId, Pageable pageable);

    /** Update notes/reason on a PENDING appointment. */
    AppointmentResponse update(Long id, AppointmentRequest request);

    /** Cancel an appointment with an optional reason. */
    AppointmentResponse cancel(Long id, String reason);

    /** Reschedule to a new date/time. */
    AppointmentResponse reschedule(Long id, RescheduleRequest request);

    /** Doctor confirms a PENDING appointment. */
    AppointmentResponse confirm(Long id);

    /** Doctor marks appointment as COMPLETED. */
    AppointmentResponse complete(Long id);

    // Dashboard counters
    long countTotal();
    long countToday();
    long countByStatus(AppointmentStatus status);
}
