package com.medicoai.controller;

import com.medicoai.dto.request.PrescriptionRequest;
import com.medicoai.dto.response.ApiResponse;
import com.medicoai.dto.response.PrescriptionResponse;
import com.medicoai.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Prescription CRUD.
 *
 * <pre>
 * POST   /prescriptions                        – create (DOCTOR)
 * GET    /prescriptions/{id}                   – get by ID (ADMIN, DOCTOR, PATIENT)
 * GET    /prescriptions                        – all, searchable (ADMIN)
 * GET    /prescriptions/my                     – doctor's own prescriptions (DOCTOR)
 * GET    /prescriptions/patient/{patientId}    – by patient (ADMIN, DOCTOR, PATIENT)
 * GET    /prescriptions/appointment/{apptId}   – by appointment (ADMIN, DOCTOR)
 * PUT    /prescriptions/{id}                   – update (DOCTOR, ADMIN)
 * DELETE /prescriptions/{id}                   – delete (ADMIN)
 * </pre>
 */
@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "Prescription management")
@SecurityRequirement(name = "bearerAuth")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    // ── POST /prescriptions ──────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    @Operation(summary = "Create a prescription (Doctor writes for a patient)")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> create(
            @Valid @RequestBody PrescriptionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        com.medicoai.entity.User user = (com.medicoai.entity.User) userDetails;
        PrescriptionResponse created = prescriptionService.create(user.getId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Prescription created successfully", created));
    }

    // ── GET /prescriptions  (admin: all, searchable) ─────────────────

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all prescriptions (Admin, paginated + searchable)")
    public ResponseEntity<ApiResponse<Page<PrescriptionResponse>>> getAll(
            @Parameter(description = "Search by patient or doctor name")
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")          int page,
            @RequestParam(defaultValue = "10")         int size,
            @RequestParam(defaultValue = "createdAt")  String sortBy,
            @RequestParam(defaultValue = "desc")       String sortDir) {

        var sort     = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        var pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                ApiResponse.success("Prescriptions fetched",
                        prescriptionService.getAll(search, pageable)));
    }

    // ── GET /prescriptions/my  (doctor's own) ────────────────────────

    @GetMapping("/my")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get prescriptions written by the logged-in doctor")
    public ResponseEntity<ApiResponse<Page<PrescriptionResponse>>> getMy(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        com.medicoai.entity.User loggedIn = (com.medicoai.entity.User) userDetails;
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // getByDoctorUserId resolves userId → doctorId inside the service
        return ResponseEntity.ok(
                ApiResponse.success("Your prescriptions fetched",
                        prescriptionService.getByDoctorUserId(loggedIn.getId(), pageable)));
    }

    // ── GET /prescriptions/{id} ──────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get prescription by ID")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Prescription fetched",
                        prescriptionService.getById(id)));
    }

    // ── GET /prescriptions/patient/{patientId} ───────────────────────

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get all prescriptions for a patient")
    public ResponseEntity<ApiResponse<Page<PrescriptionResponse>>> getByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Patient prescriptions fetched",
                        prescriptionService.getByPatient(patientId, pageable)));
    }

    // ── GET /prescriptions/doctor/{doctorId} ─────────────────────────

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(summary = "Get all prescriptions written by a doctor")
    public ResponseEntity<ApiResponse<Page<PrescriptionResponse>>> getByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Doctor prescriptions fetched",
                        prescriptionService.getByDoctor(doctorId, pageable)));
    }

    // ── GET /prescriptions/appointment/{appointmentId} ───────────────

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get prescriptions linked to a specific appointment")
    public ResponseEntity<ApiResponse<Page<PrescriptionResponse>>> getByAppointment(
            @PathVariable Long appointmentId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Appointment prescriptions fetched",
                        prescriptionService.getByAppointment(appointmentId, pageable)));
    }

    // ── PUT /prescriptions/{id} ──────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    @Operation(summary = "Update a prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PrescriptionRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Prescription updated",
                        prescriptionService.update(id, request)));
    }

    // ── DELETE /prescriptions/{id} ───────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a prescription (Admin only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        prescriptionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Prescription deleted"));
    }
}
