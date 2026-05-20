package com.medicoai.service.impl;

import com.medicoai.dto.request.DoctorRequest;
import com.medicoai.dto.response.DoctorResponse;
import com.medicoai.entity.Doctor;
import com.medicoai.entity.User;
import com.medicoai.exception.BadRequestException;
import com.medicoai.exception.ResourceNotFoundException;
import com.medicoai.repository.DoctorRepository;
import com.medicoai.repository.UserRepository;
import com.medicoai.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository   userRepository;

    // ----------------------------------------------------------------
    // Create
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public DoctorResponse createDoctor(Long userId, DoctorRequest request) {

        // 1. Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 2. Prevent duplicate doctor profiles
        if (doctorRepository.existsByUserId(userId)) {
            throw new BadRequestException(
                    "A doctor profile already exists for user ID " + userId);
        }

        // 3. License number uniqueness check
        if (request.getLicenseNumber() != null
                && !request.getLicenseNumber().isBlank()
                && doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new BadRequestException(
                    "License number '" + request.getLicenseNumber() + "' is already registered.");
        }

        // 4. Build and persist
        Doctor doctor = Doctor.builder()
                .user(user)
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                .licenseNumber(request.getLicenseNumber())
                .consultationFee(request.getConsultationFee())
                .availableDays(request.getAvailableDays())
                .availableTime(request.getAvailableTime())
                .bio(request.getBio())
                .build();

        Doctor saved = doctorRepository.save(doctor);
        log.info("Doctor profile created for user: {}", user.getEmail());
        return toResponse(saved);
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found for user ID: " + userId));
        return toResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponse> getAllDoctors(String search, String specialization, Pageable pageable) {
        return doctorRepository
                .searchDoctors(search, specialization, pageable)
                .map(this::toResponse);
    }

    // ----------------------------------------------------------------
    // Update
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public DoctorResponse updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = findById(id);

        // License number uniqueness — exclude self
        if (request.getLicenseNumber() != null
                && !request.getLicenseNumber().isBlank()
                && doctorRepository.existsByLicenseNumberAndIdNot(request.getLicenseNumber(), id)) {
            throw new BadRequestException(
                    "License number '" + request.getLicenseNumber() + "' is already in use.");
        }

        // Patch only non-null fields
        if (request.getSpecialization()  != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getQualification()   != null) doctor.setQualification(request.getQualification());
        if (request.getExperienceYears() != null) doctor.setExperienceYears(request.getExperienceYears());
        if (request.getLicenseNumber()   != null) doctor.setLicenseNumber(request.getLicenseNumber());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getAvailableDays()   != null) doctor.setAvailableDays(request.getAvailableDays());
        if (request.getAvailableTime()   != null) doctor.setAvailableTime(request.getAvailableTime());
        if (request.getBio()             != null) doctor.setBio(request.getBio());

        Doctor updated = doctorRepository.save(doctor);
        log.info("Doctor profile updated: id={}", id);
        return toResponse(updated);
    }

    // ----------------------------------------------------------------
    // Delete (soft)
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = findById(id);
        User user = doctor.getUser();
        user.setActive(false);
        userRepository.save(user);
        log.info("Doctor soft-deleted (user deactivated): id={}", id);
    }

    // ----------------------------------------------------------------
    // Toggle status
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public DoctorResponse toggleStatus(Long id, boolean active) {
        Doctor doctor = findById(id);
        doctor.getUser().setActive(active);
        userRepository.save(doctor.getUser());
        log.info("Doctor id={} status set to active={}", id, active);
        return toResponse(doctor);
    }

    // ----------------------------------------------------------------
    // Count / Specializations
    // ----------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public long countActiveDoctors() {
        return doctorRepository.countActiveDoctors();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllSpecializations() {
        return doctorRepository.findAllSpecializations();
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private Doctor findById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
    }

    /** Maps Doctor entity → flat DoctorResponse DTO. */
    private DoctorResponse toResponse(Doctor d) {
        User u = d.getUser();
        return DoctorResponse.builder()
                .id(d.getId())
                .specialization(d.getSpecialization())
                .qualification(d.getQualification())
                .experienceYears(d.getExperienceYears())
                .licenseNumber(d.getLicenseNumber())
                .consultationFee(d.getConsultationFee())
                .availableDays(d.getAvailableDays())
                .availableTime(d.getAvailableTime())
                .bio(d.getBio())
                .rating(d.getRating())
                .totalReviews(d.getTotalReviews())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
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
