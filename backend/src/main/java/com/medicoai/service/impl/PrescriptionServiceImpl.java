package com.medicoai.service.impl;

import com.medicoai.dto.request.PrescriptionRequest;
import com.medicoai.dto.response.PrescriptionResponse;
import com.medicoai.entity.Appointment;
import com.medicoai.entity.Doctor;
import com.medicoai.entity.Patient;
import com.medicoai.entity.Prescription;
import com.medicoai.exception.BadRequestException;
import com.medicoai.exception.ResourceNotFoundException;
import com.medicoai.repository.AppointmentRepository;
import com.medicoai.repository.DoctorRepository;
import com.medicoai.repository.PatientRepository;
import com.medicoai.repository.PrescriptionRepository;
import com.medicoai.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository       doctorRepository;
    private final PatientRepository      patientRepository;
    private final AppointmentRepository  appointmentRepository;

    // ----------------------------------------------------------------
    // Create
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public PrescriptionResponse create(Long doctorUserId, PrescriptionRequest req) {

        // Resolve doctor from logged-in user
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found for user ID: " + doctorUserId));

        // Resolve patient
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient", "id", req.getPatientId()));

        // Optional appointment link
        Appointment appointment = null;
        if (req.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(req.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Appointment", "id", req.getAppointmentId()));
        }

        Prescription p = Prescription.builder()
                .doctor(doctor)
                .patient(patient)
                .appointment(appointment)
                .diagnosis(req.getDiagnosis())
                .medicines(req.getMedicines())
                .instructions(req.getInstructions())
                .followUpDate(req.getFollowUpDate())
                .build();

        Prescription saved = prescriptionRepository.save(p);
        log.info("Prescription created: id={} by doctor={} for patient={}",
                saved.getId(), doctor.getUser().getEmail(), patient.getUser().getEmail());
        return toResponse(saved);
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> getByPatient(Long patientId, Pageable pageable) {
        return prescriptionRepository.findByPatientId(patientId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> getByDoctor(Long doctorId, Pageable pageable) {
        return prescriptionRepository.findByDoctorId(doctorId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> getByDoctorUserId(Long doctorUserId, Pageable pageable) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor profile not found for user ID: " + doctorUserId));
        return prescriptionRepository.findByDoctorId(doctor.getId(), pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> getByAppointment(Long appointmentId, Pageable pageable) {
        return prescriptionRepository.findByAppointmentId(appointmentId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionResponse> getAll(String search, Pageable pageable) {
        return prescriptionRepository.searchPrescriptions(search, pageable).map(this::toResponse);
    }

    // ----------------------------------------------------------------
    // Update
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public PrescriptionResponse update(Long id, PrescriptionRequest req) {
        Prescription p = findById(id);
        if (req.getDiagnosis()    != null) p.setDiagnosis(req.getDiagnosis());
        if (req.getMedicines()    != null) p.setMedicines(req.getMedicines());
        if (req.getInstructions() != null) p.setInstructions(req.getInstructions());
        if (req.getFollowUpDate() != null) p.setFollowUpDate(req.getFollowUpDate());
        return toResponse(prescriptionRepository.save(p));
    }

    // ----------------------------------------------------------------
    // Delete
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public void delete(Long id) {
        if (!prescriptionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Prescription", "id", id);
        }
        prescriptionRepository.deleteById(id);
        log.info("Prescription deleted: id={}", id);
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private Prescription findById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
    }

    private PrescriptionResponse toResponse(Prescription p) {
        var pt = p.getPatient();
        var d  = p.getDoctor();
        var appt = p.getAppointment();
        return PrescriptionResponse.builder()
                .id(p.getId())
                .diagnosis(p.getDiagnosis())
                .medicines(p.getMedicines())
                .instructions(p.getInstructions())
                .followUpDate(p.getFollowUpDate())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .patientId(pt.getId())
                .patientName(pt.getUser().getFullName())
                .patientEmail(pt.getUser().getEmail())
                .doctorId(d.getId())
                .doctorName(d.getUser().getFullName())
                .specialization(d.getSpecialization())
                .appointmentId(appt != null ? appt.getId() : null)
                .appointmentDate(appt != null ? appt.getAppointmentDate() : null)
                .appointmentReason(appt != null ? appt.getReason() : null)
                .build();
    }
}
