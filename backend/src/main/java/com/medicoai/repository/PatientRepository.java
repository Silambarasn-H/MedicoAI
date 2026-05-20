package com.medicoai.repository;

import com.medicoai.entity.Patient;
import com.medicoai.enums.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /** Find patient by the linked user's ID. */
    Optional<Patient> findByUserId(Long userId);

    /** Check if a patient profile already exists for a user. */
    boolean existsByUserId(Long userId);

    /**
     * Full-text search across name, email, phone, blood group.
     * Supports optional gender filter.
     */
    @Query("""
        SELECT p FROM Patient p
        JOIN p.user u
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(u.fullName)  LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email)     LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.phone)     LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.bloodGroup)LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:gender IS NULL OR p.gender = :gender)
          AND u.isActive = true
        """)
    Page<Patient> searchPatients(
            @Param("search") String search,
            @Param("gender") Gender gender,
            Pageable pageable);

    /** Count all active patients. */
    @Query("SELECT COUNT(p) FROM Patient p JOIN p.user u WHERE u.isActive = true")
    long countActivePatients();
}
