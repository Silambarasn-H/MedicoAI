package com.medicoai.controller;

import com.medicoai.dto.response.ApiResponse;
import com.medicoai.dto.response.PatientResponse;
import com.medicoai.entity.User;
import com.medicoai.exception.BadRequestException;
import com.medicoai.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;

/**
 * REST controller for the authenticated user's own account.
 *
 * <pre>
 * GET  /users/me           – get own profile
 * PUT  /users/me           – update name / phone
 * PUT  /users/me/password  – change password
 * </pre>
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Authenticated user profile management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    // ----------------------------------------------------------------
    // GET /users/me
    // ----------------------------------------------------------------

    @GetMapping("/me")
    @Operation(summary = "Get the currently authenticated user's profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;

        Map<String, Object> profile = Map.of(
                "id",           user.getId(),
                "fullName",     user.getFullName(),
                "email",        user.getEmail(),
                "phone",        user.getPhone() != null ? user.getPhone() : "",
                "role",         user.getRole(),
                "isActive",     user.isActive(),
                "profileImage", user.getProfileImage() != null ? user.getProfileImage() : "",
                "createdAt",    user.getCreatedAt()
        );

        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }

    // ----------------------------------------------------------------
    // PUT /users/me
    // ----------------------------------------------------------------

    @PutMapping("/me")
    @Operation(summary = "Update own profile (name and phone)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateMe(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        userRepository.save(user);

        Map<String, Object> updated = Map.of(
                "id",       user.getId(),
                "fullName", user.getFullName(),
                "email",    user.getEmail(),
                "phone",    user.getPhone() != null ? user.getPhone() : "",
                "role",     user.getRole()
        );

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    // ----------------------------------------------------------------
    // PUT /users/me/password
    // ----------------------------------------------------------------

    @PutMapping("/me/password")
    @Operation(summary = "Change own password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Validate new password strength
        if (request.getNewPassword().length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    // ----------------------------------------------------------------
    // Inner request DTOs (small enough to keep inline)
    // ----------------------------------------------------------------

    @Data
    public static class UpdateProfileRequest {
        @Size(min = 2, max = 100, message = "Full name must be 2–100 characters")
        private String fullName;

        @Size(max = 20)
        private String phone;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 64, message = "New password must be 8–64 characters")
        private String newPassword;
    }
}
