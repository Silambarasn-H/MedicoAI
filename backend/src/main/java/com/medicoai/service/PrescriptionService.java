package com.medicoai.service;

import com.medicoai.dto.request.PrescriptionRequest;
import com.medicoai.dto.response.PrescriptionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PrescriptionService {

    /** Doctor creates a prescription for a patient. doctorUserId = logged-in doctor's user ID. */
    PrescriptionResponse create(Long doctorUserId, PrescriptionRequest request);

    /** Get prescription by ID. */
    PrescriptionResponse getById(Long id);

    /** All prescriptions for a patient (paginated). */
    Page<PrescriptionResponse> getByPatient(Long patientId, Pageable pageable);

    /** All prescriptions written by a doctor (paginated). */
    Page<PrescriptionResponse> getByDoctor(Long doctorId, Pageable pageable);

    /** All prescriptions written by a doctor resolved from their user ID (for /my endpoint). */
    Page<PrescriptionResponse> getByDoctorUserId(Long doctorUserId, Pageable pageable);

    /** All prescriptions linked to an appointment. */
    Page<PrescriptionResponse> getByAppointment(Long appointmentId, Pageable pageable);

    /** Admin: paginated list with optional search. */
    Page<PrescriptionResponse> getAll(String search, Pageable pageable);

    /** Update an existing prescription (doctor only). */
    PrescriptionResponse update(Long id, PrescriptionRequest request);

    /** Delete a prescription (admin only). */
    void delete(Long id);
}
