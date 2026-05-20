package com.medicoai.controller;

import com.medicoai.dto.request.AppointmentRequest;
import com.medicoai.dto.request.RescheduleRequest;
import com.medicoai.dto.response.ApiResponse;
import com.medicoai.dto.response.AppointmentResponse;
import com.medicoai.enums.AppointmentStatus;
import com.medicoai.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
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
 * REST controller for Appointment CRUD.
 *
 * <pre>
 * GET    /appointments                        – paginated list (ADMIN)
 * GET    /appointments/{id}                   – get by ID
 * GET    /appointments/patient/{patientId}    – by patient
 * GET    /appointments/doctor/{doctorId}      – by doctor
 * POST   /appointments                        – book
 * PUT    /appointments/{id}                   – update notes/reason
 * PUT    /appointments/{id}/cancel            – cancel
 * PUT    /appointments/{id}/reschedule        – reschedule
 * PUT    /appointments/{id}/confirm           – confirm (DOCTOR/ADMIN)
 * PUT    /appointments/{id}/complete          – complete (DOCTOR)
 * </pre>
 */
@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment booking and management")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ----------------------------------------------------------------
    // GET /appointments  – admin paginated list
    // ----------------------------------------------------------------

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(summary = "Get all appointments (paginated, filterable by status + search)")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getAll(
            @Parameter(description = "Filter by status: PENDING|CONFIRMED|CANCELLED|COMPLETED|RESCHEDULED")
            @RequestParam(required = false) AppointmentStatus status,

            @Parameter(description = "Search by patient or doctor name")
            @RequestParam(required = false) String search,

            @RequestParam(defaultValue = "0")          int page,
            @RequestParam(defaultValue = "10")         int size,
            @RequestParam(defaultValue = "createdAt")  String sortBy,
            @RequestParam(defaultValue = "desc")       String sortDir) {

        // Use only top-level entity fields for sorting to avoid JPQL join issues.
        // Safe values: createdAt, updatedAt, status, id
        String safeSortBy = sortBy.matches("createdAt|updatedAt|status|id|appointmentDate")
                ? sortBy : "createdAt";

        var sort     = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(safeSortBy).ascending()
                : Sort.by(safeSortBy).descending();
        var pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
                ApiResponse.success("Appointments fetched",
                        appointmentService.getAll(status, search, pageable)));
    }

    // ----------------------------------------------------------------
    // GET /appointments/{id}
    // ----------------------------------------------------------------

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment fetched", appointmentService.getById(id)));
    }

    // ----------------------------------------------------------------
    // GET /appointments/patient/{patientId}
    // ----------------------------------------------------------------

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get all appointments for a patient")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Patient appointments fetched",
                        appointmentService.getByPatient(patientId, pageable)));
    }

    // ----------------------------------------------------------------
    // GET /appointments/doctor/{doctorId}
    // ----------------------------------------------------------------

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(summary = "Get all appointments for a doctor")
    public ResponseEntity<ApiResponse<Page<AppointmentResponse>>> getByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Doctor appointments fetched",
                        appointmentService.getByDoctor(doctorId, pageable)));
    }

    // ----------------------------------------------------------------
    // POST /appointments  – book
    // ----------------------------------------------------------------

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(
        summary     = "Book a new appointment",
        description = "PATIENT books for themselves. ADMIN/DOCTOR must supply patientId in body."
    )
    public ResponseEntity<ApiResponse<AppointmentResponse>> book(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        com.medicoai.entity.User user = (com.medicoai.entity.User) userDetails;
        AppointmentResponse created = appointmentService.book(user.getId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", created));
    }

    // ----------------------------------------------------------------
    // PUT /appointments/{id}  – update notes/reason/type
    // ----------------------------------------------------------------

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Update appointment notes, reason or type")
    public ResponseEntity<ApiResponse<AppointmentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Appointment updated",
                        appointmentService.update(id, request)));
    }

    // ----------------------------------------------------------------
    // PUT /appointments/{id}/cancel
    // ----------------------------------------------------------------

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Cancel an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(
            @PathVariable Long id,
            @RequestBody(required = false) CancelRequest body) {

        String reason = (body != null) ? body.getReason() : null;
        return ResponseEntity.ok(
                ApiResponse.success("Appointment cancelled",
                        appointmentService.cancel(id, reason)));
    }

    // ----------------------------------------------------------------
    // PUT /appointments/{id}/reschedule
    // ----------------------------------------------------------------

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Reschedule an appointment to a new date/time")
    public ResponseEntity<ApiResponse<AppointmentResponse>> reschedule(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Appointment rescheduled",
                        appointmentService.reschedule(id, request)));
    }

    // ----------------------------------------------------------------
    // PUT /appointments/{id}/confirm
    // ----------------------------------------------------------------

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(summary = "Confirm a pending appointment (Doctor/Admin)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment confirmed",
                        appointmentService.confirm(id)));
    }

    // ----------------------------------------------------------------
    // PUT /appointments/{id}/complete
    // ----------------------------------------------------------------

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(summary = "Mark appointment as completed (Doctor/Admin)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Appointment completed",
                        appointmentService.complete(id)));
    }

    // ----------------------------------------------------------------
    // Inner DTO for cancel reason
    // ----------------------------------------------------------------

    @Data
    public static class CancelRequest {
        private String reason;
    }
}
