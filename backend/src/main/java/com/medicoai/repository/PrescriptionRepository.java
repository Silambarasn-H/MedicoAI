package com.medicoai.repository;

import com.medicoai.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    /** All prescriptions for a specific patient (paginated, newest first). */
    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);

    /** All prescriptions written by a specific doctor (paginated). */
    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);

    /** All prescriptions linked to a specific appointment. */
    Page<Prescription> findByAppointmentId(Long appointmentId, Pageable pageable);

    /**
     * Admin search: filter by patient name or doctor name.
     */
    @Query(value = """
        SELECT p FROM Prescription p
        JOIN p.patient pt JOIN pt.user pu
        JOIN p.doctor  d  JOIN d.user  du
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(pu.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(du.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
        """,
        countQuery = """
        SELECT COUNT(p) FROM Prescription p
        JOIN p.patient pt JOIN pt.user pu
        JOIN p.doctor  d  JOIN d.user  du
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(pu.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(du.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Prescription> searchPrescriptions(
            @Param("search") String search,
            Pageable pageable);

    /** Total prescription count. */
    @Query("SELECT COUNT(p) FROM Prescription p")
    long countAll();
}
