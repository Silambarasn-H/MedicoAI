package com.medicoai.service;

import com.medicoai.dto.request.PatientRequest;
import com.medicoai.dto.response.PatientResponse;
import com.medicoai.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Contract for all patient-related business operations.
 */
public interface PatientService {

    /**
     * Create a patient profile for an existing user.
     * Called when a PATIENT-role user completes their profile,
     * or when an ADMIN creates a patient directly.
     *
     * @param userId  the user account to link
     * @param request profile data
     * @return created patient response
     */
    PatientResponse createPatient(Long userId, PatientRequest request);

    /**
     * Retrieve a patient by their patient-profile ID.
     */
    PatientResponse getPatientById(Long id);

    /**
     * Retrieve a patient by their linked user ID.
     */
    PatientResponse getPatientByUserId(Long userId);

    /**
     * Paginated, searchable list of all patients.
     *
     * @param search keyword (name / email / phone / blood group)
     * @param gender optional gender filter
     * @param pageable pagination + sort
     */
    Page<PatientResponse> getAllPatients(String search, Gender gender, Pageable pageable);

    /**
     * Update an existing patient profile.
     *
     * @param id      patient-profile ID
     * @param request updated fields
     */
    PatientResponse updatePatient(Long id, PatientRequest request);

    /**
     * Soft-delete: deactivates the linked user account.
     * Hard data is preserved for medical record compliance.
     *
     * @param id patient-profile ID
     */
    void deletePatient(Long id);

    /**
     * Toggle the active status of the linked user account.
     *
     * @param id     patient-profile ID
     * @param active true = activate, false = deactivate
     */
    PatientResponse toggleStatus(Long id, boolean active);

    /** Total count of active patients (used by dashboard). */
    long countActivePatients();
}
