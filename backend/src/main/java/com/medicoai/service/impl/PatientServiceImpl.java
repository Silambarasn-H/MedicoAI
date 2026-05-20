package com.medicoai.service.impl;

import com.medicoai.dto.request.PatientRequest;
import com.medicoai.dto.response.PatientResponse;
import com.medicoai.entity.Patient;
import com.medicoai.entity.User;
import com.medicoai.enums.Gender;
import com.medicoai.exception.BadRequestException;
import com.medicoai.exception.ResourceNotFoundException;
import com.medicoai.repository.PatientRepository;
import com.medicoai.repository.UserRepository;
import com.medicoai.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository    userRepository;

    // ----------------------------------------------------------------
    // Create
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public PatientResponse createPatient(Long userId, PatientRequest request) {

        // 1. Verify the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 2. Prevent duplicate patient profiles
        if (patientRepository.existsByUserId(userId)) {
            throw new BadRequestException(
                    "A patient profile already exists for user ID " + userId);
        }

        // 3. Build and persist
        Patient patient = Patient.builder()
                .user(user)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .address(request.getAddress())
                .emergencyContact(request.getEmergencyContact())
                .allergies(request.getAllergies())
                .chronicDiseases(request.getChronicDiseases())
                .insuranceId(request.getInsuranceId())
                .build();

        Patient saved = patientRepository.save(patient);
        log.info("Patient profile created for user: {}", user.getEmail());
        return toResponse(saved);
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found for user ID: " + userId));
        return toResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getAllPatients(String search, Gender gender, Pageable pageable) {
        return patientRepository
                .searchPatients(search, gender, pageable)
                .map(this::toResponse);
    }

    // ----------------------------------------------------------------
    // Update
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public PatientResponse updatePatient(Long id, PatientRequest request) {
        Patient patient = findById(id);

        // Only update fields that are non-null in the request
        if (request.getDateOfBirth()      != null) patient.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender()           != null) patient.setGender(request.getGender());
        if (request.getBloodGroup()       != null) patient.setBloodGroup(request.getBloodGroup());
        if (request.getAddress()          != null) patient.setAddress(request.getAddress());
        if (request.getEmergencyContact() != null) patient.setEmergencyContact(request.getEmergencyContact());
        if (request.getAllergies()         != null) patient.setAllergies(request.getAllergies());
        if (request.getChronicDiseases()  != null) patient.setChronicDiseases(request.getChronicDiseases());
        if (request.getInsuranceId()      != null) patient.setInsuranceId(request.getInsuranceId());

        Patient updated = patientRepository.save(patient);
        log.info("Patient profile updated: id={}", id);
        return toResponse(updated);
    }

    // ----------------------------------------------------------------
    // Delete (soft)
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public void deletePatient(Long id) {
        Patient patient = findById(id);
        // Soft delete: deactivate the linked user account
        User user = patient.getUser();
        user.setActive(false);
        userRepository.save(user);
        log.info("Patient soft-deleted (user deactivated): id={}", id);
    }

    // ----------------------------------------------------------------
    // Toggle status
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public PatientResponse toggleStatus(Long id, boolean active) {
        Patient patient = findById(id);
        patient.getUser().setActive(active);
        userRepository.save(patient.getUser());
        log.info("Patient id={} status set to active={}", id, active);
        return toResponse(patient);
    }

    // ----------------------------------------------------------------
    // Count
    // ----------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public long countActivePatients() {
        return patientRepository.countActivePatients();
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
    }

    /**
     * Maps a Patient entity to a flat PatientResponse DTO.
     * Flattens the nested User fields so the frontend gets one clean object.
     */
    private PatientResponse toResponse(Patient p) {
        User u = p.getUser();
        return PatientResponse.builder()
                .id(p.getId())
                .dateOfBirth(p.getDateOfBirth())
                .gender(p.getGender())
                .bloodGroup(p.getBloodGroup())
                .address(p.getAddress())
                .emergencyContact(p.getEmergencyContact())
                .allergies(p.getAllergies())
                .chronicDiseases(p.getChronicDiseases())
                .insuranceId(p.getInsuranceId())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                // Flattened user fields
                .userId(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .profileImage(u.getProfileImage())
                .active(u.isActive())
                .build();
    }
}
