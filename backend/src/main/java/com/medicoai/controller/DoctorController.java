package com.medicoai.controller;

import com.medicoai.dto.request.DoctorRequest;
import com.medicoai.dto.response.ApiResponse;
import com.medicoai.dto.response.DoctorResponse;
import com.medicoai.service.DoctorService;
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

import java.util.List;

/**
 * REST controller for Doctor CRUD operations.
 *
 * <p>Base path: {@code /api/doctors}</p>
 *
 * <pre>
 * GET    /doctors                    – paginated list (ADMIN, DOCTOR, PATIENT)
 * GET    /doctors/specializations    – distinct specialization list
 * GET    /doctors/me                 – own profile (DOCTOR)
 * GET    /doctors/{id}               – by doctor-profile ID
 * POST   /doctors                    – create profile (ADMIN or DOCTOR self)
 * PUT    /doctors/{id}               – update profile (ADMIN or own DOCTOR)
 * PUT    /doctors/{id}/status        – toggle active (ADMIN)
 * DELETE /doctors/{id}               – soft delete (ADMIN)
 * </pre>
 */
@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor profile management")
@SecurityRequirement(name = "bearerAuth")
public class DoctorController {

    private final DoctorService doctorService;

    // ----------------------------------------------------------------
    // GET /doctors  – paginated list
    // ----------------------------------------------------------------

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get all doctors (paginated + searchable)")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> getAllDoctors(
            @Parameter(description = "Search by name, email or specialization")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filter by exact specialization (e.g. Cardiology)")
            @RequestParam(required = false) String specialization,

            @RequestParam(defaultValue = "0")            int page,
            @RequestParam(defaultValue = "10")           int size,
            @RequestParam(defaultValue = "createdAt")    String sortBy,
            @RequestParam(defaultValue = "desc")         String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<DoctorResponse> doctors = doctorService.getAllDoctors(search, specialization, pageable);

        return ResponseEntity.ok(
                ApiResponse.success("Doctors fetched successfully", doctors));
    }

    // ----------------------------------------------------------------
    // GET /doctors/specializations  – dropdown data
    // ----------------------------------------------------------------

    @GetMapping("/specializations")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get all distinct specializations (for filter dropdowns)")
    public ResponseEntity<ApiResponse<List<String>>> getSpecializations() {
        return ResponseEntity.ok(
                ApiResponse.success("Specializations fetched",
                        doctorService.getAllSpecializations()));
    }

    // ----------------------------------------------------------------
    // GET /doctors/me  – own profile
    // ----------------------------------------------------------------

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get the currently authenticated doctor's own profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        com.medicoai.entity.User user = (com.medicoai.entity.User) userDetails;
        return ResponseEntity.ok(
                ApiResponse.success("Profile fetched successfully",
                        doctorService.getDoctorByUserId(user.getId())));
    }

    // ----------------------------------------------------------------
    // GET /doctors/{id}
    // ----------------------------------------------------------------

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    @Operation(summary = "Get doctor by doctor-profile ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success("Doctor fetched successfully",
                        doctorService.getDoctorById(id)));
    }

    // ----------------------------------------------------------------
    // POST /doctors  – create profile
    // ----------------------------------------------------------------

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(
        summary     = "Create a doctor profile",
        description = "ADMIN can pass userId in body. DOCTOR creates their own profile."
    )
    public ResponseEntity<ApiResponse<DoctorResponse>> createDoctor(
            @Valid @RequestBody DoctorRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId;
        if (request.getUserId() != null) {
            userId = request.getUserId();
        } else {
            com.medicoai.entity.User user = (com.medicoai.entity.User) userDetails;
            userId = user.getId();
        }

        DoctorResponse created = doctorService.createDoctor(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Doctor profile created successfully", created));
    }

    // ----------------------------------------------------------------
    // PUT /doctors/{id}  – update
    // ----------------------------------------------------------------

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(summary = "Update doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Doctor updated successfully",
                        doctorService.updateDoctor(id, request)));
    }

    // ----------------------------------------------------------------
    // PUT /doctors/{id}/status  – toggle active/inactive
    // ----------------------------------------------------------------

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate or deactivate a doctor account")
    public ResponseEntity<ApiResponse<DoctorResponse>> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        active ? "Doctor activated" : "Doctor deactivated",
                        doctorService.toggleStatus(id, active)));
    }

    // ----------------------------------------------------------------
    // DELETE /doctors/{id}  – soft delete
    // ----------------------------------------------------------------

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete a doctor (deactivates linked user account)")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor removed successfully"));
    }
}
