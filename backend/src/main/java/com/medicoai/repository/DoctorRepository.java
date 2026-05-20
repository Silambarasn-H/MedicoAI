package com.medicoai.repository;

import com.medicoai.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    /** Find doctor by the linked user's ID. */
    Optional<Doctor> findByUserId(Long userId);

    /** Prevent duplicate doctor profiles for the same user. */
    boolean existsByUserId(Long userId);

    /** Prevent duplicate license numbers. */
    boolean existsByLicenseNumber(String licenseNumber);

    /** Prevent duplicate license numbers excluding the current doctor (for updates). */
    boolean existsByLicenseNumberAndIdNot(String licenseNumber, Long id);

    /**
     * Full-text search across name, email, specialization, qualification.
     * Supports optional specialization filter.
     */
    @Query("""
        SELECT d FROM Doctor d
        JOIN d.user u
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(u.fullName)       LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email)          LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.qualification)  LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:specialization IS NULL OR :specialization = ''
               OR LOWER(d.specialization) = LOWER(:specialization))
          AND u.isActive = true
        """)
    Page<Doctor> searchDoctors(
            @Param("search")         String search,
            @Param("specialization") String specialization,
            Pageable pageable);

    /** Count all active doctors. */
    @Query("SELECT COUNT(d) FROM Doctor d JOIN d.user u WHERE u.isActive = true")
    long countActiveDoctors();

    /** Distinct list of all specializations (for filter dropdowns). */
    @Query("SELECT DISTINCT d.specialization FROM Doctor d ORDER BY d.specialization")
    java.util.List<String> findAllSpecializations();
}
