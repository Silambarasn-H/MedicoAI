package com.medicoai.controller;

import com.medicoai.dto.request.PatientRequest;
import com.medicoai.dto.response.ApiResponse;
import com.medicoai.dto.response.PatientResponse;
import com.medicoai.enums.Gender;
import com.medicoai.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Patient CRUD operations.
 *
 * <p>Base path: {@code /api/patients}</p>
 *
 * <pre>
 * GET    /patients              – paginated list (ADMIN, DOCTOR)
 * GET    /patients/{id}         – get by patient ID (ADMIN, DOCTOR, PATIENT)
 * GET    /patients/me           – get own profile (PATIENT)
 * POST   /patients              – create profile (ADMIN or self-registration)
 * PUT    /patients/{id}         – update profile (ADMIN or own)
 * PUT    /patients/{id}/status  – toggle active (ADMIN)
 * DELETE /patients/{id}         – soft delete (ADMIN)
 * </pre>
 */
@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient profile management")
@SecurityRequirement(name = "bearerAuth")
public class PatientController {

    private final PatientService patientService;

    // ----------------------------------------------------------------
    // GET /patients  – paginated list
    // ----------------------------------------------------------------

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(summary = "Get all patients (paginated + searchable)")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> getAllPatients(
            @Parameter(description = "Search by name, email, phone or blood group")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filter by gender: MALE | FEMALE | OTHER")
            @RequestParam(required = false) Gender gender,

            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PatientResponse> patients = patientService.getAllPatients(search, gender, pageable);

        return ResponseEntity.ok(
                ApiResponse.success("Patients fetched successfully", patients));
    }

    // ----------------------------------------------------------------
    // GET /patients/me  – own profile
    // ----------------------------------------------------------------

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get the currently authenticated patient's own profile")
    public ResponseEntity<ApiResponse<PatientResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        // UserDetails.getUsername() returns email (see User entity)
        // We look up by userId via a helper that resolves email → userId
        // For now we use the email-based lookup path through the service
        // The frontend sends the userId stored in the JWT payload
        // We resolve it from the security context principal
        com.medicoai.entity.User user = (com.medicoai.entity.User) userDetails;
        PatientResponse response = patientService.getPatientByUserId(user.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched successfully", response));
    }

    // ----------------------------------------------------------------
    // GET /patients/{id}
    // ----------------------------------------------------------------

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get patient by patient-profile ID")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success("Patient fetched successfully",
                        patientService.getPatientById(id)));
    }

    // ----------------------------------------------------------------
    // POST /patients  – create profile
    // ----------------------------------------------------------------

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PATIENT')")
    @Operation(summary = "Create a patient profile",
               description = "ADMIN can pass userId in body. PATIENT creates their own profile.")
    public ResponseEntity<ApiResponse<PatientResponse>> createPatient(
            @Valid @RequestBody PatientRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId;

        if (request.getUserId() != null) {
            // Admin is creating a profile for a specific user
            userId = request.getUserId();
        } else {
            // Patient is creating their own profile
            com.medicoai.entity.User user = (com.medicoai.entity.User) userDetails;
            userId = user.getId();
        }

        PatientResponse created = patientService.createPatient(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient profile created successfully", created));
    }

    // ----------------------------------------------------------------
    // PUT /patients/{id}  – update
    // ----------------------------------------------------------------

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PATIENT')")
    @Operation(summary = "Update patient profile")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Patient updated successfully",
                        patientService.updatePatient(id, request)));
    }

    // ----------------------------------------------------------------
    // PUT /patients/{id}/status  – toggle active/inactive
    // ----------------------------------------------------------------

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate or deactivate a patient account")
    public ResponseEntity<ApiResponse<PatientResponse>> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        active ? "Patient activated" : "Patient deactivated",
                        patientService.toggleStatus(id, active)));
    }

    // ----------------------------------------------------------------
    // DELETE /patients/{id}  – soft delete
    // ----------------------------------------------------------------

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete a patient (deactivates linked user account)")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient removed successfully"));
    }
}
