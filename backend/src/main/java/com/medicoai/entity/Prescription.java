package com.medicoai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Prescription entity – maps to the `prescriptions` table.
 * A doctor writes a prescription for a patient, optionally linked to an appointment.
 */
@Entity
@Table(name = "prescriptions",
       indexes = {
           @Index(name = "idx_presc_patient", columnList = "patient_id"),
           @Index(name = "idx_presc_doctor",  columnList = "doctor_id"),
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    /** Optional link to the appointment this prescription was written for. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    /** Comma-separated or JSON list of medicines with dosage. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String medicines;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
