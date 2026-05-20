package com.medicoai.controller;

import com.medicoai.dto.response.ApiResponse;
import com.medicoai.dto.response.AppointmentResponse;
import com.medicoai.dto.response.DoctorResponse;
import com.medicoai.dto.response.PatientResponse;
import com.medicoai.enums.AppointmentStatus;
import com.medicoai.enums.Gender;
import com.medicoai.repository.AppointmentRepository;
import com.medicoai.repository.PatientRepository;
import com.medicoai.repository.UserRepository;
import com.medicoai.service.AppointmentService;
import com.medicoai.service.DoctorService;
import com.medicoai.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * REST controller for Admin-only operations.
 *
 * <pre>
 * GET  /admin/dashboard          – analytics summary
 * GET  /admin/users              – all users list
 * PUT  /admin/users/{id}/status  – activate / deactivate user
 * DELETE /admin/users/{id}       – hard delete user (use with caution)
 * </pre>
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final PatientService     patientService;
    private final DoctorService      doctorService;
    private final AppointmentService appointmentService;
    private final UserRepository     userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;

    // ----------------------------------------------------------------
    // GET /admin/dashboard
    // ----------------------------------------------------------------

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard analytics summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {

        long totalPatients = patientService.countActivePatients();
        long totalUsers    = userRepository.count();
        long totalDoctors  = doctorService.countActiveDoctors();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPatients",          totalPatients);
        stats.put("totalDoctors",           totalDoctors);
        stats.put("totalUsers",             totalUsers);
        stats.put("totalAppointments",      appointmentService.countTotal());
        stats.put("todayAppointments",      appointmentService.countToday());
        stats.put("pendingAppointments",    appointmentService.countByStatus(AppointmentStatus.PENDING));
        stats.put("completedAppointments",  appointmentService.countByStatus(AppointmentStatus.COMPLETED));
        stats.put("cancelledAppointments",  appointmentService.countByStatus(AppointmentStatus.CANCELLED));
        stats.put("totalRevenue",           0.0);
        stats.put("revenueThisMonth",       0.0);
        stats.put("newPatientsThisMonth",   0);

        return ResponseEntity.ok(ApiResponse.success("Dashboard data fetched", stats));
    }

    // ----------------------------------------------------------------
    // GET /admin/users
    // ----------------------------------------------------------------

    @GetMapping("/users")
    @Operation(summary = "Get all users (paginated)")
    public ResponseEntity<ApiResponse<Object>> getAllUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var users    = userRepository.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.success("Users fetched", users));
    }

    // ----------------------------------------------------------------
    // PUT /admin/users/{id}/status
    // ----------------------------------------------------------------

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Activate or deactivate a user account")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        var user = userRepository.findById(id)
                .orElseThrow(() -> new com.medicoai.exception.ResourceNotFoundException("User", "id", id));

        user.setActive(active);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(
                active ? "User activated" : "User deactivated"));
    }

    // ----------------------------------------------------------------
    // DELETE /admin/users/{id}
    // ----------------------------------------------------------------

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Hard-delete a user account (irreversible)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new com.medicoai.exception.ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    // ----------------------------------------------------------------
    // GET /admin/appointments  – convenience alias
    // ----------------------------------------------------------------

    @GetMapping("/appointments")
    @Operation(summary = "Get all appointments (admin view, paginated + filterable)")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<AppointmentResponse>>> getAppointments(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size,
                Sort.by("appointmentDate").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Appointments fetched",
                        appointmentService.getAll(status, search, pageable)));
    }

    // ----------------------------------------------------------------
    // GET /admin/doctors  – convenience alias
    // ----------------------------------------------------------------

    @GetMapping("/doctors")
    @Operation(summary = "Get all doctors (admin view, paginated + searchable)")
    public ResponseEntity<ApiResponse<Page<DoctorResponse>>> getDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialization,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Doctors fetched",
                        doctorService.getAllDoctors(search, specialization, pageable)));
    }

    // ----------------------------------------------------------------
    // GET /admin/reports/summary
    // ----------------------------------------------------------------

    @GetMapping("/reports/summary")
    @Operation(summary = "Get reports summary: totals + monthly breakdown for current year")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportsSummary() {

        long totalPatients     = patientService.countActivePatients();
        long totalDoctors      = doctorService.countActiveDoctors();
        long totalAppointments = appointmentService.countTotal();
        long completed         = appointmentService.countByStatus(AppointmentStatus.COMPLETED);
        long cancelled         = appointmentService.countByStatus(AppointmentStatus.CANCELLED);
        long pending           = appointmentService.countByStatus(AppointmentStatus.PENDING);

        int currentYear = java.time.LocalDate.now().getYear();
        long[] monthlyAppts    = new long[12];
        long[] monthlyPatients = new long[12];

        // Fetch once, then group in memory — avoids 24 separate DB queries
        java.util.List<com.medicoai.entity.Appointment> allAppts =
                appointmentRepository.findAll();
        java.util.List<com.medicoai.entity.Patient> allPatients =
                patientRepository.findAll();

        for (int m = 1; m <= 12; m++) {
            final int month = m;
            monthlyAppts[m - 1] = allAppts.stream()
                    .filter(a -> a.getAppointmentDate() != null
                              && a.getAppointmentDate().getYear()       == currentYear
                              && a.getAppointmentDate().getMonthValue() == month)
                    .count();
            monthlyPatients[m - 1] = allPatients.stream()
                    .filter(p -> p.getCreatedAt() != null
                              && p.getCreatedAt().getYear()       == currentYear
                              && p.getCreatedAt().getMonthValue() == month)
                    .count();
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalPatients",     totalPatients);
        summary.put("totalDoctors",      totalDoctors);
        summary.put("totalAppointments", totalAppointments);
        summary.put("completedAppts",    completed);
        summary.put("cancelledAppts",    cancelled);
        summary.put("pendingAppts",      pending);
        summary.put("monthlyAppts",      monthlyAppts);
        summary.put("monthlyPatients",   monthlyPatients);
        summary.put("year",              currentYear);

        return ResponseEntity.ok(ApiResponse.success("Reports summary fetched", summary));
    }

    // ----------------------------------------------------------------
    // GET /admin/patients  – convenience alias
    // ----------------------------------------------------------------

    @GetMapping("/patients")
    @Operation(summary = "Get all patients (admin view, paginated + searchable)")
    public ResponseEntity<ApiResponse<Page<PatientResponse>>> getPatients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Gender gender,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Patients fetched",
                        patientService.getAllPatients(search, gender, pageable)));
    }
}
