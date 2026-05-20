package com.medicoai.service.impl;

import com.medicoai.dto.request.AppointmentRequest;
import com.medicoai.dto.request.RescheduleRequest;
import com.medicoai.dto.response.AppointmentResponse;
import com.medicoai.entity.Appointment;
import com.medicoai.entity.Doctor;
import com.medicoai.entity.Patient;
import com.medicoai.enums.AppointmentStatus;
import com.medicoai.enums.AppointmentType;
import com.medicoai.exception.BadRequestException;
import com.medicoai.exception.ResourceNotFoundException;
import com.medicoai.repository.AppointmentRepository;
import com.medicoai.repository.DoctorRepository;
import com.medicoai.repository.PatientRepository;
import com.medicoai.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;
    private final DoctorRepository      doctorRepository;

    // ----------------------------------------------------------------
    // Book
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public AppointmentResponse book(Long patientUserId, AppointmentRequest req) {

        // Resolve patient — either from request body (admin) or from logged-in user
        Patient patient;
        if (req.getPatientId() != null) {
            patient = patientRepository.findById(req.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", req.getPatientId()));
        } else {
            patient = patientRepository.findByUserId(patientUserId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Patient profile not found for user ID: " + patientUserId));
        }

        // Resolve doctor
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", req.getDoctorId()));

        // Conflict check — same doctor, same slot
        if (appointmentRepository.existsConflict(
                doctor.getId(), req.getAppointmentDate(), req.getAppointmentTime(), null,
                List.of(AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED))) {
            throw new BadRequestException(
                    "Dr. " + doctor.getUser().getFullName() +
                    " already has an appointment at " + req.getAppointmentTime() +
                    " on " + req.getAppointmentDate());
        }

        Appointment appt = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(req.getAppointmentDate())
                .appointmentTime(req.getAppointmentTime())
                .type(req.getType() != null ? req.getType() : com.medicoai.enums.AppointmentType.IN_PERSON)
                .reason(req.getReason())
                .notes(req.getNotes())
                .status(AppointmentStatus.PENDING)
                .build();

        Appointment saved = appointmentRepository.save(appt);
        log.info("Appointment booked: id={}, patient={}, doctor={}",
                saved.getId(), patient.getUser().getEmail(), doctor.getUser().getEmail());
        return toResponse(saved);
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAll(AppointmentStatus status, String search, Pageable pageable) {
        return appointmentRepository
                .searchAppointments(status, search, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getByPatient(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientId(patientId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getByDoctor(Long doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable).map(this::toResponse);
    }

    // ----------------------------------------------------------------
    // Update (notes / reason only — status stays unchanged)
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public AppointmentResponse update(Long id, AppointmentRequest req) {
        Appointment appt = findById(id);

        if (appt.getStatus() == AppointmentStatus.CANCELLED ||
            appt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot update a " + appt.getStatus() + " appointment.");
        }

        if (req.getReason() != null) appt.setReason(req.getReason());
        if (req.getNotes()  != null) appt.setNotes(req.getNotes());
        if (req.getType()   != null) appt.setType(req.getType());

        return toResponse(appointmentRepository.save(appt));
    }

    // ----------------------------------------------------------------
    // Cancel
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public AppointmentResponse cancel(Long id, String reason) {
        Appointment appt = findById(id);

        if (appt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled.");
        }
        if (appt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment.");
        }

        appt.setStatus(AppointmentStatus.CANCELLED);
        appt.setCancellationReason(reason);
        log.info("Appointment cancelled: id={}", id);
        return toResponse(appointmentRepository.save(appt));
    }

    // ----------------------------------------------------------------
    // Reschedule
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public AppointmentResponse reschedule(Long id, RescheduleRequest req) {
        Appointment appt = findById(id);

        if (appt.getStatus() == AppointmentStatus.CANCELLED ||
            appt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot reschedule a " + appt.getStatus() + " appointment.");
        }

        // Conflict check excluding self
        if (appointmentRepository.existsConflict(
                appt.getDoctor().getId(), req.getNewDate(), req.getNewTime(), id,
                List.of(AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED))) {
            throw new BadRequestException(
                    "Dr. " + appt.getDoctor().getUser().getFullName() +
                    " already has an appointment at " + req.getNewTime() +
                    " on " + req.getNewDate());
        }

        appt.setAppointmentDate(req.getNewDate());
        appt.setAppointmentTime(req.getNewTime());
        appt.setStatus(AppointmentStatus.RESCHEDULED);
        log.info("Appointment rescheduled: id={} → {} {}", id, req.getNewDate(), req.getNewTime());
        return toResponse(appointmentRepository.save(appt));
    }

    // ----------------------------------------------------------------
    // Confirm / Complete
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public AppointmentResponse confirm(Long id) {
        Appointment appt = findById(id);
        if (appt.getStatus() != AppointmentStatus.PENDING &&
            appt.getStatus() != AppointmentStatus.RESCHEDULED) {
            throw new BadRequestException("Only PENDING or RESCHEDULED appointments can be confirmed.");
        }
        appt.setStatus(AppointmentStatus.CONFIRMED);
        return toResponse(appointmentRepository.save(appt));
    }

    @Override
    @Transactional
    public AppointmentResponse complete(Long id) {
        Appointment appt = findById(id);
        if (appt.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new BadRequestException("Only CONFIRMED appointments can be marked as completed.");
        }
        appt.setStatus(AppointmentStatus.COMPLETED);
        return toResponse(appointmentRepository.save(appt));
    }

    // ----------------------------------------------------------------
    // Counters (dashboard)
    // ----------------------------------------------------------------

    @Override public long countTotal()                          { return appointmentRepository.countAll(); }
    @Override public long countToday()                         { return appointmentRepository.countByAppointmentDate(LocalDate.now()); }
    @Override public long countByStatus(AppointmentStatus s)   { return appointmentRepository.countByStatus(s); }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
    }

    /** Maps Appointment entity → flat AppointmentResponse DTO. */
    private AppointmentResponse toResponse(Appointment a) {
        var p  = a.getPatient();
        var pu = p.getUser();
        var d  = a.getDoctor();
        var du = d.getUser();

        return AppointmentResponse.builder()
                .id(a.getId())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .type(a.getType())
                .reason(a.getReason())
                .notes(a.getNotes())
                .cancellationReason(a.getCancellationReason())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                // Patient
                .patientId(p.getId())
                .patientName(pu.getFullName())
                .patientEmail(pu.getEmail())
                .patientPhone(pu.getPhone())
                // Doctor
                .doctorId(d.getId())
                .doctorName(du.getFullName())
                .doctorEmail(du.getEmail())
                .specialization(d.getSpecialization())
                .build();
    }
}
