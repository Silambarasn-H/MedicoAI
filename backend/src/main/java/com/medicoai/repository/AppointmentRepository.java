package com.medicoai.repository;

import com.medicoai.entity.Appointment;
import com.medicoai.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /** All appointments for a specific patient (paginated). */
    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    /** All appointments for a specific doctor (paginated). */
    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    /**
     * Admin search: filter by status + keyword across patient/doctor names.
     *
     * NOTE: Using JOIN (not JOIN FETCH) here because Spring Data JPA
     * cannot apply pagination to queries with JOIN FETCH on collections.
     * Lazy loading is safe here since we map to DTO immediately.
     */
    @Query(value = """
        SELECT a FROM Appointment a
        JOIN a.patient p JOIN p.user pu
        JOIN a.doctor  d JOIN d.user du
        WHERE (:status IS NULL OR a.status = :status)
          AND (:search IS NULL OR :search = ''
               OR LOWER(pu.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(du.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
        """,
        countQuery = """
        SELECT COUNT(a) FROM Appointment a
        JOIN a.patient p JOIN p.user pu
        JOIN a.doctor  d JOIN d.user du
        WHERE (:status IS NULL OR a.status = :status)
          AND (:search IS NULL OR :search = ''
               OR LOWER(pu.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(du.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Appointment> searchAppointments(
            @Param("status") AppointmentStatus status,
            @Param("search") String search,
            Pageable pageable);

    /**
     * Check for a scheduling conflict.
     *
     * FIX: Use enum references (AppointmentStatus.CANCELLED) instead of
     * string literals ('CANCELLED') in JPQL — string literals don't work
     * with @Enumerated(EnumType.STRING) in all JPA providers.
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.doctor.id       = :doctorId
          AND a.appointmentDate = :date
          AND a.appointmentTime = :time
          AND a.status NOT IN :excludedStatuses
          AND (:excludeId IS NULL OR a.id <> :excludeId)
        """)
    boolean existsConflict(
            @Param("doctorId")        Long doctorId,
            @Param("date")            LocalDate date,
            @Param("time")            LocalTime time,
            @Param("excludeId")       Long excludeId,
            @Param("excludedStatuses") List<AppointmentStatus> excludedStatuses);

    /** Today's appointments for a doctor. */
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    /** Count by status (for dashboard). */
    long countByStatus(AppointmentStatus status);

    /** Count today's appointments. */
    long countByAppointmentDate(LocalDate date);

    /** Total appointment count. */
    @Query("SELECT COUNT(a) FROM Appointment a")
    long countAll();
}
