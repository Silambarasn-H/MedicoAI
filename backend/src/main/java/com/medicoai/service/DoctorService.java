package com.medicoai.service;

import com.medicoai.dto.request.DoctorRequest;
import com.medicoai.dto.response.DoctorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Contract for all doctor-related business operations.
 */
public interface DoctorService {

    /**
     * Create a doctor profile for an existing DOCTOR-role user.
     *
     * @param userId  the user account to link
     * @param request profile data
     */
    DoctorResponse createDoctor(Long userId, DoctorRequest request);

    /** Get doctor by doctor-profile ID. */
    DoctorResponse getDoctorById(Long id);

    /** Get doctor by linked user ID. */
    DoctorResponse getDoctorByUserId(Long userId);

    /**
     * Paginated, searchable list of all doctors.
     *
     * @param search         keyword (name / email / specialization)
     * @param specialization exact specialization filter
     * @param pageable       pagination + sort
     */
    Page<DoctorResponse> getAllDoctors(String search, String specialization, Pageable pageable);

    /** Update an existing doctor profile. */
    DoctorResponse updateDoctor(Long id, DoctorRequest request);

    /**
     * Soft-delete: deactivates the linked user account.
     * Medical records are preserved.
     */
    void deleteDoctor(Long id);

    /** Activate or deactivate a doctor account. */
    DoctorResponse toggleStatus(Long id, boolean active);

    /** Total count of active doctors (used by dashboard). */
    long countActiveDoctors();

    /** All distinct specializations (for filter dropdowns). */
    List<String> getAllSpecializations();
}
